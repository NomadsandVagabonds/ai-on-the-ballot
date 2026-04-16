/**
 * Batch Research Orchestrator
 *
 * Combines research-candidate.ts and code-positions.ts into a single
 * end-to-end pipeline. For each candidate in the target states:
 *   1. Web research (if not already done)
 *   2. AI-assisted stance coding (if not already done)
 *   3. Coverage report
 *
 * Usage:
 *   npx tsx scripts/research-batch.ts                        # All launch states
 *   npx tsx scripts/research-batch.ts --states=TX,NC         # Specific states
 *   npx tsx scripts/research-batch.ts --batch-size=10        # Process 10 at a time
 *   npx tsx scripts/research-batch.ts --research-only        # Skip coding step
 *   npx tsx scripts/research-batch.ts --code-only            # Skip research step
 *   npx tsx scripts/research-batch.ts --dry-run              # Preview only
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
  loadEnv,
  LAUNCH_STATES,
  PATHS,
  ensureDir,
  sleep,
  log,
  warn,
  error,
  createScriptSupabaseClient,
} from "./pipeline-config";
import {
  researchCandidate,
  saveResearchPacket,
} from "./research-candidate";
import type { ResearchPacket } from "./research-candidate";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CandidateRecord {
  slug: string;
  name: string;
  party: string;
  state: string;
  office_sought: string;
  is_incumbent: boolean;
  campaign_url: string | null;
  research_status: string | null;
}

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  let states: string[] = [...LAUNCH_STATES];
  let batchSize = 20;
  let researchOnly = false;
  let codeOnly = false;
  let dryRun = false;

  for (const arg of args) {
    if (arg.startsWith("--states=")) {
      states = arg
        .replace("--states=", "")
        .split(",")
        .map((s) => s.trim().toUpperCase());
    } else if (arg.startsWith("--batch-size=")) {
      batchSize = parseInt(arg.replace("--batch-size=", ""), 10);
    } else if (arg === "--research-only") {
      researchOnly = true;
    } else if (arg === "--code-only") {
      codeOnly = true;
    } else if (arg === "--dry-run") {
      dryRun = true;
    }
  }

  return { states, batchSize, researchOnly, codeOnly, dryRun };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hasResearchPacket(slug: string, state: string): boolean {
  return fs.existsSync(
    path.join(PATHS.researchOutput, state, `${slug}.json`)
  );
}

function hasStagedPositions(slug: string, state: string): boolean {
  return fs.existsSync(
    path.join(PATHS.stagedPositions, state, `${slug}.json`)
  );
}

function loadResearchPacket(
  slug: string,
  state: string
): ResearchPacket | null {
  const filePath = path.join(PATHS.researchOutput, state, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// ---------------------------------------------------------------------------
// Inline coding (uses same logic as code-positions.ts but inline)
// ---------------------------------------------------------------------------

// Coding is done by shelling out to code-positions.ts (see Step 2 below)

// ---------------------------------------------------------------------------
// Coverage report
// ---------------------------------------------------------------------------

function printCoverageReport(
  candidates: CandidateRecord[],
  states: string[]
) {
  log("\n========================================");
  log("COVERAGE REPORT");
  log("========================================\n");

  const header = "State | Candidates | Researched | Coded    | Pending";
  const sep = "------+------------+------------+----------+--------";

  log(header);
  log(sep);

  let totalCandidates = 0;
  let totalResearched = 0;
  let totalCoded = 0;

  for (const state of states) {
    const stateCandidates = candidates.filter((c) => c.state === state);
    const researched = stateCandidates.filter((c) =>
      hasResearchPacket(c.slug, state)
    );
    const coded = stateCandidates.filter((c) =>
      hasStagedPositions(c.slug, state)
    );
    const pending = stateCandidates.length - coded.length;

    log(
      `${state.padEnd(5)} | ${String(stateCandidates.length).padStart(10)} | ${String(researched.length).padStart(10)} | ${String(coded.length).padStart(8)} | ${String(pending).padStart(6)}`
    );

    totalCandidates += stateCandidates.length;
    totalResearched += researched.length;
    totalCoded += coded.length;
  }

  log(sep);
  log(
    `TOTAL | ${String(totalCandidates).padStart(10)} | ${String(totalResearched).padStart(10)} | ${String(totalCoded).padStart(8)} | ${String(totalCandidates - totalCoded).padStart(6)}`
  );

  const coveragePercent =
    totalCandidates > 0
      ? ((totalCoded / totalCandidates) * 100).toFixed(1)
      : "0.0";
  log(`\nOverall coverage: ${coveragePercent}%`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { states, batchSize, researchOnly, codeOnly, dryRun } = parseArgs();

  loadEnv();

  log(`Target states: ${states.join(", ")}`);
  log(`Batch size: ${batchSize}`);
  if (researchOnly) log("Research only — skipping coding step");
  if (codeOnly) log("Code only — skipping research step");
  if (dryRun) log("DRY RUN mode");

  const supabase = await createScriptSupabaseClient();

  // Fetch all candidates in target states
  const { data: candidates, error: dbErr } = await supabase
    .from("candidates")
    .select(
      "slug, name, party, state, office_sought, is_incumbent, campaign_url, research_status"
    )
    .in("state", states)
    .order("state")
    .order("last_name");

  if (dbErr || !candidates) {
    error(`Failed to fetch candidates: ${dbErr?.message}`);
    process.exit(1);
  }

  log(`Found ${candidates.length} candidates across ${states.length} states`);

  // Ensure output directories exist
  for (const state of states) {
    ensureDir(path.join(PATHS.researchOutput, state));
    ensureDir(path.join(PATHS.stagedPositions, state));
  }

  // Build priority queue: incumbents first, then by state
  const sorted = [...candidates].sort((a, b) => {
    // Incumbents first (more likely to have public records)
    if (a.is_incumbent && !b.is_incumbent) return -1;
    if (!a.is_incumbent && b.is_incumbent) return 1;
    // Then by state
    return a.state.localeCompare(b.state);
  });

  // Step 1: Research phase
  if (!codeOnly) {
    const needsResearch = sorted.filter(
      (c) => !hasResearchPacket(c.slug, c.state)
    );

    log(`\n--- RESEARCH PHASE ---`);
    log(`${needsResearch.length} candidates need research`);

    const batch = needsResearch.slice(0, batchSize);
    log(`Processing batch of ${batch.length}`);

    for (let i = 0; i < batch.length; i++) {
      const cand = batch[i];
      log(
        `\n[${i + 1}/${batch.length}] ${cand.name} (${cand.party}-${cand.state}) ${cand.is_incumbent ? "[Incumbent]" : ""}`
      );

      if (dryRun) {
        log("  [DRY RUN] Would perform web research");
        continue;
      }

      try {
        const packet = await researchCandidate(cand);
        saveResearchPacket(packet);
        log(`  Saved ${packet.sources.length} sources`);

        // Update research status in DB
        await supabase
          .from("candidates")
          .update({ research_status: "in_progress" })
          .eq("slug", cand.slug);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        warn(`  Research failed: ${msg}`);
      }

      // Rate limit
      if (i < batch.length - 1) await sleep(3000);
    }
  }

  // Step 2: Coding phase
  if (!researchOnly) {
    const needsCoding = sorted.filter(
      (c) =>
        hasResearchPacket(c.slug, c.state) &&
        !hasStagedPositions(c.slug, c.state)
    );

    log(`\n--- CODING PHASE ---`);
    log(`${needsCoding.length} candidates need stance coding`);

    if (needsCoding.length > 0 && !dryRun) {
      log("Launching code-positions.ts for uncoded candidates...");

      // Shell out to code-positions.ts with the right states
      const statesArg = `--states=${states.join(",")}`;
      const { execSync } = await import("node:child_process");

      try {
        execSync(`npx tsx scripts/code-positions.ts ${statesArg}`, {
          cwd: PATHS.projectRoot,
          stdio: "inherit",
          timeout: 600_000, // 10 minute timeout
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        warn(`Coding step had errors: ${msg}`);
      }
    } else if (dryRun) {
      log("[DRY RUN] Would call Claude API for stance coding");
    }
  }

  // Step 3: Coverage report
  printCoverageReport(candidates, states);

  log("\nNext steps:");
  log("  1. Review staged positions: npx tsx scripts/review-positions.ts");
  log("  2. Import to production:    npx tsx scripts/import-full.ts");
}

main().catch((err) => {
  error(`Fatal: ${err.message}`);
  process.exit(1);
});
