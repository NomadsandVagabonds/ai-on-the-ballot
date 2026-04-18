/**
 * Backfill `bioguide_id` on candidates for sitting members of Congress.
 *
 * Pulls the canonical legislators roster from the unitedstates/congress-legislators
 * project (public domain), then matches each incumbent in our DB to a bioguide ID:
 *
 *   1. Exact FEC ID match (most reliable when available)
 *   2. Case-insensitive first+last+state match (fallback)
 *
 * Once matched, writes `bioguide_id` back to the candidate row and verifies
 * that the public-domain photo URL resolves.
 *
 * Usage:
 *   npx tsx scripts/import-bioguide.ts           # match + write
 *   npx tsx scripts/import-bioguide.ts --dry-run # match only, no DB writes
 *   npx tsx scripts/import-bioguide.ts --check   # verify all photo URLs resolve
 */

import {
  loadEnv,
  createScriptSupabaseClient,
  log,
  warn,
  error,
} from "./pipeline-config";

const LEGISLATORS_URL =
  "https://theunitedstates.io/congress-legislators/legislators-current.json";
const PHOTO_URL = (id: string, size = "450x550") =>
  `https://unitedstates.github.io/images/congress/${size}/${id}.jpg`;

interface LegislatorName {
  first: string;
  last: string;
  official_full?: string;
}

interface LegislatorTerm {
  type: "sen" | "rep";
  state: string;
  district?: number;
  start: string;
  end: string;
  party?: string;
}

interface LegislatorId {
  bioguide: string;
  fec?: string[];
}

interface Legislator {
  id: LegislatorId;
  name: LegislatorName;
  terms: LegislatorTerm[];
}

interface DbCandidate {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  state: string;
  district: string | null;
  office_sought: string;
  fec_id: string | null;
  is_incumbent: boolean;
  bioguide_id: string | null;
}

type SupabaseClient = Awaited<ReturnType<typeof createScriptSupabaseClient>>;

/* ========================================================================
   Helpers
   ======================================================================== */

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[^a-z]/g, "");
}

async function fetchLegislators(): Promise<Legislator[]> {
  log(`Fetching legislators roster from ${LEGISLATORS_URL}`);
  const res = await fetch(LEGISLATORS_URL);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch legislators: ${res.status} ${res.statusText}`
    );
  }
  const data = (await res.json()) as Legislator[];
  log(`Loaded ${data.length} sitting members of Congress`);
  return data;
}

/**
 * Build fast lookup maps.
 *  - `byFec`: FEC ID → bioguide ID
 *  - `byName`: "first|last|state" → bioguide ID (multiple keys possible)
 */
function buildIndexes(legislators: Legislator[]) {
  const byFec = new Map<string, string>();
  const byName = new Map<string, string>();

  for (const leg of legislators) {
    const bioguide = leg.id.bioguide;
    if (!bioguide) continue;

    // FEC IDs — a legislator can have multiple over time
    if (leg.id.fec) {
      for (const fec of leg.id.fec) {
        byFec.set(fec.toUpperCase(), bioguide);
      }
    }

    // Name index — use the current term's state
    const currentTerm = leg.terms[leg.terms.length - 1];
    if (!currentTerm) continue;
    const state = currentTerm.state.toUpperCase();
    const key = `${normalize(leg.name.first)}|${normalize(leg.name.last)}|${state}`;
    byName.set(key, bioguide);
  }

  log(
    `Indexed ${byFec.size} FEC IDs and ${byName.size} name+state combinations`
  );
  return { byFec, byName };
}

function matchCandidate(
  candidate: DbCandidate,
  indexes: { byFec: Map<string, string>; byName: Map<string, string> }
): { bioguideId: string; matchedBy: "fec" | "name" } | null {
  // 1. FEC ID match
  if (candidate.fec_id) {
    const hit = indexes.byFec.get(candidate.fec_id.toUpperCase());
    if (hit) return { bioguideId: hit, matchedBy: "fec" };
  }

  // 2. Name + state match
  const key = `${normalize(candidate.first_name)}|${normalize(candidate.last_name)}|${candidate.state.toUpperCase()}`;
  const hit = indexes.byName.get(key);
  if (hit) return { bioguideId: hit, matchedBy: "name" };

  return null;
}

async function verifyPhoto(bioguideId: string): Promise<boolean> {
  try {
    const res = await fetch(PHOTO_URL(bioguideId), { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

/* ========================================================================
   Main
   ======================================================================== */

interface RunOptions {
  dryRun: boolean;
  checkPhotos: boolean;
}

async function run(options: RunOptions) {
  const supabase: SupabaseClient = await createScriptSupabaseClient();

  // Fetch incumbents missing a bioguide ID
  const { data: rows, error: fetchErr } = await supabase
    .from("candidates")
    .select(
      "id, name, first_name, last_name, state, district, office_sought, fec_id, is_incumbent, bioguide_id"
    )
    .eq("is_incumbent", true);

  if (fetchErr) {
    error(`Failed to fetch candidates: ${fetchErr.message}`);
    process.exit(1);
  }

  const candidates = (rows ?? []) as DbCandidate[];
  if (candidates.length === 0) {
    log("No incumbents found in DB. Nothing to do.");
    return;
  }

  const needsBackfill = candidates.filter((c) => !c.bioguide_id);
  log(
    `Found ${candidates.length} incumbents, ${needsBackfill.length} missing a bioguide ID`
  );

  if (needsBackfill.length === 0 && !options.checkPhotos) {
    log("All incumbents already have bioguide IDs. Nothing to do.");
    return;
  }

  const legislators = await fetchLegislators();
  const indexes = buildIndexes(legislators);

  let matchedByFec = 0;
  let matchedByName = 0;
  const unmatched: DbCandidate[] = [];
  const writes: Array<{ id: string; bioguide_id: string; candidate: DbCandidate }> = [];

  for (const candidate of needsBackfill) {
    const match = matchCandidate(candidate, indexes);
    if (!match) {
      unmatched.push(candidate);
      continue;
    }
    if (match.matchedBy === "fec") matchedByFec++;
    else matchedByName++;
    writes.push({
      id: candidate.id,
      bioguide_id: match.bioguideId,
      candidate,
    });
  }

  log(
    `Match results: ${matchedByFec} by FEC ID, ${matchedByName} by name+state, ${unmatched.length} unmatched`
  );

  if (unmatched.length > 0) {
    warn("Unmatched incumbents (manual review needed):");
    for (const c of unmatched) {
      warn(
        `  - ${c.name} (${c.state}${c.district ? `-${c.district}` : ""}) — ${c.office_sought}`
      );
    }
  }

  if (options.dryRun) {
    log("Dry run — no DB writes performed.");
    for (const w of writes) {
      log(`  [would set] ${w.candidate.name} → ${w.bioguide_id}`);
    }
    return;
  }

  // Write back
  log(`Writing ${writes.length} bioguide IDs to DB...`);
  for (const w of writes) {
    const { error: updateErr } = await supabase
      .from("candidates")
      .update({ bioguide_id: w.bioguide_id })
      .eq("id", w.id);
    if (updateErr) {
      error(`Failed to update ${w.candidate.name}: ${updateErr.message}`);
      continue;
    }
    log(`  ✓ ${w.candidate.name} → ${w.bioguide_id}`);
  }

  // Photo verification pass
  if (options.checkPhotos) {
    log("Verifying photo URLs (HEAD request per bioguide ID)...");
    const { data: allRows } = await supabase
      .from("candidates")
      .select("id, name, bioguide_id")
      .not("bioguide_id", "is", null);
    const idsToCheck = (allRows ?? []) as Array<{
      id: string;
      name: string;
      bioguide_id: string;
    }>;
    let ok = 0;
    const broken: Array<{ name: string; bioguide_id: string }> = [];
    for (const r of idsToCheck) {
      const exists = await verifyPhoto(r.bioguide_id);
      if (exists) ok++;
      else broken.push({ name: r.name, bioguide_id: r.bioguide_id });
    }
    log(`Photos OK: ${ok} / ${idsToCheck.length}`);
    if (broken.length > 0) {
      warn("Bioguide IDs without a portrait in unitedstates/images:");
      for (const b of broken) {
        warn(`  - ${b.name} (${b.bioguide_id})`);
      }
      warn(
        "These candidates will render as monograms until unitedstates/images adds a photo."
      );
    }
  }

  log("Done.");
}

/* ========================================================================
   Entrypoint
   ======================================================================== */

loadEnv();

const args = new Set(process.argv.slice(2));
run({
  dryRun: args.has("--dry-run"),
  checkPhotos: args.has("--check"),
}).catch((err) => {
  error(String(err));
  process.exit(1);
});
