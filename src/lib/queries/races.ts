import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getCandidateSummaries } from "./candidates";
import type { RaceWithCandidates } from "@/types/domain";
import type { RaceRow, RaceCandidateRow } from "@/types/database";

/** Chamber sort priority: senate first, then governor, then house */
const CHAMBER_ORDER: Record<string, number> = {
  senate: 0,
  governor: 1,
  house: 2,
};

/** Get all races for a state with their candidates */
export async function getRacesByState(
  stateAbbr: string
): Promise<RaceWithCandidates[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createServerSupabaseClient();

  const { data: rawRaces } = await supabase
    .from("races")
    .select("*")
    .eq("state", stateAbbr.toUpperCase())
    .order("chamber")
    .order("district");

  const races = (rawRaces ?? []) as unknown as RaceRow[];
  if (races.length === 0) return [];

  return enrichRacesWithCandidates(races);
}

/** Get a single race by slug with candidates and their positions */
export async function getRaceBySlug(
  slug: string
): Promise<RaceWithCandidates | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("races")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  const race = data as unknown as RaceRow;
  const result = await enrichRacesWithCandidates([race]);
  return result[0] ?? null;
}

/** Attach candidate summaries to a list of races */
async function enrichRacesWithCandidates(
  races: RaceRow[]
): Promise<RaceWithCandidates[]> {
  const supabase = await createServerSupabaseClient();

  const raceIds = races.map((r) => r.id);

  // Get all junction rows for these races in one query
  const { data: rawJunctions } = await supabase
    .from("race_candidates")
    .select("race_id, candidate_id")
    .in("race_id", raceIds);

  const junctions = (rawJunctions ?? []) as unknown as RaceCandidateRow[];

  if (junctions.length === 0) {
    return races.map((r) => ({ ...r, candidates: [] }));
  }

  // Collect all unique candidate IDs
  const allCandidateIds = [...new Set(junctions.map((j) => j.candidate_id))];

  // Fetch summaries for all candidates at once
  const summaries = await getCandidateSummaries(allCandidateIds);
  const summaryMap = new Map(summaries.map((s) => [s.id, s]));

  // Build a map of race_id -> candidate summaries
  const raceCandidateMap = new Map<string, typeof summaries>();
  for (const j of junctions) {
    const list = raceCandidateMap.get(j.race_id) ?? [];
    const summary = summaryMap.get(j.candidate_id);
    if (summary) list.push(summary);
    raceCandidateMap.set(j.race_id, list);
  }

  // Assemble final result, sorted by chamber priority then district
  return races
    .map((race) => ({
      ...race,
      candidates: (raceCandidateMap.get(race.id) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    }))
    .sort((a, b) => {
      const chamberDiff =
        (CHAMBER_ORDER[a.chamber] ?? 99) - (CHAMBER_ORDER[b.chamber] ?? 99);
      if (chamberDiff !== 0) return chamberDiff;
      return (a.district ?? "").localeCompare(b.district ?? "");
    });
}
