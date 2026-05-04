import { createServerSupabaseClient, supabaseReadsEnabled } from "@/lib/supabase/server";
import { getRacesByState } from "./races";
import { getMockRacesByState, MOCK_RACES } from "@/lib/mock-data";
import {
  STATE_MAP,
  stateSlugToAbbr,
  stateSlugToName,
  stateAbbrToSlug,
} from "@/lib/utils/states";
import type { StateData, StateMapEntry } from "@/types/domain";

/** Get state-level data including all races */
export async function getStateData(
  stateSlug: string
): Promise<StateData | null> {
  const abbr = stateSlugToAbbr(stateSlug);
  const name = stateSlugToName(stateSlug);

  if (!abbr || !name) return null;

  if (!supabaseReadsEnabled()) {
    const races = getMockRacesByState(abbr);
    const candidateCount = races.reduce(
      (sum, race) => sum + race.candidates.length,
      0
    );
    return {
      name,
      abbreviation: abbr,
      slug: stateSlug,
      races,
      candidate_count: candidateCount,
    };
  }

  const races = await getRacesByState(abbr);

  const candidateCount = races.reduce(
    (sum, race) => sum + race.candidates.length,
    0
  );

  return {
    name,
    abbreviation: abbr,
    slug: stateSlug,
    races,
    candidate_count: candidateCount,
  };
}

/** Get map-level data for all states (minimal, for performance) */
export async function getAllStatesForMap(): Promise<StateMapEntry[]> {
  if (!supabaseReadsEnabled()) {
    // Build a tally directly from the mock race set so counts reflect
    // whatever's currently in data/tracker/.
    const tally = new Map<string, number>();
    for (const race of MOCK_RACES) {
      tally.set(race.state, (tally.get(race.state) ?? 0) + 1);
    }
    return Object.entries(STATE_MAP).map(([abbr, name]) => {
      const count = tally.get(abbr) ?? 0;
      return {
        abbreviation: abbr,
        name,
        slug: stateAbbrToSlug(abbr),
        race_count: count,
        has_data: count > 0,
      };
    });
  }

  const supabase = await createServerSupabaseClient();

  // Count races per state in one query
  const { data: rawRaces } = await supabase.from("races").select("state");

  const races = (rawRaces ?? []) as unknown as { state: string }[];

  // Tally race counts by state abbreviation
  const raceCounts = new Map<string, number>();
  for (const race of races) {
    raceCounts.set(race.state, (raceCounts.get(race.state) ?? 0) + 1);
  }

  // Build an entry for every state, marking has_data based on race count
  return Object.entries(STATE_MAP).map(([abbr, name]) => {
    const count = raceCounts.get(abbr) ?? 0;
    return {
      abbreviation: abbr,
      name,
      slug: stateAbbrToSlug(abbr),
      race_count: count,
      has_data: count > 0,
    };
  });
}
