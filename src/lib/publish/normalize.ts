/**
 * Normalize raw spreadsheet rows into Supabase upsert payloads.
 *
 * Mirrors the essential logic of scripts/extract_trackerv3.py so that
 * Vinaya's Apps Script can POST the raw sheet rows (verbatim, minimal
 * client-side processing) and the server is the single source of truth
 * for slug rules, party normalization, stance enums, etc.
 */

import { createHash } from "node:crypto";

export type RawCandidateRow = {
  id?: string | number | null;
  name?: string | null;
  state?: string | null;
  party?: string | null;
  seat?: string | null;
  district?: string | number | null;
  incumbency?: string | null;
  "amount raised"?: number | string | null;
  notes?: string | null;
};

export type RawPositionRow = {
  id?: string | null;
  candidateId?: string | null;
  topicId?: string | null;
  stance?: string | null;
  confidence?: string | null;
  summary?: string | null;
  lastUpdated?: string | null;
  coder?: string | null;
  notes?: string | null;
};

export type RawTopicRow = {
  id?: string | null;
  name?: string | null;
  shortName?: string | null;
  description?: string | null;
  includes?: string | null;
  excludes?: string | null;
};

export type RawSourceRow = {
  positionId?: string | null;
  type?: string | null;
  title?: string | null;
  url?: string | null;
  date?: string | null;
  excerpt?: string | null;
};

export interface PublishPayload {
  candidates: RawCandidateRow[];
  topics: RawTopicRow[];
  positions: RawPositionRow[];
  sources?: RawSourceRow[];
}

// ---------------------------------------------------------------------------
// Normalization tables — kept in lockstep with extract_trackerv3.py
// ---------------------------------------------------------------------------

const STANCE_MAP: Record<string, string> = {
  support: "support",
  oppose: "oppose",
  mixed: "mixed",
  unclear: "unclear",
  "no mention": "no_mention",
  no_mention: "no_mention",
};

const CONFIDENCE_MAP: Record<string, string> = {
  high: "high",
  medium: "medium",
  low: "low",
  "n/a": "medium",
};

const PARTY_MAP: Record<string, string> = {
  democratic: "D",
  democrat: "D",
  d: "D",
  republican: "R",
  r: "R",
  independent: "I",
  i: "I",
  libertarian: "L",
  l: "L",
  green: "G",
  g: "G",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clean(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

function normStance(s: string | null | undefined): string {
  const k = (s ?? "").trim().toLowerCase();
  return STANCE_MAP[k] ?? "no_mention";
}

function normConfidence(s: string | null | undefined): string {
  const k = (s ?? "").trim().toLowerCase();
  return CONFIDENCE_MAP[k] ?? "medium";
}

function normParty(s: string | null | undefined): string {
  const k = (s ?? "").trim().toLowerCase();
  return PARTY_MAP[k] ?? "I";
}

function slugify(s: string | null | undefined): string {
  return (s ?? "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: parts[0] };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function chamberAndDistrict(
  seat: string | null,
  district: unknown
): { chamber: "senate" | "house"; district: string | null } {
  const s = (seat ?? "").trim().toLowerCase();
  if (s === "senate") return { chamber: "senate", district: null };
  let d: string;
  if (district === null || district === undefined) d = "";
  else if (typeof district === "number") d = String(Math.trunc(district));
  else d = String(district).trim();
  const m = d.match(/(\d+)/);
  return { chamber: "house", district: m ? m[1].padStart(2, "0") : null };
}

const NS = "4a6f7572-6e61-6c2d-4f66-2d526563726f"; // matches build_tracker_json.py UUID namespace
function uuid5(name: string): string {
  // RFC 4122 v5 (SHA-1 namespace)
  const nsBytes = NS.replace(/-/g, "").match(/.{2}/g)!.map((h) => parseInt(h, 16));
  const hash = createHash("sha1");
  hash.update(Buffer.from(nsBytes));
  hash.update(name, "utf8");
  const bytes = hash.digest();
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
  const hex = Array.from(bytes.subarray(0, 16))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function safeDate(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v);
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null;
}

// ---------------------------------------------------------------------------
// Output shapes — match Supabase schema
// ---------------------------------------------------------------------------

export interface IssueOut {
  id: string;
  slug: string;
  display_name: string;
  description: string;
  sort_order: number;
  icon: string | null;
}

export interface CandidateOut {
  id: string;
  slug: string;
  name: string;
  first_name: string;
  last_name: string;
  party: string;
  state: string;
  district: string | null;
  office_sought: string;
  committee_assignments: string[];
  election_year: number;
  fec_id: string | null;
  bioguide_id: string | null;
  photo_url: string | null;
  is_incumbent: boolean;
  total_raised: number | null;
}

export interface RaceOut {
  id: string;
  slug: string;
  state: string;
  chamber: "senate" | "house" | "governor";
  district: string | null;
  election_year: number;
  race_type: "regular" | "special";
}

export interface RaceCandidateOut {
  race_id: string;
  candidate_id: string;
}

export interface PositionOut {
  id: string;
  candidate_id: string;
  issue_id: string;
  stance: string;
  confidence: string;
  summary: string | null;
  full_quote: string | null;
  source_url: string | null;
  date_recorded: string | null;
}

export interface NormalizedBundle {
  issues: IssueOut[];
  candidates: CandidateOut[];
  races: RaceOut[];
  race_candidates: RaceCandidateOut[];
  positions: PositionOut[];
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Excluded states (mirrors EXCLUDED_STATES in build_tracker_json.py)
// ---------------------------------------------------------------------------

const EXCLUDED_STATES = new Set(["CA"]);

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function normalize(payload: PublishPayload): NormalizedBundle {
  const warnings: string[] = [];
  const ELECTION_YEAR = 2026;

  // Issues
  const issues: IssueOut[] = [];
  for (let i = 0; i < payload.topics.length; i++) {
    const t = payload.topics[i];
    const slug = clean(t.id);
    if (!slug) continue;
    issues.push({
      id: uuid5(`issue:${slug}`),
      slug,
      display_name: clean(t.name) ?? slug,
      description: clean(t.description) ?? "",
      sort_order: i,
      icon: null,
    });
  }
  const issueBySlug = new Map(issues.map((x) => [x.slug, x]));

  // Candidates (apply state exclusion)
  const candidates: CandidateOut[] = [];
  const candBySheetId = new Map<string, CandidateOut>();
  for (const r of payload.candidates) {
    const sheetId = clean(r.id);
    const name = clean(r.name);
    if (!sheetId || !name) continue;
    const state = (clean(r.state) ?? "").toUpperCase();
    if (EXCLUDED_STATES.has(state)) continue;

    const { chamber, district } = chamberAndDistrict(clean(r.seat), r.district);
    const { first, last } = splitName(name);
    const slug = `${slugify(first)}-${slugify(last)}-${state.toLowerCase()}`;
    const officeLabel =
      chamber === "senate"
        ? "U.S. Senate"
        : district
          ? `U.S. House, District ${parseInt(district, 10)}`
          : "U.S. House";

    const totalRaisedRaw = r["amount raised"];
    const totalRaised =
      typeof totalRaisedRaw === "number"
        ? Math.trunc(totalRaisedRaw)
        : typeof totalRaisedRaw === "string" && /^\d+$/.test(totalRaisedRaw.trim())
          ? parseInt(totalRaisedRaw, 10)
          : null;

    const out: CandidateOut = {
      // Match build_tracker_json.py: candidate UUIDs derive from the sheet's
      // candidate id (e.g. "cand-001"), not the slug — that way name edits
      // ("Tim" → "Timothy") don't change the UUID and break referential
      // integrity with positions.
      id: uuid5(`candidate:${sheetId}`),
      slug,
      name,
      first_name: first,
      last_name: last,
      party: normParty(clean(r.party)),
      state,
      district,
      office_sought: officeLabel,
      committee_assignments: [],
      election_year: ELECTION_YEAR,
      fec_id: null,
      bioguide_id: null,
      photo_url: null,
      is_incumbent: (clean(r.incumbency) ?? "").toUpperCase() === "Y",
      total_raised: totalRaised,
    };
    candidates.push(out);
    candBySheetId.set(sheetId, out);
  }

  // Races (derived from unique state×chamber×district)
  const racesBySlug = new Map<string, RaceOut>();
  const raceCandidates: RaceCandidateOut[] = [];
  for (const c of candidates) {
    const chamber: "senate" | "house" =
      c.office_sought === "U.S. Senate" ? "senate" : "house";
    const slug =
      chamber === "senate"
        ? `${c.state.toLowerCase()}-sen-${ELECTION_YEAR}`
        : `${c.state.toLowerCase()}-house-${c.district ?? "00"}-${ELECTION_YEAR}`;
    if (!racesBySlug.has(slug)) {
      racesBySlug.set(slug, {
        id: uuid5(`race:${slug}`),
        slug,
        state: c.state,
        chamber,
        district: chamber === "senate" ? null : c.district,
        election_year: ELECTION_YEAR,
        race_type: "regular",
      });
    }
    const race = racesBySlug.get(slug)!;
    raceCandidates.push({ race_id: race.id, candidate_id: c.id });
  }
  const races = Array.from(racesBySlug.values());

  // Sources keyed by position sheet id (first source per position wins)
  const firstSourceByPosId = new Map<string, RawSourceRow>();
  for (const s of payload.sources ?? []) {
    const pid = clean(s.positionId);
    if (!pid) continue;
    if (!firstSourceByPosId.has(pid)) firstSourceByPosId.set(pid, s);
  }

  // Positions
  const positions: PositionOut[] = [];
  for (const r of payload.positions) {
    const pid = clean(r.id);
    const candSheetId = clean(r.candidateId);
    const topicSlug = clean(r.topicId);
    if (!pid || !candSheetId || !topicSlug) continue;
    const cand = candBySheetId.get(candSheetId);
    const issue = issueBySlug.get(topicSlug);
    if (!cand) {
      warnings.push(`position ${pid}: unknown candidateId ${candSheetId}`);
      continue;
    }
    if (!issue) {
      warnings.push(`position ${pid}: unknown topicId ${topicSlug}`);
      continue;
    }
    const src = firstSourceByPosId.get(pid);
    positions.push({
      id: uuid5(`position:${pid}`),
      candidate_id: cand.id,
      issue_id: issue.id,
      stance: normStance(clean(r.stance)),
      confidence: normConfidence(clean(r.confidence)),
      summary: clean(r.summary),
      full_quote: src?.excerpt ? clean(src.excerpt) : null,
      source_url: src?.url ? clean(src.url) : null,
      date_recorded: safeDate(clean(r.lastUpdated)),
    });
  }

  return {
    issues,
    candidates,
    races,
    race_candidates: raceCandidates,
    positions,
    warnings,
  };
}
