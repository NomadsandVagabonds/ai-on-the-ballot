import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getRacesByState } from "./races";
import {
  STATE_MAP,
  stateSlugToAbbr,
  stateSlugToName,
  stateAbbrToSlug,
} from "@/lib/utils/states";
import type { StateData, StateMapEntry } from "@/types/domain";

/** Launch states for demo/preview when Supabase isn't configured */
const DEMO_STATES = new Set(["AR", "NC", "TX", "MS", "IL"]);
const DEMO_RACE_COUNTS: Record<string, number> = {
  TX: 4, NC: 3, IL: 4, AR: 3, MS: 3,
};

/** Get state-level data including all races */
export async function getStateData(
  stateSlug: string
): Promise<StateData | null> {
  const abbr = stateSlugToAbbr(stateSlug);
  const name = stateSlugToName(stateSlug);

  if (!abbr || !name) return null;

  if (!isSupabaseConfigured()) {
    return {
      name,
      abbreviation: abbr,
      slug: stateSlug,
      races: [],
      candidate_count: 0,
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
  if (!isSupabaseConfigured()) {
    // Return demo data so the site is reviewable without a database
    return Object.entries(STATE_MAP).map(([abbr, name]) => {
      const isDemo = DEMO_STATES.has(abbr);
      return {
        abbreviation: abbr,
        name,
        slug: stateAbbrToSlug(abbr),
        race_count: isDemo ? (DEMO_RACE_COUNTS[abbr] ?? 2) : 0,
        has_data: isDemo,
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
