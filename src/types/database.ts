/** Supabase row types — mirrors the database schema */

export type Party = "D" | "R" | "I" | "L" | "G";
export type Chamber = "senate" | "house" | "governor";
export type RaceType = "regular" | "special";
export type Stance = "support" | "oppose" | "mixed" | "unclear" | "no_mention";
export type Confidence = "high" | "medium" | "low";
export type LegislativeActivityType =
  | "bill_sponsored"
  | "bill_cosponsored"
  | "vote"
  | "hearing"
  | "letter"
  | "statement";

export interface CandidateRow {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  slug: string;
  photo_url: string | null;
  party: Party;
  state: string;
  district: string | null;
  office_sought: string;
  committee_assignments: string[];
  election_year: number;
  fec_id: string | null;
  /**
   * Library of Congress Bioguide ID (e.g. "C001098" for Cruz).
   * When present and photo_url is null, the frontend falls back to the
   * public-domain portrait hosted at unitedstates.github.io/images/congress.
   * Only incumbents have bioguide IDs; challengers are null.
   */
  bioguide_id: string | null;
  is_incumbent: boolean;
  /** Campaign funds raised, in whole dollars. Source: FEC filings. */
  total_raised: number | null;
  created_at: string;
  updated_at: string;
}

/** Type of citation source (statement, legislation, survey, etc.) */
export type SourceType =
  | "statement"
  | "legislation"
  | "survey"
  | "social_media"
  | "news";

/** A single citation attached to a position or a candidate. */
export interface PositionSource {
  type: SourceType;
  title: string | null;
  url: string | null;
  /** ISO date (YYYY-MM-DD) */
  date: string | null;
  /** Pull-quote from the source, suitable for inline display. */
  excerpt: string | null;
}

export interface RaceRow {
  id: string;
  slug: string;
  state: string;
  chamber: Chamber;
  district: string | null;
  election_year: number;
  race_type: RaceType;
  created_at: string;
  updated_at: string;
}

export interface IssueRow {
  id: string;
  slug: string;
  display_name: string;
  description: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PositionRow {
  id: string;
  candidate_id: string;
  issue_id: string;
  stance: Stance;
  confidence: Confidence;
  summary: string | null;
  full_quote: string | null;
  source_url: string | null;
  date_recorded: string | null;
  last_updated: string;
  created_at: string;
  updated_at: string;
  /**
   * True once a researcher has actively investigated this candidate × issue
   * pair. Lets the UI distinguish "we looked and found no public stance"
   * (researched + no_mention) from "we haven't gotten to this one yet"
   * (placeholder no_mention from initial ingest).
   */
  researched?: boolean;
}

export interface LegislativeActivityRow {
  id: string;
  candidate_id: string;
  activity_type: LegislativeActivityType;
  title: string;
  description: string | null;
  source_url: string | null;
  date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CorrectionRow {
  id: string;
  candidate_name: string;
  issue: string;
  proposed_correction: string;
  source_url: string | null;
  submitter_email: string | null;
  status: "pending" | "accepted" | "rejected";
  nature_of_change: string | null;
  previous_value: string | null;
  new_value: string | null;
  is_public: boolean;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Junction table: which candidates are in which race */
export interface RaceCandidateRow {
  race_id: string;
  candidate_id: string;
}

/** Database schema type for Supabase client */
export interface Database {
  public: {
    Tables: {
      candidates: {
        Row: CandidateRow;
        Insert: Omit<CandidateRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<CandidateRow, "id" | "created_at" | "updated_at">>;
      };
      races: {
        Row: RaceRow;
        Insert: Omit<RaceRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<RaceRow, "id" | "created_at" | "updated_at">>;
      };
      issues: {
        Row: IssueRow;
        Insert: Omit<IssueRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<IssueRow, "id" | "created_at" | "updated_at">>;
      };
      positions: {
        Row: PositionRow;
        Insert: Omit<PositionRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<PositionRow, "id" | "created_at" | "updated_at">>;
      };
      legislative_activity: {
        Row: LegislativeActivityRow;
        Insert: Omit<LegislativeActivityRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<LegislativeActivityRow, "id" | "created_at" | "updated_at">>;
      };
      corrections_log: {
        Row: CorrectionRow;
        Insert: Omit<CorrectionRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<CorrectionRow, "id" | "created_at" | "updated_at">>;
      };
      race_candidates: {
        Row: RaceCandidateRow;
        Insert: RaceCandidateRow;
        Update: Partial<RaceCandidateRow>;
      };
    };
  };
}
