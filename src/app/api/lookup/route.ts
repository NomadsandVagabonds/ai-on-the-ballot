import { NextRequest, NextResponse } from "next/server";
import { STATE_MAP, stateAbbrToSlug } from "@/lib/utils/states";
import {
  createServerSupabaseClient,
  supabaseReadsEnabled,
} from "@/lib/supabase/server";
import { MOCK_RACES } from "@/lib/mock-data";
import { getRacesByState } from "@/lib/queries/races";
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
  /** Fraction of the ZIP that falls in this district (0–1). Geocodio
   *  reports every district a ZIP centroid touches — including thin
   *  edge slivers — so this field is how we distinguish the primary
   *  district from incidental overlap. */
  proportion?: number;
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

  // Pick the district with the highest Geocodio `proportion` across all
  // results. Geocodio returns every district a ZIP touches — including
  // sub-1% slivers where the ZIP barely crosses a boundary (e.g. ZIP
  // 71601 is 99.5% in AR-4 and 0.5% in AR-1). Aggregate proportion by
  // district, then return the dominant one.
  const proportions = new Map<string, number>();
  for (const r of results) {
    const cds = r.fields?.congressional_districts ?? [];
    for (const cd of cds) {
      if (cd.current === false) continue;
      const padded = padDistrict(cd.district_number ?? null);
      if (!padded) continue;
      const p = typeof cd.proportion === "number" ? cd.proportion : 1;
      proportions.set(padded, (proportions.get(padded) ?? 0) + p);
    }
  }

  const ranked = [...proportions.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

  const primary = ranked.length > 0 ? ranked[0][0] : null;
  return {
    state: state.toUpperCase(),
    districts: primary ? [primary] : [],
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
  if (!supabaseReadsEnabled()) {
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
  const skeletonRaces = await getRacesForState(state);
  const districtSet = new Set(districts);
  const matchingSlugs = new Set<string>();
  for (const race of skeletonRaces) {
    if (race.chamber === "senate" || race.chamber === "governor") {
      matchingSlugs.add(race.slug);
      continue;
    }
    if (
      race.chamber === "house" &&
      race.district &&
      districtSet.has(padDistrict(race.district) ?? race.district)
    ) {
      matchingSlugs.add(race.slug);
    }
  }

  // Fetch full races (with candidates) for the matched set so the
  // lookup page can render candidate cards inline rather than just
  // race links. One state-scoped query, then in-memory filter.
  const stateRaces = await getRacesByState(state);
  const races = stateRaces.filter((r) => matchingSlugs.has(r.slug));

  const result: LookupResult = {
    zip,
    state,
    state_slug: stateSlug,
    district: districts.length === 1 ? districts[0] : null,
    districts,
    races,
  };

  return NextResponse.json({
    ...result,
    // Purely informational — lets the UI surface a subtle "state-only"
    // notice when we resolved via the zippopotam fallback.
    provider: providerUsed,
  });
}
