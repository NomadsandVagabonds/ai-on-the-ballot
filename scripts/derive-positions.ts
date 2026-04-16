/**
 * Position Derivation Script
 *
 * Reads legislative_activity records from the database and auto-derives
 * stance codings for incumbent candidates based on their voting records
 * and bill sponsorships.
 *
 * Uses data/bill-to-issue-mapping.json for rules that map bill keywords
 * to issue categories and expected stances.
 *
 * Usage:
 *   npx tsx scripts/derive-positions.ts                    # All incumbents
 *   npx tsx scripts/derive-positions.ts --states=TX,NC     # Specific states
 *   npx tsx scripts/derive-positions.ts --dry-run          # Preview without DB writes
 */

import * as fs from "node:fs";
import {
  loadEnv,
  PATHS,
  log,
  warn,
  error,
  createScriptSupabaseClient,
} from "./pipeline-config";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MappingRule {
  pattern: string;
  issue: string;
  stance_if_sponsored: string;
  stance_if_voted_for: string;
  stance_if_voted_against: string;
}

interface DerivedPosition {
  candidateId: string;
  candidateName: string;
  issueSlug: string;
  stance: string;
  confidence: string;
  summary: string;
  sourceUrl: string;
  dateRecorded: string;
  activityTitle: string;
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
// Core logic
// ---------------------------------------------------------------------------

function loadMappingRules(): MappingRule[] {
  if (!fs.existsSync(PATHS.billToIssueMapping)) {
    error(`Mapping file not found: ${PATHS.billToIssueMapping}`);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(PATHS.billToIssueMapping, "utf-8"));
  return data.rules;
}

function matchRules(
  title: string,
  description: string,
  activityType: string,
  rules: MappingRule[]
): { issueSlug: string; stance: string }[] {
  const combined = `${title} ${description}`.toLowerCase();
  const matches: { issueSlug: string; stance: string }[] = [];
  const seenIssues = new Set<string>();

  for (const rule of rules) {
    if (seenIssues.has(rule.issue)) continue;

    if (combined.includes(rule.pattern.toLowerCase())) {
      let stance: string;
      if (
        activityType === "bill_sponsored" ||
        activityType === "bill_cosponsored"
      ) {
        stance = rule.stance_if_sponsored;
      } else if (activityType === "vote") {
        // For votes we'd need to know the vote direction — default to support
        // (the vote direction would come from the Congress.gov vote data)
        stance = rule.stance_if_voted_for;
      } else {
        stance = rule.stance_if_sponsored;
      }

      matches.push({ issueSlug: rule.issue, stance });
      seenIssues.add(rule.issue);
    }
  }

  return matches;
}

function generateSummary(
  candidateName: string,
  activityType: string,
  title: string,
  issueDisplayName: string
): string {
  const verb =
    activityType === "bill_sponsored"
      ? "sponsored"
      : activityType === "bill_cosponsored"
        ? "co-sponsored"
        : activityType === "vote"
          ? "voted on"
          : "engaged with";

  // Clean up the title for the summary
  const shortTitle = title.length > 100 ? title.slice(0, 97) + "..." : title;

  return `${candidateName} ${verb} ${shortTitle}, demonstrating engagement with ${issueDisplayName} issues.`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { states, dryRun } = parseArgs();

  loadEnv();

  if (dryRun) log("DRY RUN mode — no database writes");

  const supabase = await createScriptSupabaseClient();
  const rules = loadMappingRules();
  log(`Loaded ${rules.length} bill-to-issue mapping rules`);

  // Load issue IDs by slug
  const { data: issues, error: issueErr } = await supabase
    .from("issues")
    .select("id, slug, display_name");

  if (issueErr || !issues) {
    error(`Failed to fetch issues: ${issueErr?.message}`);
    process.exit(1);
  }

  const issueMap = new Map<string, { id: string; displayName: string }>();
  for (const iss of issues) {
    issueMap.set(iss.slug, { id: iss.id, displayName: iss.display_name });
  }

  // Get all incumbents with their legislative activity
  let candidateQuery = supabase
    .from("candidates")
    .select("id, name, slug, state")
    .eq("is_incumbent", true);

  if (states) {
    candidateQuery = candidateQuery.in("state", states);
  }

  const { data: candidates, error: candErr } = await candidateQuery;

  if (candErr || !candidates) {
    error(`Failed to fetch candidates: ${candErr?.message}`);
    process.exit(1);
  }

  log(`Processing ${candidates.length} incumbent candidates`);

  let derivedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const cand of candidates) {
    // Fetch legislative activity for this candidate
    const { data: activities, error: actErr } = await supabase
      .from("legislative_activity")
      .select("*")
      .eq("candidate_id", cand.id);

    if (actErr || !activities) {
      warn(`Failed to fetch activities for ${cand.name}: ${actErr?.message}`);
      continue;
    }

    if (activities.length === 0) continue;

    log(`\n${cand.name}: ${activities.length} legislative activities`);

    // Derive positions from each activity
    const derived: DerivedPosition[] = [];

    for (const act of activities) {
      const matches = matchRules(
        act.title,
        act.description || "",
        act.activity_type,
        rules
      );

      for (const match of matches) {
        const issueInfo = issueMap.get(match.issueSlug);
        if (!issueInfo) continue;

        derived.push({
          candidateId: cand.id,
          candidateName: cand.name,
          issueSlug: match.issueSlug,
          stance: match.stance,
          confidence: "high", // direct legislative action = high confidence
          summary: generateSummary(
            cand.name,
            act.activity_type,
            act.title,
            issueInfo.displayName
          ),
          sourceUrl: act.source_url || "",
          dateRecorded: act.date || "",
          activityTitle: act.title,
        });
      }
    }

    // Deduplicate: keep one position per issue (prefer sponsored over cosponsored)
    const byIssue = new Map<string, DerivedPosition>();
    for (const d of derived) {
      const existing = byIssue.get(d.issueSlug);
      if (!existing) {
        byIssue.set(d.issueSlug, d);
      }
      // If we already have one from a "stronger" action, keep it
    }

    for (const [issueSlug, position] of byIssue) {
      const issueInfo = issueMap.get(issueSlug)!;

      if (dryRun) {
        log(
          `  [DERIVE] ${issueInfo.displayName}: ${position.stance} (${position.confidence}) — from: ${position.activityTitle}`
        );
        derivedCount++;
        continue;
      }

      // Check if a position already exists
      const { data: existing } = await supabase
        .from("positions")
        .select("id, research_method")
        .eq("candidate_id", cand.id)
        .eq("issue_id", issueInfo.id)
        .limit(1);

      if (existing && existing.length > 0) {
        // Don't overwrite manually coded positions
        if (
          existing[0].research_method === "manual" ||
          existing[0].research_method === "ai_assisted"
        ) {
          skippedCount++;
          continue;
        }
      }

      // Upsert the derived position
      const { error: posErr } = await supabase.from("positions").upsert(
        {
          candidate_id: cand.id,
          issue_id: issueInfo.id,
          stance: position.stance,
          confidence: position.confidence,
          summary: position.summary,
          source_url: position.sourceUrl || null,
          date_recorded: position.dateRecorded || null,
          research_method: "derived_from_legislation",
          last_updated: new Date().toISOString(),
        },
        { onConflict: "candidate_id,issue_id" }
      );

      if (posErr) {
        error(
          `Failed to upsert position for ${cand.name}/${issueSlug}: ${posErr.message}`
        );
        errorCount++;
      } else {
        derivedCount++;
        log(
          `  ${issueInfo.displayName}: ${position.stance} (derived from ${position.activityTitle})`
        );
      }
    }
  }

  log(`\n========================================`);
  log(`Position derivation complete:`);
  log(`  Positions derived: ${derivedCount}`);
  log(`  Skipped (already manually coded): ${skippedCount}`);
  if (errorCount > 0) log(`  Errors: ${errorCount}`);
  log(`========================================`);
}

main().catch((err) => {
  error(`Fatal: ${err.message}`);
  process.exit(1);
});
