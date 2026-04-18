import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import {
  getMockAllIssuesWithCounts,
  getMockIssueBySlug,
} from "@/lib/mock-data";
import type { IssueSummary, IssueWithRecords } from "@/types/domain";
import type {
  CandidateRow,
  IssueRow,
  PositionRow,
  Stance,
} from "@/types/database";

const EMPTY_BREAKDOWN: Record<Stance, number> = {
  support: 0,
  oppose: 0,
  mixed: 0,
  unclear: 0,
  no_mention: 0,
};

/**
 * Return all issues with aggregated coverage counts.
 * One row per issue, sorted by `sort_order`.
 */
export async function getAllIssuesWithCounts(): Promise<IssueSummary[]> {
  if (!isSupabaseConfigured()) return getMockAllIssuesWithCounts();

  const supabase = await createServerSupabaseClient();

  const { data: rawIssues } = await supabase
    .from("issues")
    .select("*")
    .order("sort_order", { ascending: true });
  const issues = (rawIssues ?? []) as unknown as IssueRow[];
  if (issues.length === 0) return [];

  const { data: rawPositions } = await supabase
    .from("positions")
    .select("issue_id, stance");
  const positions = (rawPositions ?? []) as unknown as Pick<
    PositionRow,
    "issue_id" | "stance"
  >[];

  const byIssue = new Map<string, Record<Stance, number>>();
  for (const p of positions) {
    if (!byIssue.has(p.issue_id)) {
      byIssue.set(p.issue_id, { ...EMPTY_BREAKDOWN });
    }
    byIssue.get(p.issue_id)![p.stance] += 1;
  }

  return issues.map((issue) => {
    const breakdown = byIssue.get(issue.id) ?? { ...EMPTY_BREAKDOWN };
    // "On record" = definite stance (support/oppose/mixed).
    // Unclear + no_mention do not count toward the record.
    const on_record =
      breakdown.support + breakdown.oppose + breakdown.mixed;
    return {
      issue,
      position_count: on_record,
      stance_breakdown: breakdown,
    };
  });
}

/**
 * Return a single issue with every candidate's position on it,
 * flattened into records for client-side filtering.
 */
export async function getIssueBySlug(
  slug: string
): Promise<IssueWithRecords | null> {
  if (!isSupabaseConfigured()) return getMockIssueBySlug(slug);

  const supabase = await createServerSupabaseClient();

  const { data: rawIssue } = await supabase
    .from("issues")
    .select("*")
    .eq("slug", slug)
    .single();
  const issue = (rawIssue as unknown as IssueRow) ?? null;
  if (!issue) return null;

  const { data: rawPositions } = await supabase
    .from("positions")
    .select("*")
    .eq("issue_id", issue.id);
  const positions = (rawPositions ?? []) as unknown as PositionRow[];

  // Pull every candidate — we want even candidates with no recorded position
  // so the "no_mention" filter works.
  const { data: rawCandidates } = await supabase.from("candidates").select("*");
  const candidates = (rawCandidates ?? []) as unknown as CandidateRow[];

  const posByCandidate = new Map<string, PositionRow>();
  for (const p of positions) {
    posByCandidate.set(p.candidate_id, p);
  }

  const records = candidates.map((c): IssueWithRecords["records"][number] => {
    const pos = posByCandidate.get(c.id);
    return {
      candidate_id: c.id,
      name: c.name,
      slug: c.slug,
      photo_url: c.photo_url,
      bioguide_id: c.bioguide_id,
      party: c.party,
      state: c.state,
      district: c.district,
      office_sought: c.office_sought,
      is_incumbent: c.is_incumbent,
      stance: pos?.stance ?? "no_mention",
      confidence: pos?.confidence ?? "low",
      summary: pos?.summary ?? null,
      full_quote: pos?.full_quote ?? null,
      source_url: pos?.source_url ?? null,
      date_recorded: pos?.date_recorded ?? null,
      sources: [],
    };
  });

  // Alphabetical by last name (nonpartisan rule)
  records.sort((a, b) => {
    const lastA = a.name.split(" ").slice(-1)[0];
    const lastB = b.name.split(" ").slice(-1)[0];
    return lastA.localeCompare(lastB);
  });

  return {
    issue,
    records,
    total_candidates: candidates.length,
  };
}
