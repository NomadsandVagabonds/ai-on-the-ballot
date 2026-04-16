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
  Stance,
  Confidence,
  Chamber,
  Party,
} from "./database";

// Re-export enums for convenience
export type { Stance, Confidence, Chamber, Party };

/** Candidate with their positions and legislative activity joined */
export interface Candidate extends CandidateRow {
  positions: PositionWithIssue[];
  legislative_activity: LegislativeActivityRow[];
}

/** Candidate summary for cards and comparison views (lighter than full Candidate) */
export interface CandidateSummary {
  id: string;
  name: string;
  slug: string;
  photo_url: string | null;
  party: Party;
  state: string;
  district: string | null;
  office_sought: string;
  is_incumbent: boolean;
  position_count: number;
  coverage_percentage: number;
  /** Ordered stance values for the stance minibar (one per issue, in issue sort order) */
  stances?: Stance[];
}

/** A position with its issue info joined */
export interface PositionWithIssue extends PositionRow {
  issue: IssueRow;
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

/** Zip code lookup result */
export interface LookupResult {
  state: string;
  state_slug: string;
  district: string | null;
  race_slugs: string[];
}
