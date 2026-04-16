/**
 * Coverage Report Script
 *
 * Queries the Supabase database and local staged files to generate
 * a comprehensive coverage dashboard showing research progress
 * across all states and candidates.
 *
 * Usage:
 *   npx tsx scripts/coverage-report.ts                      # Full report
 *   npx tsx scripts/coverage-report.ts --states=TX,NC       # Specific states
 *   npx tsx scripts/coverage-report.ts --detailed           # Per-candidate breakdown
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
  loadEnv,
  PATHS,
  ISSUE_CONFIGS,
  log,
  error,
  createScriptSupabaseClient,
} from "./pipeline-config";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  let states: string[] | null = null;
  let detailed = false;

  for (const arg of args) {
    if (arg.startsWith("--states=")) {
      states = arg
        .replace("--states=", "")
        .split(",")
        .map((s) => s.trim().toUpperCase());
    } else if (arg === "--detailed") {
      detailed = true;
    }
  }

  return { states, detailed };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { states, detailed } = parseArgs();

  loadEnv();

  const supabase = await createScriptSupabaseClient();

  // Fetch all candidates
  let candQuery = supabase
    .from("candidates")
    .select("id, name, slug, party, state, office_sought, is_incumbent, research_status")
    .order("state")
    .order("last_name");

  if (states) {
    candQuery = candQuery.in("state", states);
  }

  const { data: candidates, error: candErr } = await candQuery;
  if (candErr || !candidates) {
    error(`Failed to fetch candidates: ${candErr?.message}`);
    process.exit(1);
  }

  // Fetch all positions
  const candidateIds = candidates.map((c) => c.id);
  const { data: positions, error: posErr } = await supabase
    .from("positions")
    .select("candidate_id, issue_id, stance, confidence, source_url, research_method")
    .in("candidate_id", candidateIds);

  if (posErr) {
    error(`Failed to fetch positions: ${posErr.message}`);
    process.exit(1);
  }

  // Fetch legislative activity counts
  const { data: activities, error: actErr } = await supabase
    .from("legislative_activity")
    .select("candidate_id")
    .in("candidate_id", candidateIds);

  // Build lookup maps
  const positionsByCandidate = new Map<string, typeof positions>();
  for (const pos of positions || []) {
    if (!positionsByCandidate.has(pos.candidate_id)) {
      positionsByCandidate.set(pos.candidate_id, []);
    }
    positionsByCandidate.get(pos.candidate_id)!.push(pos);
  }

  const activityCountByCandidate = new Map<string, number>();
  for (const act of activities || []) {
    activityCountByCandidate.set(
      act.candidate_id,
      (activityCountByCandidate.get(act.candidate_id) || 0) + 1
    );
  }

  // Check local staged files
  const hasStagedFile = new Set<string>();
  if (fs.existsSync(PATHS.stagedPositions)) {
    const dirs = fs.readdirSync(PATHS.stagedPositions);
    for (const dir of dirs) {
      const stateDir = path.join(PATHS.stagedPositions, dir);
      if (!fs.statSync(stateDir).isDirectory()) continue;
      const files = fs.readdirSync(stateDir).filter((f) => f.endsWith(".json"));
      for (const f of files) {
        hasStagedFile.add(f.replace(".json", ""));
      }
    }
  }

  // Aggregate by state
  const stateGroups = new Map<string, typeof candidates>();
  for (const cand of candidates) {
    if (!stateGroups.has(cand.state)) {
      stateGroups.set(cand.state, []);
    }
    stateGroups.get(cand.state)!.push(cand);
  }

  // Print summary report
  console.log("\n" + "=".repeat(85));
  console.log("AI ON THE BALLOT — COVERAGE REPORT");
  console.log("=".repeat(85));
  console.log(
    `Generated: ${new Date().toISOString().slice(0, 10)}  |  Issues tracked: ${ISSUE_CONFIGS.length}  |  Candidates: ${candidates.length}`
  );
  console.log("=".repeat(85) + "\n");

  const header =
    "State | Candidates | Positions | Sourced | High Conf | Leg. Acts | Coverage";
  const sep =
    "------+------------+-----------+---------+-----------+-----------+---------";

  console.log(header);
  console.log(sep);

  let totalCandidates = 0;
  let totalPositions = 0;
  let totalSourced = 0;
  let totalHighConf = 0;
  let totalActivities = 0;

  const sortedStates = [...stateGroups.keys()].sort();

  for (const state of sortedStates) {
    const stateCandidates = stateGroups.get(state)!;
    const statePositionCount = stateCandidates.reduce(
      (sum, c) => sum + (positionsByCandidate.get(c.id)?.length || 0),
      0
    );
    const stateSourcedCount = stateCandidates.reduce(
      (sum, c) =>
        sum +
        (positionsByCandidate.get(c.id) || []).filter((p) => p.source_url)
          .length,
      0
    );
    const stateHighConfCount = stateCandidates.reduce(
      (sum, c) =>
        sum +
        (positionsByCandidate.get(c.id) || []).filter(
          (p) => p.confidence === "high"
        ).length,
      0
    );
    const stateActivityCount = stateCandidates.reduce(
      (sum, c) => sum + (activityCountByCandidate.get(c.id) || 0),
      0
    );

    const maxPositions = stateCandidates.length * ISSUE_CONFIGS.length;
    const coverage =
      maxPositions > 0
        ? ((statePositionCount / maxPositions) * 100).toFixed(0)
        : "0";

    console.log(
      `${state.padEnd(5)} | ${String(stateCandidates.length).padStart(10)} | ${String(statePositionCount).padStart(9)} | ${String(stateSourcedCount).padStart(7)} | ${String(stateHighConfCount).padStart(9)} | ${String(stateActivityCount).padStart(9)} | ${coverage.padStart(6)}%`
    );

    totalCandidates += stateCandidates.length;
    totalPositions += statePositionCount;
    totalSourced += stateSourcedCount;
    totalHighConf += stateHighConfCount;
    totalActivities += stateActivityCount;
  }

  console.log(sep);
  const totalMaxPositions = totalCandidates * ISSUE_CONFIGS.length;
  const totalCoverage =
    totalMaxPositions > 0
      ? ((totalPositions / totalMaxPositions) * 100).toFixed(0)
      : "0";

  console.log(
    `TOTAL | ${String(totalCandidates).padStart(10)} | ${String(totalPositions).padStart(9)} | ${String(totalSourced).padStart(7)} | ${String(totalHighConf).padStart(9)} | ${String(totalActivities).padStart(9)} | ${totalCoverage.padStart(6)}%`
  );

  // Research method breakdown
  const methodCounts: Record<string, number> = {};
  for (const pos of positions || []) {
    const method = pos.research_method || "unknown";
    methodCounts[method] = (methodCounts[method] || 0) + 1;
  }

  console.log("\nResearch methods:");
  for (const [method, count] of Object.entries(methodCounts)) {
    console.log(`  ${method}: ${count}`);
  }

  // Stance distribution
  const stanceCounts: Record<string, number> = {};
  for (const pos of positions || []) {
    stanceCounts[pos.stance] = (stanceCounts[pos.stance] || 0) + 1;
  }

  console.log("\nStance distribution:");
  for (const stance of ["support", "oppose", "mixed", "unclear", "no_mention"]) {
    const count = stanceCounts[stance] || 0;
    const pct =
      totalPositions > 0 ? ((count / totalPositions) * 100).toFixed(1) : "0";
    console.log(`  ${stance.padEnd(12)}: ${String(count).padStart(5)} (${pct}%)`);
  }

  // Research status breakdown
  const statusCounts: Record<string, number> = {};
  for (const cand of candidates) {
    const status = cand.research_status || "pending";
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  }

  console.log("\nCandidate research status:");
  for (const [status, count] of Object.entries(statusCounts)) {
    console.log(`  ${status}: ${count}`);
  }

  // Detailed per-candidate breakdown
  if (detailed) {
    console.log("\n" + "=".repeat(85));
    console.log("DETAILED CANDIDATE BREAKDOWN");
    console.log("=".repeat(85) + "\n");

    for (const state of sortedStates) {
      console.log(`\n--- ${state} ---`);

      const stateCandidates = stateGroups.get(state)!;
      for (const cand of stateCandidates) {
        const candPositions = positionsByCandidate.get(cand.id) || [];
        const actCount = activityCountByCandidate.get(cand.id) || 0;
        const sourced = candPositions.filter((p) => p.source_url).length;
        const staged = hasStagedFile.has(cand.slug) ? " [staged]" : "";
        const status = cand.research_status || "pending";

        console.log(
          `  ${cand.name} (${cand.party}) — ${candPositions.length}/${ISSUE_CONFIGS.length} positions, ${sourced} sourced, ${actCount} leg. acts — [${status}]${staged}`
        );

        if (candPositions.length > 0) {
          for (const pos of candPositions) {
            const issueConfig = ISSUE_CONFIGS.find(
              (i) => i.slug === pos.issue_id
            );
            // We have issue_id not slug, so just show what we have
            const src = pos.source_url ? " [sourced]" : "";
            console.log(
              `    ${pos.stance.padEnd(12)} (${pos.confidence})${src}`
            );
          }
        }
      }
    }
  }

  console.log("\n" + "=".repeat(85));
}

main().catch((err) => {
  error(`Fatal: ${err.message}`);
  process.exit(1);
});
