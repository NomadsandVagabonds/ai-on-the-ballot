import { NextRequest, NextResponse } from "next/server";
import { STATE_MAP, stateAbbrToSlug } from "@/lib/utils/states";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { LookupResult } from "@/types/domain";
import type { RaceRow } from "@/types/database";

export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get("zip");

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Invalid zip code" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_CIVIC_API_KEY;

  // If no API key configured, return a fallback response
  if (!apiKey) {
    return NextResponse.json(
      { error: "Civic API not configured", fallback: true },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/civicinfo/v2/representatives?address=${zip}&key=${apiKey}`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Civic API returned an error" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract state from normalizedInput
    const state: string | undefined = data.normalizedInput?.state;
    if (!state || !STATE_MAP[state]) {
      return NextResponse.json(
        { error: "Could not determine state from zip code" },
        { status: 404 }
      );
    }

    // Extract congressional district from the offices array
    let district: string | null = null;

    if (Array.isArray(data.offices)) {
      for (const office of data.offices) {
        const name: string = office.name ?? "";
        // Look for entries like "U.S. Representative" or containing "Congressional District"
        if (
          name.includes("Congressional District") ||
          name.includes("U.S. Representative")
        ) {
          // The divisionId often contains the district number:
          // ocd-division/country:us/state:tx/cd:7
          const divisionId: string = office.divisionId ?? "";
          const cdMatch = divisionId.match(/\/cd:(\d+)/);
          if (cdMatch) {
            district = cdMatch[1].padStart(2, "0");
          }
          break;
        }
      }
    }

    const stateSlug = stateAbbrToSlug(state);

    // Look up matching races in our database
    const supabase = await createServerSupabaseClient();
    const { data: rawRaces } = await supabase
      .from("races")
      .select("slug, chamber, district")
      .eq("state", state);

    const races = (rawRaces ?? []) as unknown as Pick<
      RaceRow,
      "slug" | "chamber" | "district"
    >[];

    // Build race slugs that match this zip's state/district
    const raceSlugs: string[] = [];
    for (const race of races) {
      // Senate and governor races always match (statewide)
      if (race.chamber === "senate" || race.chamber === "governor") {
        raceSlugs.push(race.slug);
      }
      // House races match only if district matches
      else if (
        race.chamber === "house" &&
        district &&
        race.district === district
      ) {
        raceSlugs.push(race.slug);
      }
    }

    const result: LookupResult = {
      state,
      state_slug: stateSlug,
      district,
      race_slugs: raceSlugs,
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
