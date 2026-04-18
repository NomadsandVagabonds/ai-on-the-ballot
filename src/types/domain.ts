/**
 * App-level domain types — composed from database rows with joins and enrichments.
 * These are what components and pages actually consume.
 */

import type {
  CandidateRow,
  RaceRow,
  IssueRow,
  PositionRow,
  LegislativeActivityRow,
  CorrectionRow,
  PositionSource,
  SourceType,
  Stance,
  Confidence,
  Chamber,
  Party,
} from "./database";

// Re-export enums for convenience
export type { Stance, Confidence, Chamber, Party, PositionSource, SourceType };

/** Candidate with their positions and legislative activity joined */
export interface Candidate extends CandidateRow {
  positions: PositionWithIssue[];
  legislative_activity: LegislativeActivityRow[];
  /**
   * Citations the research team gathered about this candidate that aren't
   * yet tied to a specific position row. Rendered as a "Further citations"
   * block on the candidate dossier page.
   */
  general_sources: PositionSource[];
}

/** Candidate summary for cards and comparison views (lighter than full Candidate) */
export interface CandidateSummary {
  id: string;
  name: string;
  slug: string;
  photo_url: string | null;
  /** Bioguide ID — fallback source for incumbent photos */
  bioguide_id: string | null;
  party: Party;
  state: string;
  district: string | null;
  office_sought: string;
  is_incumbent: boolean;
  /** Campaign funds raised in whole dollars. Used to rank-cap a race's comparison view at 5. */
  total_raised: number | null;
  position_count: number;
  coverage_percentage: number;
  /** Ordered stance values for the stance minibar (one per issue, in issue sort order) */
  stances?: Stance[];
}

/** A position with its issue info joined */
export interface PositionWithIssue extends PositionRow {
  issue: IssueRow;
  /**
   * All citations for this position. `source_url` on PositionRow remains
   * as a back-compat first-source URL, but `sources` is canonical.
   */
  sources: PositionSource[];
}

/** A race with its candidates joined */
export interface RaceWithCandidates extends RaceRow {
  candidates: CandidateSummary[];
}

/** State-level aggregation for state pages */
export interface StateData {
  name: string;
  abbreviation: string;
  slug: string;
  races: RaceWithCandidates[];
  candidate_count: number;
}

/** Map-level state info (minimal for performance) */
export interface StateMapEntry {
  abbreviation: string;
  name: string;
  slug: string;
  race_count: number;
  has_data: boolean;
}

/** Comparison grid row — one issue across multiple candidates */
export interface ComparisonRow {
  issue: IssueRow;
  positions: {
    candidate_id: string;
    stance: Stance;
    confidence: Confidence;
    summary: string | null;
    source_url: string | null;
    /** All citations for this (candidate, issue). May be empty. */
    sources: PositionSource[];
  }[];
}

/** Search result types */
export interface SearchResult {
  type: "candidate" | "race" | "state";
  label: string;
  sublabel: string;
  slug: string;
  url: string;
}

/** Correction submission (what the form sends) */
export interface CorrectionSubmission {
  candidate_name: string;
  issue: string;
  proposed_correction: string;
  source_url?: string;
  submitter_email?: string;
}

/** Public correction entry (what the corrections page displays) */
export type PublicCorrection = Pick<
  CorrectionRow,
  "id" | "candidate_name" | "issue" | "nature_of_change" | "previous_value" | "new_value" | "created_at"
>;

/** Issue summary — for homepage issue index */
export interface IssueSummary {
  issue: IssueRow;
  /** Number of candidates with a non-no_mention position on this issue */
  position_count: number;
  /** Breakdown of how candidates are positioned */
  stance_breakdown: Record<Stance, number>;
}

/** A single candidate's position on a specific issue, flattened for the issue roster */
export interface IssuePositionRecord {
  // candidate bits
  candidate_id: string;
  name: string;
  slug: string;
  photo_url: string | null;
  /** Bioguide ID — fallback source for incumbent photos */
  bioguide_id: string | null;
  party: Party;
  state: string;
  district: string | null;
  office_sought: string;
  is_incumbent: boolean;
  // position bits
  stance: Stance;
  confidence: Confidence;
  summary: string | null;
  full_quote: string | null;
  source_url: string | null;
  date_recorded: string | null;
  /** All citations for this position (may be empty) */
  sources: PositionSource[];
}

/** An issue page's data — the issue plus every candidate's record on it */
export interface IssueWithRecords {
  issue: IssueRow;
  records: IssuePositionRecord[];
  /** Total candidates in the DB — for coverage math */
  total_candidates: number;
}

/** Zip code lookup result.
 *
 * A ZIP can span multiple congressional districts; `districts` is the
 * full list, `district` is the single primary district (first result)
 * when the ZIP maps cleanly to one, otherwise null.
 */
export interface LookupResult {
  zip: string;
  state: string;
  state_slug: string;
  /** Primary district if the ZIP resolves to exactly one, else null. */
  district: string | null;
  /** All matching congressional districts for the ZIP. */
  districts: string[];
  /** Race slugs (Senate/Governor + matching House) tracked in our data. */
  race_slugs: string[];
}
