import { NextRequest, NextResponse } from "next/server";
import { STATE_MAP, stateAbbrToSlug } from "@/lib/utils/states";
import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { MOCK_RACES } from "@/lib/mock-data";
import type { LookupResult } from "@/types/domain";
import type { RaceRow } from "@/types/database";

/**
 * ZIP-code lookup.
 *
 * Google's Civic Information API `representativeInfoByAddress` endpoint
 * was deprecated on 2025-04-30 — we use Geocodio for ZIP → state +
 * congressional district(s). Sign up (free, 2,500 lookups/day):
 *
 *   https://dash.geocod.io/register   →   set GEOCODIO_API_KEY in .env.local
 *
 * If no key is configured we degrade gracefully: fall back to the
 * zippopotam.us public endpoint (no auth) for state-only resolution so
 * users still land on the right state dossier, just without House-race
 * targeting.
 */

interface GeocodioDistrict {
  name?: string;
  district_number?: number;
  congress_number?: string;
  current?: boolean;
}

interface GeocodioResult {
  address_components?: {
    state?: string;
    zip?: string;
  };
  fields?: {
    congressional_districts?: GeocodioDistrict[];
  };
}

interface GeocodioResponse {
  results?: GeocodioResult[];
}

interface ZippopotamResponse {
  places?: Array<{ "state abbreviation"?: string }>;
}

/** Pad a district number to the convention used in race.district ("01", "07", "12"). */
function padDistrict(n: number | string | null | undefined): string | null {
  if (n === null || n === undefined) return null;
  const asNum = typeof n === "string" ? parseInt(n, 10) : n;
  if (!Number.isFinite(asNum) || asNum <= 0) return null;
  return String(asNum).padStart(2, "0");
}

/** Resolve ZIP → {state, districts[]} via Geocodio. */
async function resolveViaGeocodio(
  zip: string,
  apiKey: string
): Promise<{ state: string; districts: string[] } | null> {
  const url = `https://api.geocod.io/v1.12/geocode?q=${encodeURIComponent(
    zip
  )}&fields=cd&api_key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const data = (await res.json()) as GeocodioResponse;
  const results = data.results ?? [];
  if (results.length === 0) return null;

  // Any result in the response maps to the same ZIP; take the state
  // from the first one that has it.
  const state = results
    .map((r) => r.address_components?.state)
    .find((s) => s && STATE_MAP[s.toUpperCase()]);
  if (!state) return null;

  // Collect + dedupe every current congressional district across all
  // results (ZIPs can legitimately span multiple districts).
  const districtSet = new Set<string>();
  for (const r of results) {
    const cds = r.fields?.congressional_districts ?? [];
    for (const cd of cds) {
      // Prefer `current` === true when the field exists, but if absent
      // fall back to including the district anyway — Geocodio doesn't
      // always populate it.
      if (cd.current === false) continue;
      const padded = padDistrict(cd.district_number ?? null);
      if (padded) districtSet.add(padded);
    }
  }

  return {
    state: state.toUpperCase(),
    districts: [...districtSet].sort(),
  };
}

/** Free fallback: resolve ZIP → {state} with zippopotam.us (no auth). */
async function resolveViaZippopotam(
  zip: string
): Promise<{ state: string; districts: string[] } | null> {
  const res = await fetch(`https://api.zippopotam.us/us/${zip}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as ZippopotamResponse;
  const abbr = data.places?.[0]?.["state abbreviation"]?.toUpperCase();
  if (!abbr || !STATE_MAP[abbr]) return null;
  return { state: abbr, districts: [] };
}

/** Pull races for a state from Supabase or fall back to the mock layer. */
async function getRacesForState(
  stateAbbr: string
): Promise<Pick<RaceRow, "slug" | "chamber" | "district">[]> {
  if (!isSupabaseConfigured()) {
    return MOCK_RACES.filter((r) => r.state === stateAbbr).map((r) => ({
      slug: r.slug,
      chamber: r.chamber,
      district: r.district,
    }));
  }

  const supabase = await createServerSupabaseClient();
  const { data: rawRaces } = await supabase
    .from("races")
    .select("slug, chamber, district")
    .eq("state", stateAbbr);

  return (rawRaces ?? []) as unknown as Pick<
    RaceRow,
    "slug" | "chamber" | "district"
  >[];
}

export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get("zip");

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Invalid zip code" }, { status: 400 });
  }

  const geocodioKey = process.env.GEOCODIO_API_KEY;

  let resolved: { state: string; districts: string[] } | null = null;
  let providerUsed: "geocodio" | "zippopotam" | null = null;

  try {
    if (geocodioKey) {
      resolved = await resolveViaGeocodio(zip, geocodioKey);
      providerUsed = resolved ? "geocodio" : null;
    }
    // Fallback to zippopotam.us if Geocodio isn't configured or failed.
    if (!resolved) {
      resolved = await resolveViaZippopotam(zip);
      if (resolved) providerUsed = "zippopotam";
    }
  } catch {
    return NextResponse.json(
      { error: "Lookup service unavailable. Please try again." },
      { status: 502 }
    );
  }

  if (!resolved) {
    return NextResponse.json(
      { error: "Could not resolve that zip code." },
      { status: 404 }
    );
  }

  const { state, districts } = resolved;
  const stateSlug = stateAbbrToSlug(state);

  // Match races to the ZIP. Statewide races (Senate, Governor) always
  // match. House races only match when the ZIP gave us a district and
  // the race's district is in that set.
  const races = await getRacesForState(state);
  const districtSet = new Set(districts);
  const raceSlugs: string[] = [];
  for (const race of races) {
    if (race.chamber === "senate" || race.chamber === "governor") {
      raceSlugs.push(race.slug);
      continue;
    }
    if (
      race.chamber === "house" &&
      race.district &&
      districtSet.has(padDistrict(race.district) ?? race.district)
    ) {
      raceSlugs.push(race.slug);
    }
  }

  const result: LookupResult = {
    zip,
    state,
    state_slug: stateSlug,
    district: districts.length === 1 ? districts[0] : null,
    districts,
    race_slugs: raceSlugs,
  };

  return NextResponse.json({
    ...result,
    // Purely informational — lets the UI surface a subtle "state-only"
    // notice when we resolved via the zippopotam fallback.
    provider: providerUsed,
  });
}
