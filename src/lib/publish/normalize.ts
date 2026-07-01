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

export type RawCorrectionRow = {
  "Date of Correction"?: string | null;
  Description?: string | null;
};

export interface PublishPayload {
  candidates: RawCandidateRow[];
  topics: RawTopicRow[];
  positions: RawPositionRow[];
  sources?: RawSourceRow[];
  corrections?: RawCorrectionRow[];
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

export interface CorrectionOut {
  id: string;
  correction_date: string;
  description: string;
}

export interface NormalizedBundle {
  issues: IssueOut[];
  candidates: CandidateOut[];
  races: RaceOut[];
  race_candidates: RaceCandidateOut[];
  positions: PositionOut[];
  corrections: CorrectionOut[];
  warnings: string[];
  problems: PublishProblems;
}

/**
 * Structured diagnostics for the Apps Script dialog. Every category is
 * grouped by root cause so Vinaya sees "6 candidateIds missing" rather
 * than 60 individual warnings pointing at the same 6 IDs.
 */
export interface PublishProblems {
  droppedCandidates: Array<{
    row_index: number;
    sheet_id: string | null;
    name: string | null;
    reason: string;
  }>;
  unknownCandidateRefs: Array<{
    candidateId: string;
    positions_affected: number;
    sample_position_ids: string[];
  }>;
  unknownTopicRefs: Array<{
    topicId: string;
    positions_affected: number;
    sample_position_ids: string[];
  }>;
  duplicateCandidateSlugs: Array<{
    slug: string;
    kept_sheet_id: string;
    dropped_sheet_ids: string[];
  }>;
  duplicatePositions: Array<{
    candidateId: string;
    topicId: string;
    position_ids: string[];
  }>;
  droppedPositions: Array<{
    row_index: number;
    position_id: string | null;
    reason: string;
  }>;
}

// ---------------------------------------------------------------------------
// Excluded states (mirrors EXCLUDED_STATES in build_tracker_json.py)
// ---------------------------------------------------------------------------

// California un-excluded 2026-07-01 after Vinaya coded positions for
// ~155 CA candidates. Add abbreviations here to reinstate an exclusion.
const EXCLUDED_STATES = new Set<string>();

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export function normalize(payload: PublishPayload): NormalizedBundle {
  const warnings: string[] = [];
  const problems: PublishProblems = {
    droppedCandidates: [],
    unknownCandidateRefs: [],
    unknownTopicRefs: [],
    duplicateCandidateSlugs: [],
    duplicatePositions: [],
    droppedPositions: [],
  };
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

  // Candidates (apply state exclusion, dedupe on slug)
  const candidates: CandidateOut[] = [];
  const candBySheetId = new Map<string, CandidateOut>();
  const candBySlug = new Map<string, { sheetId: string }>();
  for (let i = 0; i < payload.candidates.length; i++) {
    const r = payload.candidates[i];
    const rowNum = i + 2; // sheet row (header = 1)
    const sheetId = clean(r.id);
    const name = clean(r.name);
    if (!sheetId) {
      problems.droppedCandidates.push({
        row_index: rowNum,
        sheet_id: null,
        name,
        reason: "missing id column",
      });
      continue;
    }
    if (!name) {
      problems.droppedCandidates.push({
        row_index: rowNum,
        sheet_id: sheetId,
        name: null,
        reason: "missing name column",
      });
      continue;
    }
    const state = (clean(r.state) ?? "").toUpperCase();
    if (EXCLUDED_STATES.has(state)) continue; // intentional silent skip
    if (!state) {
      problems.droppedCandidates.push({
        row_index: rowNum,
        sheet_id: sheetId,
        name,
        reason: "missing state column",
      });
      continue;
    }

    const { chamber, district } = chamberAndDistrict(clean(r.seat), r.district);
    const { first, last } = splitName(name);
    const slug = `${slugify(first)}-${slugify(last)}-${state.toLowerCase()}`;

    // Dedupe candidates by slug — DB has UNIQUE (slug); an unhandled
    // duplicate here would abort the whole candidates upsert and cascade
    // into orphaned positions + FK failures.
    const existing = candBySlug.get(slug);
    if (existing) {
      let dup = problems.duplicateCandidateSlugs.find((d) => d.slug === slug);
      if (!dup) {
        dup = {
          slug,
          kept_sheet_id: existing.sheetId,
          dropped_sheet_ids: [],
        };
        problems.duplicateCandidateSlugs.push(dup);
      }
      dup.dropped_sheet_ids.push(sheetId);
      // Alias the dupe's sheetId to the kept candidate so positions
      // referencing either row still resolve. Avoids surprise data loss.
      const kept = candBySheetId.get(existing.sheetId);
      if (kept) candBySheetId.set(sheetId, kept);
      continue;
    }

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
    candBySlug.set(slug, { sheetId });
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

  // Positions — with grouped ref errors and (candidate, issue) dedupe
  const positions: PositionOut[] = [];
  const positionsByPair = new Map<string, PositionOut>();
  const unknownCandCounts = new Map<
    string,
    { count: number; samples: string[] }
  >();
  const unknownTopicCounts = new Map<
    string,
    { count: number; samples: string[] }
  >();
  const dupePositionMap = new Map<string, string[]>(); // sheet pos-IDs, not UUIDs
  const pairKeyToSheetIds = new Map<string, string>(); // first sheet pid per pair

  for (let i = 0; i < payload.positions.length; i++) {
    const r = payload.positions[i];
    const rowNum = i + 2;
    const pid = clean(r.id);
    const candSheetId = clean(r.candidateId);
    const topicSlug = clean(r.topicId);
    if (!pid) {
      problems.droppedPositions.push({
        row_index: rowNum,
        position_id: null,
        reason: "missing id column",
      });
      continue;
    }
    if (!candSheetId) {
      problems.droppedPositions.push({
        row_index: rowNum,
        position_id: pid,
        reason: "missing candidateId column",
      });
      continue;
    }
    if (!topicSlug) {
      problems.droppedPositions.push({
        row_index: rowNum,
        position_id: pid,
        reason: "missing topicId column",
      });
      continue;
    }
    const cand = candBySheetId.get(candSheetId);
    const issue = issueBySlug.get(topicSlug);
    if (!cand) {
      const rec = unknownCandCounts.get(candSheetId) ?? {
        count: 0,
        samples: [],
      };
      rec.count++;
      if (rec.samples.length < 5) rec.samples.push(pid);
      unknownCandCounts.set(candSheetId, rec);
      warnings.push(`position ${pid}: unknown candidateId ${candSheetId}`);
      continue;
    }
    if (!issue) {
      const rec = unknownTopicCounts.get(topicSlug) ?? {
        count: 0,
        samples: [],
      };
      rec.count++;
      if (rec.samples.length < 5) rec.samples.push(pid);
      unknownTopicCounts.set(topicSlug, rec);
      warnings.push(`position ${pid}: unknown topicId ${topicSlug}`);
      continue;
    }
    const src = firstSourceByPosId.get(pid);
    const positionOut: PositionOut = {
      id: uuid5(`position:${pid}`),
      candidate_id: cand.id,
      issue_id: issue.id,
      stance: normStance(clean(r.stance)),
      confidence: normConfidence(clean(r.confidence)),
      summary: clean(r.summary),
      full_quote: src?.excerpt ? clean(src.excerpt) : null,
      source_url: src?.url ? clean(src.url) : null,
      date_recorded: safeDate(clean(r.lastUpdated)),
    };

    // Enforce positions UNIQUE (candidate_id, issue_id) — Postgres will
    // reject the whole chunk if two payload rows collide. Keep the last
    // (assumes downstream sheet order = chronological update order) and
    // warn so Vinaya knows which position row wins.
    const pairKey = `${cand.id}::${issue.id}`;
    const existing = positionsByPair.get(pairKey);
    if (existing) {
      const firstPid = pairKeyToSheetIds.get(pairKey) ?? pid;
      const list = dupePositionMap.get(pairKey) ?? [firstPid];
      list.push(pid);
      dupePositionMap.set(pairKey, list);
      // Replace with newer row
      const idx = positions.findIndex((p) => p.id === existing.id);
      if (idx >= 0) positions[idx] = positionOut;
      positionsByPair.set(pairKey, positionOut);
    } else {
      positions.push(positionOut);
      positionsByPair.set(pairKey, positionOut);
      pairKeyToSheetIds.set(pairKey, pid);
    }
  }

  // Roll grouped refs up into the structured problems object
  for (const [candidateId, rec] of unknownCandCounts) {
    problems.unknownCandidateRefs.push({
      candidateId,
      positions_affected: rec.count,
      sample_position_ids: rec.samples,
    });
  }
  for (const [topicId, rec] of unknownTopicCounts) {
    problems.unknownTopicRefs.push({
      topicId,
      positions_affected: rec.count,
      sample_position_ids: rec.samples,
    });
  }
  for (const [pairKey, position_ids] of dupePositionMap) {
    // Recover the sheet-facing candidate + topic slugs from the pair key
    const [candUuid, issueUuid] = pairKey.split("::");
    const candSheetId =
      Array.from(candBySheetId.entries()).find(
        ([, v]) => v.id === candUuid
      )?.[0] ?? candUuid;
    const topicSlug =
      Array.from(issueBySlug.entries()).find(
        ([, v]) => v.id === issueUuid
      )?.[0] ?? issueUuid;
    problems.duplicatePositions.push({
      candidateId: candSheetId,
      topicId: topicSlug,
      position_ids,
    });
  }

  // Corrections (published log — distinct from corrections_log intake form)
  const corrections: CorrectionOut[] = [];
  for (const r of payload.corrections ?? []) {
    const date = safeDate(clean(r["Date of Correction"]));
    const description = clean(r.Description);
    if (!date || !description) continue;
    corrections.push({
      // Stable UUID from date + first 80 chars of description so re-publish
      // is idempotent and never duplicates entries.
      id: uuid5(`correction:${date}:${description.slice(0, 80)}`),
      correction_date: date,
      description,
    });
  }

  return {
    issues,
    candidates,
    races,
    race_candidates: raceCandidates,
    positions,
    corrections,
    warnings,
    problems,
  };
}

/**
 * Human-readable summary lines for the top data-integrity issues,
 * targeting the Apps Script alert. Grouped and truncated so Vinaya sees
 * the fixes she needs to make in the sheet, not a flood of duplicates.
 */
export function summarizeProblems(p: PublishProblems): string[] {
  const lines: string[] = [];

  if (p.droppedCandidates.length) {
    lines.push(
      `${p.droppedCandidates.length} candidate row(s) skipped, missing required column:`
    );
    for (const d of p.droppedCandidates.slice(0, 6)) {
      const label = d.name ?? d.sheet_id ?? "(blank row)";
      lines.push(`  · Candidates row ${d.row_index}: ${d.reason} (${label})`);
    }
    if (p.droppedCandidates.length > 6)
      lines.push(`  · …and ${p.droppedCandidates.length - 6} more`);
  }

  if (p.unknownCandidateRefs.length) {
    const totalOrphans = p.unknownCandidateRefs.reduce(
      (n, r) => n + r.positions_affected,
      0
    );
    lines.push(
      `${totalOrphans} position(s) reference ${p.unknownCandidateRefs.length} candidate id(s) not in Candidates sheet:`
    );
    const sorted = [...p.unknownCandidateRefs].sort(
      (a, b) => b.positions_affected - a.positions_affected
    );
    for (const r of sorted.slice(0, 8)) {
      lines.push(
        `  · candidateId="${r.candidateId}": ${r.positions_affected} position(s) [e.g. ${r.sample_position_ids.slice(0, 2).join(", ")}]`
      );
    }
    if (sorted.length > 8)
      lines.push(`  · …and ${sorted.length - 8} more candidate id(s)`);
    lines.push(
      `  Fix: add these rows to the Candidates sheet, or correct the candidateId in Positions v2.`
    );
  }

  if (p.unknownTopicRefs.length) {
    lines.push(
      `${p.unknownTopicRefs.length} unknown topicId(s) referenced by positions:`
    );
    for (const r of p.unknownTopicRefs.slice(0, 6)) {
      lines.push(
        `  · topicId="${r.topicId}": ${r.positions_affected} position(s)`
      );
    }
  }

  if (p.duplicateCandidateSlugs.length) {
    lines.push(
      `${p.duplicateCandidateSlugs.length} candidate(s) share the same URL slug (first-last-state); later rows are ignored:`
    );
    for (const d of p.duplicateCandidateSlugs.slice(0, 6)) {
      lines.push(
        `  · slug="${d.slug}" kept=${d.kept_sheet_id} dropped=${d.dropped_sheet_ids.join(", ")}`
      );
    }
  }

  if (p.duplicatePositions.length) {
    lines.push(
      `${p.duplicatePositions.length} candidate+topic pair(s) had multiple position rows; only the latest is kept:`
    );
    for (const d of p.duplicatePositions.slice(0, 6)) {
      lines.push(
        `  · candidate="${d.candidateId}" topic="${d.topicId}" (${d.position_ids.length} rows)`
      );
    }
  }

  if (p.droppedPositions.length) {
    lines.push(
      `${p.droppedPositions.length} position row(s) skipped, missing required column:`
    );
    for (const d of p.droppedPositions.slice(0, 4)) {
      lines.push(
        `  · Positions v2 row ${d.row_index}: ${d.reason} (id=${d.position_id ?? "(blank)"})`
      );
    }
  }

  return lines;
}

/** Total count of every dropped/orphaned/deduped row across categories. */
export function countProblemRows(p: PublishProblems): number {
  return (
    p.droppedCandidates.length +
    p.droppedPositions.length +
    p.duplicateCandidateSlugs.reduce((n, d) => n + d.dropped_sheet_ids.length, 0) +
    p.duplicatePositions.reduce((n, d) => n + (d.position_ids.length - 1), 0) +
    p.unknownCandidateRefs.reduce((n, r) => n + r.positions_affected, 0) +
    p.unknownTopicRefs.reduce((n, r) => n + r.positions_affected, 0)
  );
}
