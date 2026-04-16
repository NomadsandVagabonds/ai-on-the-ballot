/**
 * Interactive Position Review CLI
 *
 * Reads AI-proposed positions from data/staged-positions/ and presents
 * them one at a time for human review. Accepted positions get marked
 * as reviewed: true so they can be imported to production.
 *
 * Usage:
 *   npx tsx scripts/review-positions.ts                     # Review all
 *   npx tsx scripts/review-positions.ts --states=TX         # Specific states
 *   npx tsx scripts/review-positions.ts --auto-accept       # Accept all without prompting
 *   npx tsx scripts/review-positions.ts --stats             # Show review stats only
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import {
  loadEnv,
  PATHS,
  ISSUE_CONFIGS,
  log,
  warn,
} from "./pipeline-config";
import type { StagedCandidateFile, StagedPosition } from "./code-positions";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  let states: string[] | null = null;
  let autoAccept = false;
  let statsOnly = false;

  for (const arg of args) {
    if (arg.startsWith("--states=")) {
      states = arg
        .replace("--states=", "")
        .split(",")
        .map((s) => s.trim().toUpperCase());
    } else if (arg === "--auto-accept") {
      autoAccept = true;
    } else if (arg === "--stats") {
      statsOnly = true;
    }
  }

  return { states, autoAccept, statsOnly };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getIssueDisplayName(slug: string): string {
  const issue = ISSUE_CONFIGS.find((i) => i.slug === slug);
  return issue?.displayName || slug;
}

function stanceColor(stance: string): string {
  const colors: Record<string, string> = {
    support: "\x1b[32m", // green
    oppose: "\x1b[31m", // red
    mixed: "\x1b[33m", // yellow
    unclear: "\x1b[90m", // gray
    no_mention: "\x1b[90m", // gray
  };
  return `${colors[stance] || ""}${stance.toUpperCase()}\x1b[0m`;
}

function confidenceLabel(conf: string): string {
  const markers: Record<string, string> = {
    high: "\x1b[1m[HIGH]\x1b[0m",
    medium: "\x1b[33m[MED]\x1b[0m",
    low: "\x1b[90m[LOW]\x1b[0m",
  };
  return markers[conf] || conf;
}

async function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim().toLowerCase()));
  });
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

interface ReviewStats {
  total: number;
  reviewed: number;
  pending: number;
  byStance: Record<string, number>;
  byConfidence: Record<string, number>;
  byState: Record<string, { total: number; reviewed: number }>;
}

function collectStats(states: string[] | null): ReviewStats {
  const stats: ReviewStats = {
    total: 0,
    reviewed: 0,
    pending: 0,
    byStance: {},
    byConfidence: {},
    byState: {},
  };

  const stateDirs = fs.readdirSync(PATHS.stagedPositions);

  for (const dir of stateDirs) {
    if (states && !states.includes(dir)) continue;

    const stateDir = path.join(PATHS.stagedPositions, dir);
    if (!fs.statSync(stateDir).isDirectory()) continue;

    const stateStats = { total: 0, reviewed: 0 };

    const files = fs.readdirSync(stateDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const filePath = path.join(stateDir, file);
      const staged: StagedCandidateFile = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
      );

      for (const pos of staged.positions) {
        stats.total++;
        stateStats.total++;

        if (pos.reviewed) {
          stats.reviewed++;
          stateStats.reviewed++;
        } else {
          stats.pending++;
        }

        stats.byStance[pos.stance] = (stats.byStance[pos.stance] || 0) + 1;
        stats.byConfidence[pos.confidence] =
          (stats.byConfidence[pos.confidence] || 0) + 1;
      }
    }

    stats.byState[dir] = stateStats;
  }

  return stats;
}

function printStats(stats: ReviewStats) {
  log("\n========================================");
  log("REVIEW STATISTICS");
  log("========================================\n");

  log(
    `Total positions: ${stats.total} | Reviewed: ${stats.reviewed} | Pending: ${stats.pending}`
  );
  log(
    `Progress: ${stats.total > 0 ? ((stats.reviewed / stats.total) * 100).toFixed(1) : 0}%`
  );

  log("\nBy state:");
  for (const [state, s] of Object.entries(stats.byState)) {
    const pct = s.total > 0 ? ((s.reviewed / s.total) * 100).toFixed(0) : "0";
    log(
      `  ${state}: ${s.reviewed}/${s.total} reviewed (${pct}%)`
    );
  }

  log("\nStance distribution:");
  for (const [stance, count] of Object.entries(stats.byStance)) {
    const pct =
      stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : "0";
    log(`  ${stance}: ${count} (${pct}%)`);
  }

  log("\nConfidence distribution:");
  for (const [conf, count] of Object.entries(stats.byConfidence)) {
    const pct =
      stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : "0";
    log(`  ${conf}: ${count} (${pct}%)`);
  }
}

// ---------------------------------------------------------------------------
// Interactive review
// ---------------------------------------------------------------------------

async function reviewPositions(
  states: string[] | null,
  autoAccept: boolean
) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const stateDirs = fs.readdirSync(PATHS.stagedPositions);
  let reviewedCount = 0;
  let acceptedCount = 0;
  let rejectedCount = 0;
  let skippedCount = 0;

  for (const dir of stateDirs) {
    if (states && !states.includes(dir)) continue;

    const stateDir = path.join(PATHS.stagedPositions, dir);
    if (!fs.statSync(stateDir).isDirectory()) continue;

    const files = fs.readdirSync(stateDir).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const filePath = path.join(stateDir, file);
      const staged: StagedCandidateFile = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
      );

      // Skip if all positions already reviewed
      if (staged.positions.every((p) => p.reviewed)) continue;

      let fileModified = false;

      for (let i = 0; i < staged.positions.length; i++) {
        const pos = staged.positions[i];
        if (pos.reviewed) continue;

        console.log("\n" + "=".repeat(60));
        console.log(
          `${staged.candidateName} (${staged.party}-${staged.state}) — ${getIssueDisplayName(pos.issue)}`
        );
        console.log("=".repeat(60));
        console.log(`Stance:     ${stanceColor(pos.stance)}`);
        console.log(`Confidence: ${confidenceLabel(pos.confidence)}`);
        console.log(`Summary:    ${pos.summary}`);
        if (pos.fullQuote) {
          console.log(`Quote:      "${pos.fullQuote}"`);
        }
        if (pos.sourceUrl) {
          console.log(`Source:     ${pos.sourceUrl}`);
        }
        console.log(`\nAI reasoning: ${pos.aiReasoning}`);

        if (autoAccept) {
          staged.positions[i] = { ...pos, reviewed: true } as StagedPosition;
          fileModified = true;
          acceptedCount++;
          console.log("  → Auto-accepted");
          continue;
        }

        const answer = await prompt(
          rl,
          "\n[a]ccept  [r]eject  [s]kip  [o]pen URL  [q]uit > "
        );

        switch (answer) {
          case "a":
          case "accept":
            staged.positions[i] = { ...pos, reviewed: true } as StagedPosition;
            fileModified = true;
            acceptedCount++;
            console.log("  → Accepted");
            break;

          case "r":
          case "reject":
            // Mark as no_mention with a note
            staged.positions[i] = {
              ...pos,
              stance: "no_mention",
              confidence: "low",
              summary: "[Rejected during review — needs manual research]",
              reviewed: false,
              aiReasoning: `Original: ${pos.stance}/${pos.confidence}. Rejected by reviewer.`,
            } as StagedPosition;
            fileModified = true;
            rejectedCount++;
            console.log("  → Rejected (reset to no_mention)");
            break;

          case "s":
          case "skip":
            skippedCount++;
            console.log("  → Skipped");
            break;

          case "o":
          case "open":
            if (pos.sourceUrl) {
              const { execSync } = await import("node:child_process");
              try {
                execSync(`open "${pos.sourceUrl}"`);
              } catch {
                console.log(`  Open this URL: ${pos.sourceUrl}`);
              }
            } else {
              console.log("  No source URL available");
            }
            // Re-prompt after opening
            i--;
            continue;

          case "q":
          case "quit":
            if (fileModified) {
              fs.writeFileSync(filePath, JSON.stringify(staged, null, 2));
            }
            log(
              `\nSession: ${acceptedCount} accepted, ${rejectedCount} rejected, ${skippedCount} skipped`
            );
            rl.close();
            return;

          default:
            console.log("  Unknown command. Use a/r/s/o/q.");
            i--;
            continue;
        }

        reviewedCount++;
      }

      if (fileModified) {
        fs.writeFileSync(filePath, JSON.stringify(staged, null, 2));
      }
    }
  }

  rl.close();

  log(`\n========================================`);
  log(`Review session complete:`);
  log(`  Accepted: ${acceptedCount}`);
  log(`  Rejected: ${rejectedCount}`);
  log(`  Skipped: ${skippedCount}`);
  log(`========================================`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { states, autoAccept, statsOnly } = parseArgs();

  loadEnv();

  if (!fs.existsSync(PATHS.stagedPositions)) {
    console.error(
      "No staged positions found. Run the research pipeline first:\n" +
        "  npx tsx scripts/research-batch.ts"
    );
    process.exit(1);
  }

  if (statsOnly) {
    const stats = collectStats(states);
    printStats(stats);
    return;
  }

  // Show stats first
  const stats = collectStats(states);
  printStats(stats);

  if (stats.pending === 0) {
    log("\nAll positions are reviewed! Ready to import:");
    log("  npx tsx scripts/import-full.ts");
    return;
  }

  log(`\n${stats.pending} positions pending review...\n`);

  if (autoAccept) {
    warn("Auto-accept mode: all positions will be marked as reviewed");
  }

  await reviewPositions(states, autoAccept);
}

main().catch((err) => {
  console.error(`Fatal: ${err.message}`);
  process.exit(1);
});
