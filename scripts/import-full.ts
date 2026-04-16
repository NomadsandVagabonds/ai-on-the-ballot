/**
 * Full Position Import Script
 *
 * Reads reviewed staged positions from data/staged-positions/ and
 * upserts them into the production Supabase database. Only imports
 * records marked as reviewed: true.
 *
 * Usage:
 *   npx tsx scripts/import-full.ts                          # All states
 *   npx tsx scripts/import-full.ts --states=TX,NC           # Specific states
 *   npx tsx scripts/import-full.ts --force                  # Import even if not reviewed
 *   npx tsx scripts/import-full.ts --dry-run                # Preview without DB writes
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
  loadEnv,
  PATHS,
  log,
  warn,
  error,
  createScriptSupabaseClient,
} from "./pipeline-config";
import type { StagedCandidateFile, StagedPosition } from "./code-positions";

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  let states: string[] | null = null;
  let force = false;
  let dryRun = false;

  for (const arg of args) {
    if (arg.startsWith("--states=")) {
      states = arg
        .replace("--states=", "")
        .split(",")
        .map((s) => s.trim().toUpperCase());
    } else if (arg === "--force") {
      force = true;
    } else if (arg === "--dry-run") {
      dryRun = true;
    }
  }

  return { states, force, dryRun };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { states, force, dryRun } = parseArgs();

  loadEnv();

  if (dryRun) log("DRY RUN mode — no database writes");
  if (force) log("FORCE mode — importing unreviewed positions too");

  const supabase = await createScriptSupabaseClient();

  // Load issue IDs by slug
  const { data: issues, error: issueErr } = await supabase
    .from("issues")
    .select("id, slug");

  if (issueErr || !issues) {
    error(`Failed to fetch issues: ${issueErr?.message}`);
    process.exit(1);
  }

  const issueMap = new Map<string, string>();
  for (const iss of issues) {
    issueMap.set(iss.slug, iss.id);
  }

  // Find all staged position files
  if (!fs.existsSync(PATHS.stagedPositions)) {
    error("No staged positions directory. Run the research pipeline first.");
    process.exit(1);
  }

  const stateDirs = fs.readdirSync(PATHS.stagedPositions);
  const filesToProcess: { state: string; filePath: string }[] = [];

  for (const dir of stateDirs) {
    if (states && !states.includes(dir)) continue;

    const stateDir = path.join(PATHS.stagedPositions, dir);
    if (!fs.statSync(stateDir).isDirectory()) continue;

    const files = fs.readdirSync(stateDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      filesToProcess.push({
        state: dir,
        filePath: path.join(stateDir, file),
      });
    }
  }

  log(`Found ${filesToProcess.length} staged candidate files`);

  let totalImported = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const { filePath } of filesToProcess) {
    const staged: StagedCandidateFile = JSON.parse(
      fs.readFileSync(filePath, "utf-8")
    );

    // Look up candidate in database
    const { data: cand, error: candErr } = await supabase
      .from("candidates")
      .select("id")
      .eq("slug", staged.candidateSlug)
      .single();

    if (candErr || !cand) {
      warn(
        `Candidate not found in DB: ${staged.candidateSlug} — skipping (run fec-candidates.ts first)`
      );
      totalSkipped++;
      continue;
    }

    log(`\n${staged.candidateName} (${staged.party}-${staged.state}):`);

    for (const pos of staged.positions) {
      // Skip unreviewed positions unless --force
      if (!pos.reviewed && !force) {
        log(`  [SKIP] ${pos.issue} — not reviewed`);
        totalSkipped++;
        continue;
      }

      const issueId = issueMap.get(pos.issue);
      if (!issueId) {
        warn(`  Unknown issue slug: ${pos.issue}`);
        totalErrors++;
        continue;
      }

      if (dryRun) {
        log(
          `  [DRY RUN] ${pos.issue}: ${pos.stance} (${pos.confidence}) — ${pos.summary.slice(0, 60)}...`
        );
        totalImported++;
        continue;
      }

      const { error: posErr } = await supabase.from("positions").upsert(
        {
          candidate_id: cand.id,
          issue_id: issueId,
          stance: pos.stance,
          confidence: pos.confidence,
          summary: pos.summary,
          full_quote: pos.fullQuote,
          source_url: pos.sourceUrl,
          date_recorded: pos.dateRecorded,
          research_method: pos.researchMethod,
          reviewed_at: pos.reviewed ? new Date().toISOString() : null,
          last_updated: new Date().toISOString(),
        },
        { onConflict: "candidate_id,issue_id" }
      );

      if (posErr) {
        error(
          `  Failed to upsert ${pos.issue}: ${posErr.message}`
        );
        totalErrors++;
      } else {
        log(`  ${pos.issue}: ${pos.stance} (${pos.confidence})`);
        totalImported++;
      }
    }

    // Update candidate research status
    if (!dryRun) {
      const allReviewed = staged.positions.every((p) => p.reviewed);
      await supabase
        .from("candidates")
        .update({
          research_status: allReviewed ? "reviewed" : "in_progress",
        })
        .eq("id", cand.id);
    }
  }

  log(`\n========================================`);
  log(`Import complete:`);
  log(`  Positions imported: ${totalImported}`);
  log(`  Positions skipped (unreviewed): ${totalSkipped}`);
  if (totalErrors > 0) log(`  Errors: ${totalErrors}`);
  log(`========================================`);
}

main().catch((err) => {
  error(`Fatal: ${err.message}`);
  process.exit(1);
});
