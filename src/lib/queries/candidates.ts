import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getMockCandidateBySlug, getMockCandidateSummaries } from "@/lib/mock-data";
import type { Candidate, CandidateSummary } from "@/types/domain";
import type {
  CandidateRow,
  IssueRow,
  PositionRow,
  LegislativeActivityRow,
} from "@/types/database";

/** Get a single candidate by slug with all positions and legislative activity */
export async function getCandidateBySlug(
  slug: string
): Promise<Candidate | null> {
  if (!isSupabaseConfigured()) return getMockCandidateBySlug(slug);

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;

  const candidate = data as unknown as CandidateRow;

  // Fetch positions with joined issue data
  const { data: rawPositions } = await supabase
    .from("positions")
    .select("*, issue:issues(*)")
    .eq("candidate_id", candidate.id);

  // Fetch legislative activity
  const { data: rawActivity } = await supabase
    .from("legislative_activity")
    .select("*")
    .eq("candidate_id", candidate.id)
    .order("date", { ascending: false });

  const positions = (rawPositions ?? []) as unknown as (PositionRow & {
    issue: IssueRow;
  })[];
  const activity = (rawActivity ?? []) as unknown as LegislativeActivityRow[];

  // Sort positions by issue sort_order
  positions.sort((a, b) => a.issue.sort_order - b.issue.sort_order);

  // Until Supabase has a position_sources table, sources come in empty.
  // The mock layer supplies them from the research spreadsheet.
  const positionsWithSources = positions.map((p) => ({ ...p, sources: [] }));

  return {
    ...candidate,
    positions: positionsWithSources,
    legislative_activity: activity,
    general_sources: [],
  };
}

/** Get candidate summaries for a list of candidate IDs */
export async function getCandidateSummaries(
  candidateIds: string[]
): Promise<CandidateSummary[]> {
  if (candidateIds.length === 0) return [];
  if (!isSupabaseConfigured()) return getMockCandidateSummaries(candidateIds);

  const supabase = await createServerSupabaseClient();

  const { data: rawCandidates } = await supabase
    .from("candidates")
    .select("*")
    .in("id", candidateIds);

  const candidates = (rawCandidates ?? []) as unknown as CandidateRow[];
  if (candidates.length === 0) return [];

  // Get total issue count for coverage calculation
  const { count: totalIssues } = await supabase
    .from("issues")
    .select("*", { count: "exact", head: true });

  const issueCount = totalIssues ?? 0;

  // Get position counts per candidate (excluding no_mention)
  const { data: rawPositions } = await supabase
    .from("positions")
    .select("candidate_id, stance, issue_id")
    .in("candidate_id", candidateIds);

  const positions = (rawPositions ?? []) as unknown as Pick<
    PositionRow,
    "candidate_id" | "stance" | "issue_id"
  >[];

  const positionCounts = new Map<string, number>();
  for (const pos of positions) {
    if (pos.stance !== "no_mention") {
      positionCounts.set(
        pos.candidate_id,
        (positionCounts.get(pos.candidate_id) ?? 0) + 1
      );
    }
  }

  // Get all issues sorted by sort_order for stance minibar
  const { data: rawIssues } = await supabase
    .from("issues")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  const sortedIssues = (rawIssues ?? []) as unknown as Pick<
    import("@/types/database").IssueRow,
    "id" | "sort_order"
  >[];

  return candidates.map((c) => {
    const count = positionCounts.get(c.id) ?? 0;
    const candidatePositions = positions.filter((p) => p.candidate_id === c.id);
    const stances = sortedIssues.map((issue) => {
      const pos = candidatePositions.find((p) => p.issue_id === issue.id);
      return pos?.stance ?? ("no_mention" as const);
    });

    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      photo_url: c.photo_url,
      bioguide_id: c.bioguide_id,
      party: c.party,
      state: c.state,
      district: c.district,
      office_sought: c.office_sought,
      is_incumbent: c.is_incumbent,
      total_raised: c.total_raised,
      position_count: count,
      coverage_percentage:
        issueCount > 0 ? Math.round((count / issueCount) * 100) : 0,
      stances,
    };
  });
}

/** Get all candidates for a given state */
export async function getCandidatesByState(
  state: string
): Promise<CandidateSummary[]> {
  if (!isSupabaseConfigured()) {
    const { MOCK_CANDIDATES } = await import("@/lib/mock-data");
    const ids = MOCK_CANDIDATES
      .filter((c) => c.state === state.toUpperCase())
      .map((c) => c.id);
    return getMockCandidateSummaries(ids);
  }

  const supabase = await createServerSupabaseClient();

  const { data: rawCandidates } = await supabase
    .from("candidates")
    .select("id")
    .eq("state", state.toUpperCase());

  const candidates = (rawCandidates ?? []) as unknown as Pick<
    CandidateRow,
    "id"
  >[];
  if (candidates.length === 0) return [];

  return getCandidateSummaries(candidates.map((c) => c.id));
}
