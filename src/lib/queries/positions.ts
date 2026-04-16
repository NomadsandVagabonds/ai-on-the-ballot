import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ComparisonRow, PositionWithIssue } from "@/types/domain";
import type { IssueRow, PositionRow } from "@/types/database";

/** Get all positions for a candidate, joined with issue details */
export async function getPositionsForCandidate(
  candidateId: string
): Promise<PositionWithIssue[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createServerSupabaseClient();

  const { data: rawPositions } = await supabase
    .from("positions")
    .select("*, issue:issues(*)")
    .eq("candidate_id", candidateId);

  const positions = (rawPositions ?? []) as unknown as (PositionRow & {
    issue: IssueRow;
  })[];

  // Sort by issue sort_order
  return positions.sort((a, b) => a.issue.sort_order - b.issue.sort_order);
}

/** Build comparison rows for a race (for the side-by-side grid) */
export async function getComparisonData(
  candidateIds: string[]
): Promise<ComparisonRow[]> {
  if (candidateIds.length === 0) return [];
  if (!isSupabaseConfigured()) return [];

  const supabase = await createServerSupabaseClient();

  // Get all issues sorted by sort_order
  const { data: rawIssues } = await supabase
    .from("issues")
    .select("*")
    .order("sort_order");

  const issues = (rawIssues ?? []) as unknown as IssueRow[];
  if (issues.length === 0) return [];

  // Get all positions for the given candidates in one query
  const { data: rawPositions } = await supabase
    .from("positions")
    .select("*")
    .in("candidate_id", candidateIds);

  const positions = (rawPositions ?? []) as unknown as PositionRow[];

  // Index positions by issue_id + candidate_id for fast lookup
  const positionMap = new Map<string, PositionRow>();
  for (const pos of positions) {
    positionMap.set(`${pos.issue_id}:${pos.candidate_id}`, pos);
  }

  // Build one ComparisonRow per issue
  return issues.map((issue) => ({
    issue,
    positions: candidateIds.map((candidateId) => {
      const pos = positionMap.get(`${issue.id}:${candidateId}`);
      return {
        candidate_id: candidateId,
        stance: pos?.stance ?? "no_mention",
        confidence: pos?.confidence ?? "low",
        summary: pos?.summary ?? null,
        source_url: pos?.source_url ?? null,
      };
    }),
  }));
}
