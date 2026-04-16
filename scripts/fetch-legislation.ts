/**
 * Congress.gov Legislative Activity Fetcher
 *
 * For every incumbent candidate in the database, pulls AI-relevant bills,
 * co-sponsorships, and votes from the Congress.gov API, then inserts
 * them into the legislative_activity table.
 *
 * Usage:
 *   npx tsx scripts/fetch-legislation.ts                   # All incumbents
 *   npx tsx scripts/fetch-legislation.ts --states=TX,NC    # Specific states
 *   npx tsx scripts/fetch-legislation.ts --dry-run         # Preview without DB writes
 *
 * Prerequisites:
 *   - CONGRESS_API_KEY in .env.local (free at api.congress.gov)
 *   - Candidates already loaded via fec-candidates.ts
 *   - data/fec-to-bioguide.json mapping file (or will fetch from GitHub)
 */

import * as fs from "node:fs";
import {
  loadEnv,
  requireEnv,
  CONGRESS_API_BASE,
  ALL_AI_KEYWORDS,
  PATHS,
  ensureDir,
  sleep,
  log,
  warn,
  error,
  createScriptSupabaseClient,
} from "./pipeline-config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CongressBill {
  congress: number;
  type: string; // "S", "HR", "SJRES", etc.
  number: number;
  title: string;
  url: string; // API URL
  latestAction?: {
    actionDate: string;
    text: string;
  };
  introducedDate?: string;
}

interface CongressBillDetail {
  bill: {
    congress: number;
    type: string;
    number: number;
    title: string;
    introducedDate: string;
    policyArea?: { name: string };
    subjects?: { legislativeSubjects: { name: string }[] };
    summaries?: { text: string }[];
    textVersions?: { url: string }[];
  };
}

interface BioguideEntry {
  id: {
    bioguide: string;
    fec?: string[];
    govtrack?: number;
  };
  name: {
    first: string;
    last: string;
    official_full?: string;
  };
  terms: {
    type: string; // "sen" or "rep"
    state: string;
    district?: number;
    start: string;
    end: string;
  }[];
}

interface IncumbentCandidate {
  id: string;
  name: string;
  slug: string;
  state: string;
  fec_id: string | null;
  bioguide_id: string | null;
}

interface LegActivity {
  candidateId: string;
  activityType: string;
  title: string;
  description: string;
  sourceUrl: string;
  date: string;
}

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  let states: string[] | null = null;
  let dryRun = false;

  for (const arg of args) {
    if (arg.startsWith("--states=")) {
      states = arg
        .replace("--states=", "")
        .split(",")
        .map((s) => s.trim().toUpperCase());
    } else if (arg === "--dry-run") {
      dryRun = true;
    }
  }

  return { states, dryRun };
}

// ---------------------------------------------------------------------------
// Bioguide ID mapping
// ---------------------------------------------------------------------------

/** Load or fetch the FEC → Bioguide ID mapping */
async function loadBioguideMapping(): Promise<Map<string, string>> {
  // Check for local cache first
  if (fs.existsSync(PATHS.fecToBioguide)) {
    const data = JSON.parse(fs.readFileSync(PATHS.fecToBioguide, "utf-8"));
    log(`Loaded ${Object.keys(data).length} FEC→Bioguide mappings from cache`);
    return new Map(Object.entries(data));
  }

  // Fetch from the unitedstates/congress-legislators GitHub repo
  log("Fetching FEC→Bioguide mapping from congress-legislators repo...");
  const urls = [
    "https://theunitedstates.io/congress-legislators/legislators-current.json",
    "https://theunitedstates.io/congress-legislators/legislators-historical.json",
  ];

  const mapping = new Map<string, string>();

  for (const url of urls) {
    const res = await fetch(url);
    if (!res.ok) {
      warn(`Failed to fetch ${url}: ${res.status}`);
      continue;
    }
    const legislators: BioguideEntry[] = await res.json();

    for (const leg of legislators) {
      const bioguide = leg.id.bioguide;
      if (leg.id.fec) {
        for (const fecId of leg.id.fec) {
          mapping.set(fecId, bioguide);
        }
      }
    }
  }

  // Cache locally
  ensureDir(PATHS.data);
  const obj = Object.fromEntries(mapping);
  fs.writeFileSync(PATHS.fecToBioguide, JSON.stringify(obj, null, 2));
  log(`Cached ${mapping.size} FEC→Bioguide mappings to ${PATHS.fecToBioguide}`);

  return mapping;
}

// ---------------------------------------------------------------------------
// Congress.gov API helpers
// ---------------------------------------------------------------------------

const CONGRESS_RATE_LIMIT_MS = 300; // ~3 req/s (limit is 5000/hr)

async function congressFetch<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T> {
  const apiKey = requireEnv("CONGRESS_API_KEY");
  const url = new URL(`${CONGRESS_API_BASE}${endpoint}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("format", "json");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(
      `Congress API error: ${res.status} ${res.statusText} (${endpoint})`
    );
  }
  return res.json() as Promise<T>;
}

/** Check if a bill title or summary contains AI-related keywords */
function isAIRelevant(text: string): boolean {
  const lower = text.toLowerCase();
  return ALL_AI_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

// ---------------------------------------------------------------------------
// Fetch bills for a member
// ---------------------------------------------------------------------------

async function fetchSponsoredBills(
  bioguideId: string,
  candidateId: string
): Promise<LegActivity[]> {
  const activities: LegActivity[] = [];

  try {
    const data = await congressFetch<{
      sponsoredLegislation: CongressBill[];
    }>(`/member/${bioguideId}/sponsored-legislation`, {
      limit: "250",
    });

    const bills = data.sponsoredLegislation || [];

    for (const bill of bills) {
      // Only 119th Congress (2025-2026) or late 118th
      if (bill.congress < 118) continue;

      if (isAIRelevant(bill.title)) {
        activities.push({
          candidateId,
          activityType: "bill_sponsored",
          title: `${bill.type}.${bill.number} — ${bill.title}`,
          description: bill.latestAction?.text || bill.title,
          sourceUrl: `https://www.congress.gov/bill/${bill.congress}th-congress/${billTypeSlug(bill.type)}/${bill.number}`,
          date: bill.introducedDate || bill.latestAction?.actionDate || "",
        });
      }
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    warn(`Failed to fetch sponsored bills for ${bioguideId}: ${msg}`);
  }

  return activities;
}

async function fetchCosponsoredBills(
  bioguideId: string,
  candidateId: string
): Promise<LegActivity[]> {
  const activities: LegActivity[] = [];

  try {
    const data = await congressFetch<{
      cosponsoredLegislation: CongressBill[];
    }>(`/member/${bioguideId}/cosponsored-legislation`, {
      limit: "250",
    });

    const bills = data.cosponsoredLegislation || [];

    for (const bill of bills) {
      if (bill.congress < 118) continue;

      if (isAIRelevant(bill.title)) {
        activities.push({
          candidateId,
          activityType: "bill_cosponsored",
          title: `${bill.type}.${bill.number} — ${bill.title}`,
          description: bill.latestAction?.text || bill.title,
          sourceUrl: `https://www.congress.gov/bill/${bill.congress}th-congress/${billTypeSlug(bill.type)}/${bill.number}`,
          date: bill.introducedDate || bill.latestAction?.actionDate || "",
        });
      }
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    warn(`Failed to fetch cosponsored bills for ${bioguideId}: ${msg}`);
  }

  return activities;
}

function billTypeSlug(type: string): string {
  const map: Record<string, string> = {
    S: "senate-bill",
    HR: "house-bill",
    HJRES: "house-joint-resolution",
    SJRES: "senate-joint-resolution",
    HCONRES: "house-concurrent-resolution",
    SCONRES: "senate-concurrent-resolution",
    HRES: "house-resolution",
    SRES: "senate-resolution",
  };
  return map[type] || "senate-bill";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { states, dryRun } = parseArgs();

  loadEnv();

  if (dryRun) log("DRY RUN mode — no database writes");

  const supabase = await createScriptSupabaseClient();

  // Step 1: Load Bioguide mapping
  const bioguideMap = await loadBioguideMapping();

  // Step 2: Get all incumbents from the database
  let query = supabase
    .from("candidates")
    .select("id, name, slug, state, fec_id, bioguide_id")
    .eq("is_incumbent", true);

  if (states) {
    query = query.in("state", states);
  }

  const { data: incumbents, error: dbErr } = await query;

  if (dbErr || !incumbents) {
    error(`Failed to fetch incumbents: ${dbErr?.message}`);
    process.exit(1);
  }

  log(`Found ${incumbents.length} incumbent candidates`);

  // Step 3: Resolve Bioguide IDs
  const resolved: (IncumbentCandidate & { resolvedBioguide: string })[] = [];

  for (const inc of incumbents) {
    let bioguide = inc.bioguide_id;

    if (!bioguide && inc.fec_id) {
      bioguide = bioguideMap.get(inc.fec_id) || null;
      if (bioguide) {
        // Update the database with the resolved bioguide_id
        if (!dryRun) {
          await supabase
            .from("candidates")
            .update({ bioguide_id: bioguide })
            .eq("id", inc.id);
        }
        log(`  Resolved Bioguide for ${inc.name}: ${bioguide}`);
      }
    }

    if (!bioguide) {
      warn(`No Bioguide ID for ${inc.name} (FEC: ${inc.fec_id}) — skipping`);
      continue;
    }

    resolved.push({ ...inc, resolvedBioguide: bioguide });
  }

  log(`${resolved.length} incumbents with Bioguide IDs`);

  // Step 4: Fetch legislation for each incumbent
  let totalActivities = 0;
  let totalErrors = 0;

  for (const inc of resolved) {
    log(`\nFetching legislation for ${inc.name} (${inc.resolvedBioguide})...`);

    const sponsored = await fetchSponsoredBills(
      inc.resolvedBioguide,
      inc.id
    );
    await sleep(CONGRESS_RATE_LIMIT_MS);

    const cosponsored = await fetchCosponsoredBills(
      inc.resolvedBioguide,
      inc.id
    );
    await sleep(CONGRESS_RATE_LIMIT_MS);

    const allActivities = [...sponsored, ...cosponsored];
    log(`  Found ${allActivities.length} AI-relevant legislative activities`);

    if (dryRun) {
      for (const a of allActivities) {
        log(`  [${a.activityType}] ${a.title}`);
      }
      totalActivities += allActivities.length;
      continue;
    }

    // Insert into database (dedup by candidate_id + title + date)
    for (const activity of allActivities) {
      // Check if already exists
      const { data: existing } = await supabase
        .from("legislative_activity")
        .select("id")
        .eq("candidate_id", activity.candidateId)
        .eq("title", activity.title)
        .limit(1);

      if (existing && existing.length > 0) {
        continue; // skip duplicate
      }

      const { error: insertErr } = await supabase
        .from("legislative_activity")
        .insert({
          candidate_id: activity.candidateId,
          activity_type: activity.activityType,
          title: activity.title,
          description: activity.description,
          source_url: activity.sourceUrl,
          date: activity.date || null,
        });

      if (insertErr) {
        error(`Failed to insert activity for ${inc.name}: ${insertErr.message}`);
        totalErrors++;
      } else {
        totalActivities++;
      }
    }

    // Update research status
    await supabase
      .from("candidates")
      .update({ research_status: "in_progress" })
      .eq("id", inc.id);
  }

  log(`\n========================================`);
  log(`Legislative fetch complete:`);
  log(`  Incumbents processed: ${resolved.length}`);
  log(`  Activities found: ${totalActivities}`);
  if (totalErrors > 0) log(`  Errors: ${totalErrors}`);
  log(`========================================`);
}

main().catch((err) => {
  error(`Fatal: ${err.message}`);
  process.exit(1);
});
