/**
 * Import trackerv3_import.json into Supabase.
 *
 *   npx tsx scripts/import-trackerv3.ts --dry-run
 *   npx tsx scripts/import-trackerv3.ts --wipe
 *
 * `--wipe` deletes existing candidates, positions, races, race_candidates,
 * and issues before inserting so the DB is an exact mirror of the sheet.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
  loadEnv,
  log,
  warn,
  error,
  createScriptSupabaseClient,
} from "./pipeline-config";

interface ImportedIssue {
  slug: string;
  display_name: string;
  description: string;
  sort_order: number;
}
interface ImportedCandidate {
  sheet_id: string;
  slug: string;
  name: string;
  first_name: string;
  last_name: string;
  party: string;
  state: string;
  district: string | null;
  office_sought: string;
  is_incumbent: boolean;
  total_raised: number | null;
  chamber: "senate" | "house" | "governor";
  race_slug: string;
}
interface ImportedRace {
  slug: string;
  state: string;
  chamber: "senate" | "house" | "governor";
  district: string | null;
  election_year: number;
  race_type: "regular" | "special";
}
interface ImportedPosition {
  candidate_slug: string;
  issue_slug: string;
  stance: string;
  confidence: string;
  summary: string | null;
  source_url: string | null;
  date_recorded: string | null;
}
interface ImportBundle {
  issues: ImportedIssue[];
  candidates: ImportedCandidate[];
  races: ImportedRace[];
  positions: ImportedPosition[];
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes("--dry-run"),
    wipe: args.includes("--wipe"),
    inputPath:
      args.find((a) => a.startsWith("--input="))?.replace("--input=", "") ??
      path.resolve(__dirname, "trackerv3_import.json"),
  };
}

async function main() {
  const { dryRun, wipe, inputPath } = parseArgs();
  loadEnv();

  const json = fs.readFileSync(inputPath, "utf8");
  const data = JSON.parse(json) as ImportBundle;

  log(
    `Loaded ${data.issues.length} issues, ${data.candidates.length} candidates, ${data.races.length} races, ${data.positions.length} positions`
  );
  if (dryRun) log("DRY RUN — no writes");

  const supabase = await createScriptSupabaseClient();

  // -------------------------------------------------------------------------
  // Wipe (optional)
  // -------------------------------------------------------------------------
  if (wipe && !dryRun) {
    log("Wiping existing data…");
    // Cascade deletes handle positions + race_candidates + legislative_activity
    await supabase
      .from("positions")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("race_candidates")
      .delete()
      .neq("candidate_id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("legislative_activity")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("candidates")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("races")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase
      .from("issues")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    log("Wipe complete");
  }

  // -------------------------------------------------------------------------
  // Issues
  // -------------------------------------------------------------------------
  log("Upserting issues…");
  if (!dryRun) {
    const payload = data.issues.map((i) => ({
      slug: i.slug,
      display_name: i.display_name,
      description: i.description,
      sort_order: i.sort_order,
      icon: null as string | null,
    }));
    const { error: e } = await supabase
      .from("issues")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(payload as any, { onConflict: "slug" });
    if (e) {
      error(`Issues upsert failed: ${e.message}`);
      process.exit(1);
    }
  }

  // Load issue IDs
  const { data: issueRows, error: issueErr } = await supabase
    .from("issues")
    .select("id, slug");
  if (issueErr || !issueRows) {
    error(`Failed to read back issues: ${issueErr?.message}`);
    process.exit(1);
  }
  const issueIdBySlug = new Map<string, string>();
  for (const row of issueRows) issueIdBySlug.set(row.slug, row.id);

  // -------------------------------------------------------------------------
  // Candidates
  // -------------------------------------------------------------------------
  log(`Upserting ${data.candidates.length} candidates…`);
  if (!dryRun) {
    const payload = data.candidates.map((c) => ({
      slug: c.slug,
      name: c.name,
      first_name: c.first_name,
      last_name: c.last_name,
      party: c.party,
      state: c.state,
      district: c.district,
      office_sought: c.office_sought,
      committee_assignments: [] as string[],
      election_year: 2026,
      fec_id: null as string | null,
      bioguide_id: null as string | null,
      photo_url: null as string | null,
      is_incumbent: c.is_incumbent,
      total_raised: c.total_raised,
    }));
    // Batch insert in chunks of 100 to stay friendly with Supabase
    for (let i = 0; i < payload.length; i += 100) {
      const chunk = payload.slice(i, i + 100);
      const { error: e } = await supabase
        .from("candidates")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(chunk as any, { onConflict: "slug" });
      if (e) {
        error(`Candidate upsert failed at offset ${i}: ${e.message}`);
        process.exit(1);
      }
    }
  }

  // Load candidate IDs
  const { data: candRows, error: candErr } = await supabase
    .from("candidates")
    .select("id, slug");
  if (candErr || !candRows) {
    error(`Failed to read back candidates: ${candErr?.message}`);
    process.exit(1);
  }
  const candidateIdBySlug = new Map<string, string>();
  for (const row of candRows) candidateIdBySlug.set(row.slug, row.id);

  // -------------------------------------------------------------------------
  // Races
  // -------------------------------------------------------------------------
  log(`Upserting ${data.races.length} races…`);
  if (!dryRun) {
    const payload = data.races.map((r) => ({
      slug: r.slug,
      state: r.state,
      chamber: r.chamber,
      district: r.district,
      election_year: r.election_year,
      race_type: r.race_type,
    }));
    const { error: e } = await supabase
      .from("races")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(payload as any, { onConflict: "slug" });
    if (e) {
      error(`Races upsert failed: ${e.message}`);
      process.exit(1);
    }
  }

  // Load race IDs
  const { data: raceRows, error: raceErr } = await supabase
    .from("races")
    .select("id, slug");
  if (raceErr || !raceRows) {
    error(`Failed to read back races: ${raceErr?.message}`);
    process.exit(1);
  }
  const raceIdBySlug = new Map<string, string>();
  for (const row of raceRows) raceIdBySlug.set(row.slug, row.id);

  // -------------------------------------------------------------------------
  // race_candidates
  // -------------------------------------------------------------------------
  log(`Linking candidates to races…`);
  if (!dryRun) {
    const rc: Array<{ race_id: string; candidate_id: string }> = [];
    for (const c of data.candidates) {
      const cid = candidateIdBySlug.get(c.slug);
      const rid = raceIdBySlug.get(c.race_slug);
      if (!cid || !rid) {
        warn(`Missing race link for ${c.slug} -> ${c.race_slug}`);
        continue;
      }
      rc.push({ race_id: rid, candidate_id: cid });
    }
    for (let i = 0; i < rc.length; i += 200) {
      const chunk = rc.slice(i, i + 200);
      const { error: e } = await supabase
        .from("race_candidates")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(chunk as any, { onConflict: "race_id,candidate_id" });
      if (e) {
        error(`race_candidates upsert failed at ${i}: ${e.message}`);
        process.exit(1);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Positions
  // -------------------------------------------------------------------------
  log(`Upserting ${data.positions.length} positions…`);
  if (!dryRun) {
    const payload = data.positions
      .map((p) => {
        const cid = candidateIdBySlug.get(p.candidate_slug);
        const iid = issueIdBySlug.get(p.issue_slug);
        if (!cid || !iid) {
          return null;
        }
        return {
          candidate_id: cid,
          issue_id: iid,
          stance: p.stance,
          confidence: p.confidence,
          summary: p.summary,
          full_quote: null as string | null,
          source_url: p.source_url,
          date_recorded: p.date_recorded,
        };
      })
      .filter(Boolean) as Array<Record<string, unknown>>;

    for (let i = 0; i < payload.length; i += 500) {
      const chunk = payload.slice(i, i + 500);
      const { error: e } = await supabase
        .from("positions")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert(chunk as any, { onConflict: "candidate_id,issue_id" });
      if (e) {
        error(`positions upsert failed at ${i}: ${e.message}`);
        process.exit(1);
      }
    }
  }

  log("Import complete.");
}

main().catch((e) => {
  error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
