/**
 * FEC Candidate Identification Script
 *
 * Pulls all qualifying 2026 midterm candidates from the FEC API
 * for the specified states, filters by fundraising thresholds,
 * and upserts them into the Supabase database.
 *
 * Also creates race records and race_candidates junction entries.
 *
 * Usage:
 *   npx tsx scripts/fec-candidates.ts                     # All launch states
 *   npx tsx scripts/fec-candidates.ts --states=TX,NC      # Specific states
 *   npx tsx scripts/fec-candidates.ts --threshold=later    # Use $50K house threshold
 *   npx tsx scripts/fec-candidates.ts --dry-run            # Preview without DB writes
 */

import * as fs from "node:fs";
import {
  loadEnv,
  requireEnv,
  ELECTION_YEAR,
  LAUNCH_STATES,
  FEC_THRESHOLDS,
  FEC_API_BASE,
  PATHS,
  candidateSlug,
  raceSlug,
  splitName,
  sleep,
  ensureDir,
  log,
  warn,
  error,
  createScriptSupabaseClient,
} from "./pipeline-config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FECCandidate {
  candidate_id: string; // e.g., "H4TX23075"
  name: string; // "CRUZ, RAFAEL EDWARD 'TED'"
  party_full: string;
  party: string; // "REP", "DEM", "IND", etc.
  state: string; // "TX"
  district: string; // "00" for Senate, "23" for House
  office_full: string; // "Senate", "House"
  office: string; // "S" or "H"
  incumbent_challenge_full: string; // "Incumbent", "Challenger", "Open"
  incumbent_challenge: string; // "I", "C", "O"
  election_years: number[];
  has_raised_funds: boolean;
  federal_funds_flag: boolean;
}

interface FECFinancials {
  candidate_id: string;
  receipts: number;
  disbursements: number;
  cash_on_hand_end_period: number;
}

interface FECApiResponse<T> {
  results: T[];
  pagination: {
    pages: number;
    per_page: number;
    count: number;
    page: number;
  };
}

interface QualifiedCandidate {
  fecId: string;
  name: string;
  firstName: string;
  lastName: string;
  party: string;
  state: string;
  district: string | null;
  office: "senate" | "house";
  isIncumbent: boolean;
  totalReceipts: number;
  slug: string;
}

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  let states: string[] = [...LAUNCH_STATES];
  let thresholdMode: "initial" | "later" = "initial";
  let dryRun = false;

  for (const arg of args) {
    if (arg.startsWith("--states=")) {
      states = arg
        .replace("--states=", "")
        .split(",")
        .map((s) => s.trim().toUpperCase());
    } else if (arg === "--threshold=later") {
      thresholdMode = "later";
    } else if (arg === "--dry-run") {
      dryRun = true;
    }
  }

  return { states, thresholdMode, dryRun };
}

// ---------------------------------------------------------------------------
// FEC API helpers
// ---------------------------------------------------------------------------

const FEC_RATE_LIMIT_MS = 500; // conservative: 2 req/s (limit is ~1000/hr)

async function fecFetch<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<FECApiResponse<T>> {
  const apiKey = requireEnv("FEC_API_KEY");
  const url = new URL(`${FEC_API_BASE}${endpoint}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("per_page", "100");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`FEC API error: ${res.status} ${res.statusText} (${endpoint})`);
  }
  return res.json() as Promise<FECApiResponse<T>>;
}

/** Paginate through all results from an FEC endpoint */
async function fecFetchAll<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;

  while (true) {
    const res = await fecFetch<T>(endpoint, { ...params, page: page.toString() });
    all.push(...res.results);

    if (page >= res.pagination.pages) break;
    page++;
    await sleep(FEC_RATE_LIMIT_MS);
  }

  return all;
}

// ---------------------------------------------------------------------------
// Name parsing (FEC names are "LAST, FIRST MIDDLE" format)
// ---------------------------------------------------------------------------

function parseFECName(fecName: string): { first: string; last: string; display: string } {
  // FEC format: "CRUZ, RAFAEL EDWARD 'TED'" or "ALLRED, COLIN ZACHARY"
  const cleaned = fecName
    .replace(/'/g, "'")
    .replace(/"[^"]*"/g, "") // remove quoted nicknames
    .replace(/'[^']*'/g, (match) => match) // keep single-quoted nicknames
    .trim();

  const commaIdx = cleaned.indexOf(",");
  if (commaIdx === -1) {
    // No comma — unusual, just split on spaces
    const s = splitName(cleaned);
    return {
      first: titleCase(s.first),
      last: titleCase(s.last),
      display: `${titleCase(s.first)} ${titleCase(s.last)}`,
    };
  }

  const last = cleaned.slice(0, commaIdx).trim();
  let firstParts = cleaned.slice(commaIdx + 1).trim();

  // Extract nickname if present: 'TED' or "TED"
  const nicknameMatch = fecName.match(/['"]\s*([^'"]+)\s*['"]/);
  const firstName = nicknameMatch
    ? titleCase(nicknameMatch[1])
    : titleCase(firstParts.split(/\s+/)[0]);

  const displayLast = titleCase(last);

  return {
    first: firstName,
    last: displayLast,
    display: `${firstName} ${displayLast}`,
  };
}

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => {
      // Handle "De La Cruz", "McConnell", etc.
      if (w.startsWith("mc")) return "Mc" + w.charAt(2).toUpperCase() + w.slice(3);
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function mapParty(fecParty: string): string {
  const map: Record<string, string> = {
    REP: "R",
    DEM: "D",
    IND: "I",
    LIB: "L",
    GRE: "G",
    GRP: "G",
  };
  return map[fecParty] || "I"; // default Independent for unusual parties
}

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

async function fetchCandidatesForState(
  state: string,
  office: "S" | "H",
  thresholdMode: "initial" | "later"
): Promise<QualifiedCandidate[]> {
  log(`Fetching ${office === "S" ? "Senate" : "House"} candidates for ${state}...`);

  // Step 1: Get all candidates filed for this state/office/cycle
  const candidates = await fecFetchAll<FECCandidate>("/candidates/", {
    state: state,
    office: office,
    election_year: ELECTION_YEAR.toString(),
    candidate_status: "C", // Active candidates
    sort: "name",
  });

  log(`  Found ${candidates.length} filed candidates`);

  if (candidates.length === 0) return [];

  // Step 2: Get financial totals for these candidates
  const fecIds = candidates.map((c) => c.candidate_id);
  const financials: FECFinancials[] = [];

  // FEC API limits candidate_id to 100 per request
  for (let i = 0; i < fecIds.length; i += 100) {
    const batch = fecIds.slice(i, i + 100);
    const fin = await fecFetchAll<FECFinancials>("/candidates/totals/", {
      candidate_id: batch.join(","),
      election_year: ELECTION_YEAR.toString(),
    });
    financials.push(...fin);
    if (i + 100 < fecIds.length) await sleep(FEC_RATE_LIMIT_MS);
  }

  const financialMap = new Map<string, FECFinancials>();
  for (const f of financials) {
    financialMap.set(f.candidate_id, f);
  }

  // Step 3: Apply eligibility thresholds
  const threshold =
    office === "S"
      ? FEC_THRESHOLDS.senate
      : thresholdMode === "later"
        ? FEC_THRESHOLDS.house_later
        : FEC_THRESHOLDS.house_initial;

  const qualified: QualifiedCandidate[] = [];

  for (const c of candidates) {
    const fin = financialMap.get(c.candidate_id);
    const receipts = fin?.receipts ?? 0;
    const isIncumbent = c.incumbent_challenge === "I";

    // Include if: incumbent OR meets fundraising threshold
    if (!isIncumbent && receipts < threshold) {
      continue;
    }

    const parsed = parseFECName(c.name);
    const party = mapParty(c.party);
    const district =
      office === "H" && c.district && c.district !== "00"
        ? c.district.replace(/^0+/, "") // "07" -> "7"
        : null;

    // Skip third-party candidates who haven't raised enough
    // (they're allowed by party check, but still need threshold)
    if (!["D", "R"].includes(party) && receipts < threshold) {
      continue;
    }

    qualified.push({
      fecId: c.candidate_id,
      name: parsed.display,
      firstName: parsed.first,
      lastName: parsed.last,
      party,
      state,
      district,
      office: office === "S" ? "senate" : "house",
      isIncumbent,
      totalReceipts: receipts,
      slug: candidateSlug(parsed.first, parsed.last, state),
    });
  }

  log(`  ${qualified.length} candidates meet eligibility threshold ($${threshold.toLocaleString()})`);
  return qualified;
}

async function upsertToDatabase(
  candidates: QualifiedCandidate[],
  dryRun: boolean
) {
  if (dryRun) {
    log("DRY RUN — would upsert the following:");
    for (const c of candidates) {
      log(`  ${c.name} (${c.party}-${c.state}) — ${c.office}${c.district ? ` D${c.district}` : ""} — $${c.totalReceipts.toLocaleString()} — ${c.isIncumbent ? "Incumbent" : "Challenger"}`);
    }
    return;
  }

  const supabase = await createScriptSupabaseClient();

  // Group candidates by race
  const raceMap = new Map<
    string,
    { slug: string; state: string; chamber: "senate" | "house"; district: string | null; candidates: QualifiedCandidate[] }
  >();

  for (const c of candidates) {
    const rSlug = raceSlug(c.state, c.office, ELECTION_YEAR, c.district);
    if (!raceMap.has(rSlug)) {
      raceMap.set(rSlug, {
        slug: rSlug,
        state: c.state,
        chamber: c.office,
        district: c.district,
        candidates: [],
      });
    }
    raceMap.get(rSlug)!.candidates.push(c);
  }

  let candidateCount = 0;
  let raceCount = 0;
  let errorCount = 0;

  // Upsert races
  for (const race of raceMap.values()) {
    const { data: raceData, error: raceErr } = await supabase
      .from("races")
      .upsert(
        {
          slug: race.slug,
          state: race.state,
          chamber: race.chamber,
          district: race.district,
          election_year: ELECTION_YEAR,
          race_type: "regular",
        },
        { onConflict: "slug" }
      )
      .select("id")
      .single();

    if (raceErr || !raceData) {
      error(`Failed to upsert race ${race.slug}: ${raceErr?.message}`);
      errorCount++;
      continue;
    }
    raceCount++;

    // Upsert candidates in this race
    for (const c of race.candidates) {
      const { data: candData, error: candErr } = await supabase
        .from("candidates")
        .upsert(
          {
            name: c.name,
            first_name: c.firstName,
            last_name: c.lastName,
            slug: c.slug,
            party: c.party,
            state: c.state,
            district: c.district,
            office_sought: c.office === "senate" ? "U.S. Senate" : "U.S. House",
            is_incumbent: c.isIncumbent,
            election_year: ELECTION_YEAR,
            fec_id: c.fecId,
            committee_assignments: [],
            research_status: "pending",
          },
          { onConflict: "slug" }
        )
        .select("id")
        .single();

      if (candErr || !candData) {
        error(`Failed to upsert candidate ${c.name}: ${candErr?.message}`);
        errorCount++;
        continue;
      }

      // Link candidate to race
      const { error: junctionErr } = await supabase
        .from("race_candidates")
        .upsert(
          { race_id: raceData.id, candidate_id: candData.id },
          { onConflict: "race_id,candidate_id" }
        );

      if (junctionErr) {
        // Might fail if no unique constraint on junction — use insert with ignore
        warn(`Junction insert for ${c.name} in ${race.slug}: ${junctionErr.message}`);
      }

      candidateCount++;
    }
  }

  log(`Upserted ${raceCount} races, ${candidateCount} candidates (${errorCount} errors)`);
}

function exportManifest(candidates: QualifiedCandidate[]) {
  ensureDir(PATHS.data);
  const header =
    "FEC_ID,Name,FirstName,LastName,Slug,Party,State,District,Office,IsIncumbent,TotalReceipts";
  const rows = candidates.map(
    (c) =>
      `${c.fecId},"${c.name}",${c.firstName},${c.lastName},${c.slug},${c.party},${c.state},${c.district ?? ""},${c.office},${c.isIncumbent},${c.totalReceipts}`
  );
  const csv = [header, ...rows].join("\n") + "\n";
  fs.writeFileSync(PATHS.candidateManifest, csv);
  log(`Exported manifest: ${PATHS.candidateManifest} (${candidates.length} candidates)`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { states, thresholdMode, dryRun } = parseArgs();

  loadEnv();

  log(`Target states: ${states.join(", ")}`);
  log(`Threshold mode: ${thresholdMode} (House: $${(thresholdMode === "later" ? FEC_THRESHOLDS.house_later : FEC_THRESHOLDS.house_initial).toLocaleString()})`);
  if (dryRun) log("DRY RUN mode — no database writes");

  const allCandidates: QualifiedCandidate[] = [];

  for (const state of states) {
    // Fetch Senate candidates
    const senate = await fetchCandidatesForState(state, "S", thresholdMode);
    allCandidates.push(...senate);
    await sleep(FEC_RATE_LIMIT_MS);

    // Fetch House candidates
    const house = await fetchCandidatesForState(state, "H", thresholdMode);
    allCandidates.push(...house);
    await sleep(FEC_RATE_LIMIT_MS);
  }

  log(`\nTotal qualifying candidates: ${allCandidates.length}`);
  log(`  Senate: ${allCandidates.filter((c) => c.office === "senate").length}`);
  log(`  House: ${allCandidates.filter((c) => c.office === "house").length}`);
  log(`  Incumbents: ${allCandidates.filter((c) => c.isIncumbent).length}`);
  log(`  Challengers: ${allCandidates.filter((c) => !c.isIncumbent).length}`);

  // Export manifest CSV (even in dry-run mode)
  exportManifest(allCandidates);

  // Upsert to database
  await upsertToDatabase(allCandidates, dryRun);

  log("\nDone.");
}

main().catch((err) => {
  error(`Fatal: ${err.message}`);
  process.exit(1);
});
