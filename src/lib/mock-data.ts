/**
 * Mock data layer — serves the site when Supabase is not configured.
 *
 * Source of truth: `data/tracker/*.json`, emitted by
 * `scripts/build_tracker_json.py` from `tracker_update.xlsx`.
 *
 * To refresh after new research lands in the spreadsheet:
 *   python3 scripts/build_tracker_json.py
 *
 * This file preserves the same exports / function signatures the rest of
 * the site expects, so query call sites don't need to change when data
 * moves from spreadsheet → Supabase.
 */

import type {
  IssueRow,
  CandidateRow,
  PositionRow,
  LegislativeActivityRow,
  RaceRow,
  RaceCandidateRow,
  PositionSource,
  Stance,
} from "@/types/database";
import type {
  Candidate,
  CandidateSummary,
  RaceWithCandidates,
  ComparisonRow,
  PositionWithIssue,
  PublicCorrection,
  SearchResult,
  IssueSummary,
  IssueWithRecords,
} from "@/types/domain";

import issuesJson from "../../data/tracker/issues.json";
import candidatesJson from "../../data/tracker/candidates.json";
import racesJson from "../../data/tracker/races.json";
import raceCandidatesJson from "../../data/tracker/race_candidates.json";
import positionsJson from "../../data/tracker/positions.json";
import correctionsJson from "../../data/tracker/corrections.json";

// ---------------------------------------------------------------------------
// Raw imports shaped to our TS types
// ---------------------------------------------------------------------------

export const MOCK_ISSUES: IssueRow[] = issuesJson as IssueRow[];

/** Internal — the raw JSON has `general_sources` which belongs on Candidate
 *  (domain), not CandidateRow (DB shape). Strip it for the row list. */
interface RawCandidate extends CandidateRow {
  general_sources: PositionSource[];
}
const RAW_CANDIDATES: RawCandidate[] = candidatesJson as RawCandidate[];

export const MOCK_CANDIDATES: CandidateRow[] = RAW_CANDIDATES.map((c) => {
  const { general_sources: _gs, ...row } = c;
  void _gs;
  return row;
});

const GENERAL_SOURCES_BY_CAND = new Map<string, PositionSource[]>();
for (const c of RAW_CANDIDATES) {
  if (c.general_sources?.length) {
    GENERAL_SOURCES_BY_CAND.set(c.id, c.general_sources);
  }
}

export const MOCK_RACES: RaceRow[] = racesJson as RaceRow[];
export const MOCK_RACE_CANDIDATES: RaceCandidateRow[] =
  raceCandidatesJson as RaceCandidateRow[];

/** Positions carry an embedded `sources` array sourced from the spreadsheet. */
interface RawPosition extends PositionRow {
  sources: PositionSource[];
}
const RAW_POSITIONS: RawPosition[] = positionsJson as RawPosition[];

const ISSUE_BY_ID = new Map(MOCK_ISSUES.map((i) => [i.id, i]));

export const MOCK_POSITIONS: (PositionRow & {
  issue: IssueRow;
  sources: PositionSource[];
})[] = RAW_POSITIONS.flatMap((p) => {
  const issue = ISSUE_BY_ID.get(p.issue_id);
  if (!issue) return [];
  return [{ ...p, issue, sources: p.sources ?? [] }];
});

/**
 * Legislative activity is not in the current research spreadsheet; keep the
 * structure in place so the UI renders its empty-state as designed.
 */
export const MOCK_LEGISLATIVE_ACTIVITY: LegislativeActivityRow[] = [];

export const MOCK_CORRECTIONS: PublicCorrection[] =
  correctionsJson as PublicCorrection[];

export function getMockCorrections(): PublicCorrection[] {
  return MOCK_CORRECTIONS;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildSummary(c: CandidateRow): CandidateSummary {
  const candidatePositions = MOCK_POSITIONS.filter(
    (p) => p.candidate_id === c.id && p.stance !== "no_mention"
  );
  const posCount = candidatePositions.length;
  const issueCount = MOCK_ISSUES.length;

  const stances = MOCK_ISSUES.map((issue) => {
    const pos = MOCK_POSITIONS.find(
      (p) => p.candidate_id === c.id && p.issue_id === issue.id
    );
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
    position_count: posCount,
    coverage_percentage:
      issueCount > 0 ? Math.round((posCount / issueCount) * 100) : 0,
    stances,
  };
}

// ---------------------------------------------------------------------------
// Query helpers (same signatures as before)
// ---------------------------------------------------------------------------

export function getMockCandidateBySlug(slug: string): Candidate | null {
  const row = MOCK_CANDIDATES.find((c) => c.slug === slug);
  if (!row) return null;

  const positions: PositionWithIssue[] = MOCK_POSITIONS
    .filter((p) => p.candidate_id === row.id)
    .sort((a, b) => a.issue.sort_order - b.issue.sort_order)
    .map((p) => ({
      ...p,
      issue: p.issue,
      sources: p.sources,
    }));

  const activity = MOCK_LEGISLATIVE_ACTIVITY
    .filter((a) => a.candidate_id === row.id)
    .sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return b.date.localeCompare(a.date);
    });

  return {
    ...row,
    positions,
    legislative_activity: activity,
    general_sources: GENERAL_SOURCES_BY_CAND.get(row.id) ?? [],
  };
}

export function getMockCandidateSummaries(candidateIds: string[]): CandidateSummary[] {
  return MOCK_CANDIDATES
    .filter((c) => candidateIds.includes(c.id))
    .map(buildSummary);
}

export function getMockRacesByState(stateAbbr: string): RaceWithCandidates[] {
  const upperAbbr = stateAbbr.toUpperCase();
  const stateRaces = MOCK_RACES.filter((r) => r.state === upperAbbr);
  if (stateRaces.length === 0) return [];

  const chamberOrder: Record<string, number> = { senate: 0, governor: 1, house: 2 };

  return stateRaces
    .map((race) => {
      const candidateIds = MOCK_RACE_CANDIDATES
        .filter((rc) => rc.race_id === race.id)
        .map((rc) => rc.candidate_id);

      const candidates = MOCK_CANDIDATES
        .filter((c) => candidateIds.includes(c.id))
        .map(buildSummary)
        .sort((a, b) => a.name.localeCompare(b.name));

      return { ...race, candidates };
    })
    .sort((a, b) => {
      const chamberDiff =
        (chamberOrder[a.chamber] ?? 99) - (chamberOrder[b.chamber] ?? 99);
      if (chamberDiff !== 0) return chamberDiff;
      // Numeric sort on district so CD-02 comes before CD-10
      const da = parseInt(a.district ?? "0", 10);
      const db = parseInt(b.district ?? "0", 10);
      if (!Number.isNaN(da) && !Number.isNaN(db) && da !== db) {
        return da - db;
      }
      return (a.district ?? "").localeCompare(b.district ?? "");
    });
}

export function getMockRaceBySlug(slug: string): RaceWithCandidates | null {
  const race = MOCK_RACES.find((r) => r.slug === slug);
  if (!race) return null;

  const candidateIds = MOCK_RACE_CANDIDATES
    .filter((rc) => rc.race_id === race.id)
    .map((rc) => rc.candidate_id);

  const candidates = MOCK_CANDIDATES
    .filter((c) => candidateIds.includes(c.id))
    .map(buildSummary)
    .sort((a, b) => a.name.localeCompare(b.name));

  return { ...race, candidates };
}

export function getMockComparisonData(candidateIds: string[]): ComparisonRow[] {
  if (candidateIds.length === 0) return [];

  return MOCK_ISSUES.map((issue) => ({
    issue,
    positions: candidateIds.map((candidateId) => {
      const pos = MOCK_POSITIONS.find(
        (p) => p.candidate_id === candidateId && p.issue_id === issue.id
      );
      return {
        candidate_id: candidateId,
        stance: pos?.stance ?? "no_mention",
        confidence: pos?.confidence ?? "low",
        summary: pos?.summary ?? null,
        source_url: pos?.source_url ?? null,
        sources: pos?.sources ?? [],
      };
    }),
  }));
}

export function getMockPositionsForCandidate(
  candidateId: string
): PositionWithIssue[] {
  return MOCK_POSITIONS
    .filter((p) => p.candidate_id === candidateId)
    .sort((a, b) => a.issue.sort_order - b.issue.sort_order)
    .map((p) => ({ ...p, issue: p.issue, sources: p.sources }));
}

export function getMockAllIssuesWithCounts(): IssueSummary[] {
  return MOCK_ISSUES.map((issue) => {
    const breakdown: Record<Stance, number> = {
      support: 0,
      oppose: 0,
      mixed: 0,
      unclear: 0,
      no_mention: 0,
    };
    for (const p of MOCK_POSITIONS) {
      if (p.issue_id === issue.id) breakdown[p.stance] += 1;
    }
    const on_record =
      breakdown.support + breakdown.oppose + breakdown.mixed;
    return {
      issue,
      position_count: on_record,
      stance_breakdown: breakdown,
    };
  });
}

export function getMockIssueBySlug(slug: string): IssueWithRecords | null {
  const issue = MOCK_ISSUES.find((i) => i.slug === slug);
  if (!issue) return null;

  const records: IssueWithRecords["records"] = MOCK_CANDIDATES.map((c) => {
    const pos = MOCK_POSITIONS.find(
      (p) => p.candidate_id === c.id && p.issue_id === issue.id
    );
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
      sources: pos?.sources ?? [],
      researched: pos?.researched ?? false,
    };
  });

  records.sort((a, b) => {
    const lastA = a.name.split(" ").slice(-1)[0];
    const lastB = b.name.split(" ").slice(-1)[0];
    return lastA.localeCompare(lastB);
  });

  return {
    issue,
    records,
    total_candidates: MOCK_CANDIDATES.length,
  };
}

export function searchMockData(query: string): SearchResult[] {
  const lower = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const c of MOCK_CANDIDATES) {
    if (c.name.toLowerCase().includes(lower)) {
      results.push({
        type: "candidate",
        label: c.name,
        sublabel: `${c.party} - ${c.state} - ${c.office_sought}`,
        slug: c.slug,
        url: `/candidate/${c.slug}`,
      });
    }
  }

  for (const r of MOCK_RACES) {
    if (
      r.slug.toLowerCase().includes(lower) ||
      r.state.toLowerCase().includes(lower)
    ) {
      const chamberLabel =
        r.chamber === "senate"
          ? "Senate"
          : r.chamber === "governor"
            ? "Governor"
            : `House District ${r.district}`;
      results.push({
        type: "race",
        label: `${r.state} ${chamberLabel}`,
        sublabel: `${r.election_year} ${
          r.chamber === "senate"
            ? "U.S. Senate"
            : r.chamber === "governor"
              ? "Governor"
              : "U.S. House"
        }`,
        slug: r.slug,
        url: `/race/${r.slug}`,
      });
    }
  }

  return results.slice(0, 10);
}
