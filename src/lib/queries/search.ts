import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { STATE_MAP, stateAbbrToSlug } from "@/lib/utils/states";
import type { SearchResult } from "@/types/domain";
import type { RaceRow } from "@/types/database";

const MAX_RESULTS = 10;

/** Search across candidates, races, and states */
export async function search(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const results: SearchResult[] = [];

  // 1. Search states by name (synchronous — no DB call needed)
  const lowerQuery = trimmed.toLowerCase();
  for (const [abbr, name] of Object.entries(STATE_MAP)) {
    if (
      name.toLowerCase().includes(lowerQuery) ||
      abbr.toLowerCase() === lowerQuery
    ) {
      results.push({
        type: "state",
        label: name,
        sublabel: abbr,
        slug: stateAbbrToSlug(abbr),
        url: `/state/${stateAbbrToSlug(abbr)}`,
      });
    }
  }

  // If Supabase isn't configured, return state-only results
  if (!isSupabaseConfigured()) {
    return results.slice(0, MAX_RESULTS);
  }

  // 2. Search candidates by name
  const supabase = await createServerSupabaseClient();

  const { data: rawCandidates } = await supabase
    .from("candidates")
    .select("name, slug, party, state, office_sought")
    .ilike("name", `%${trimmed}%`)
    .limit(MAX_RESULTS);

  const candidates = (rawCandidates ?? []) as unknown as {
    name: string;
    slug: string;
    party: string;
    state: string;
    office_sought: string;
  }[];

  for (const c of candidates) {
    results.push({
      type: "candidate",
      label: c.name,
      sublabel: `${c.party} - ${c.state} - ${c.office_sought}`,
      slug: c.slug,
      url: `/candidate/${c.slug}`,
    });
  }

  // 3. Search races by state name or abbreviation
  const { data: rawRaces } = await supabase
    .from("races")
    .select("slug, state, chamber, district, election_year")
    .or(`state.ilike.%${trimmed}%,slug.ilike.%${trimmed}%`)
    .limit(MAX_RESULTS);

  const races = (rawRaces ?? []) as unknown as Pick<
    RaceRow,
    "slug" | "state" | "chamber" | "district" | "election_year"
  >[];

  for (const r of races) {
    const stateName = STATE_MAP[r.state] ?? r.state;
    const chamberLabel =
      r.chamber === "senate"
        ? "Senate"
        : r.chamber === "governor"
          ? "Governor"
          : `House District ${r.district}`;
    results.push({
      type: "race",
      label: `${stateName} ${chamberLabel}`,
      sublabel: `${r.election_year} ${r.chamber === "senate" ? "U.S. Senate" : r.chamber === "governor" ? "Governor" : "U.S. House"}`,
      slug: r.slug,
      url: `/race/${r.slug}`,
    });
  }

  // Sort: exact matches first, then by type priority (state > candidate > race)
  const typePriority: Record<string, number> = {
    state: 0,
    candidate: 1,
    race: 2,
  };

  results.sort((a, b) => {
    // Exact label match goes first
    const aExact = a.label.toLowerCase() === lowerQuery ? 0 : 1;
    const bExact = b.label.toLowerCase() === lowerQuery ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;

    // Starts-with match second
    const aStarts = a.label.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
    const bStarts = b.label.toLowerCase().startsWith(lowerQuery) ? 0 : 1;
    if (aStarts !== bStarts) return aStarts - bStarts;

    // Then by type priority
    return (typePriority[a.type] ?? 99) - (typePriority[b.type] ?? 99);
  });

  // Deduplicate by url
  const seen = new Set<string>();
  const unique: SearchResult[] = [];
  for (const r of results) {
    if (!seen.has(r.url)) {
      seen.add(r.url);
      unique.push(r);
    }
    if (unique.length >= MAX_RESULTS) break;
  }

  return unique;
}
