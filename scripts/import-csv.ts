/**
 * CSV Import Script for AI on the Ballot
 *
 * Reads a CSV file (exported from Google Sheets) and upserts candidate
 * and position data into Supabase.
 *
 * Usage:
 *   npx tsx scripts/import-csv.ts path/to/data.csv
 *
 * Expected CSV format:
 *   Name,Party,State,District,Office,IsIncumbent,ExportControl,MilitaryAI,Regulation,DataCenters,ChildrenSafety
 *   Ted Cruz,R,TX,,U.S. Senate,true,support,support,oppose,mixed,support
 *
 * Reads env vars from .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// We use an untyped Supabase client here since this is a standalone script.
// The Database types in src/types/database.ts are the source of truth for the
// schema, but the generic parameter structure required by the Supabase client
// is more complex than the project's simplified Database interface.

type Stance = "support" | "oppose" | "mixed" | "unclear" | "no_mention";

interface CsvRow {
  Name: string;
  Party: string;
  State: string;
  District: string;
  Office: string;
  IsIncumbent: string;
  ExportControl: string;
  MilitaryAI: string;
  Regulation: string;
  DataCenters: string;
  ChildrenSafety: string;
}

const ISSUE_COLUMN_TO_SLUG: Record<string, string> = {
  ExportControl: "export-control",
  MilitaryAI: "military-ai",
  Regulation: "regulation",
  DataCenters: "data-centers",
  ChildrenSafety: "children-safety",
};

const VALID_STANCES: Set<string> = new Set([
  "support",
  "oppose",
  "mixed",
  "unclear",
  "no_mention",
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Load env vars from .env.local */
function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("ERROR: .env.local not found at", envPath);
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

/** Minimal CSV parser — handles quoted fields and commas within quotes. */
function parseCsv(raw: string): CsvRow[] {
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    console.error("ERROR: CSV must have a header row and at least one data row");
    process.exit(1);
  }

  const parseRow = (line: string): string[] => {
    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        fields.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    fields.push(current.trim());
    return fields;
  };

  const headers = parseRow(lines[0]);
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] ?? "";
    }
    rows.push(obj as unknown as CsvRow);
  }

  return rows;
}

/** Generate a URL-friendly slug from name parts and state. */
function makeSlug(firstName: string, lastName: string, state: string): string {
  return `${firstName}-${lastName}-${state}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Split "First Last" into [first, last]. Handles multi-word last names. */
function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: parts[0] };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: npx tsx scripts/import-csv.ts <path-to-csv>");
    process.exit(1);
  }

  const resolvedPath = path.resolve(csvPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`ERROR: File not found: ${resolvedPath}`);
    process.exit(1);
  }

  loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error(
      "ERROR: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // ---- Load issue IDs by slug ----
  const { data: issues, error: issueErr } = await supabase
    .from("issues")
    .select("id, slug");

  if (issueErr || !issues) {
    console.error("ERROR: Failed to fetch issues:", issueErr?.message);
    process.exit(1);
  }

  const issueMap = new Map<string, string>();
  for (const issue of issues) {
    issueMap.set(issue.slug, issue.id);
  }

  // ---- Parse CSV ----
  const raw = fs.readFileSync(resolvedPath, "utf-8");
  const rows = parseCsv(raw);
  console.log(`Parsed ${rows.length} rows from CSV`);

  let successCount = 0;
  let errorCount = 0;

  for (const row of rows) {
    const { first, last } = splitName(row.Name);
    const slug = makeSlug(first, last, row.State);
    const isIncumbent =
      row.IsIncumbent?.toLowerCase() === "true" ||
      row.IsIncumbent === "1" ||
      row.IsIncumbent?.toLowerCase() === "yes";

    console.log(`\nProcessing: ${row.Name} (${row.Party}-${row.State})`);

    // ---- Upsert candidate ----
    const candidateData = {
      name: row.Name.trim(),
      first_name: first,
      last_name: last,
      slug,
      photo_url: null as string | null,
      party: row.Party.trim(),
      state: row.State.trim(),
      district: row.District?.trim() || null,
      office_sought: row.Office.trim(),
      is_incumbent: isIncumbent,
      election_year: 2026,
      committee_assignments: [] as string[],
      fec_id: null as string | null,
    };

    const { data: candidate, error: candErr } = await supabase
      .from("candidates")
      .upsert(candidateData, { onConflict: "slug" })
      .select("id")
      .single();

    if (candErr || !candidate) {
      console.error(
        `  ERROR upserting candidate ${row.Name}:`,
        candErr?.message
      );
      errorCount++;
      continue;
    }

    const candidateId = candidate.id;
    console.log(`  Candidate upserted: ${candidateId}`);

    // ---- Upsert positions for each issue column ----
    for (const [column, issueSlug] of Object.entries(ISSUE_COLUMN_TO_SLUG)) {
      const rawStance = (row as unknown as Record<string, string>)[column]
        ?.trim()
        .toLowerCase();

      if (!rawStance) continue;

      const stance: Stance = VALID_STANCES.has(rawStance)
        ? (rawStance as Stance)
        : "unclear";

      if (!VALID_STANCES.has(rawStance)) {
        console.warn(
          `  WARNING: Invalid stance "${rawStance}" for ${row.Name}/${issueSlug}, defaulting to "unclear"`
        );
      }

      const issueId = issueMap.get(issueSlug);
      if (!issueId) {
        console.error(
          `  ERROR: Issue "${issueSlug}" not found in database. Run seed data first.`
        );
        errorCount++;
        continue;
      }

      const positionData = {
        candidate_id: candidateId,
        issue_id: issueId,
        stance,
        confidence: "medium" as const,
        summary: null as string | null,
        full_quote: null as string | null,
        source_url: null as string | null,
        date_recorded: null as string | null,
        last_updated: new Date().toISOString(),
      };

      const { error: posErr } = await supabase
        .from("positions")
        .upsert(positionData, { onConflict: "candidate_id,issue_id" });

      if (posErr) {
        console.error(
          `  ERROR upserting position ${row.Name}/${issueSlug}:`,
          posErr.message
        );
        errorCount++;
      } else {
        console.log(`  Position set: ${issueSlug} = ${stance}`);
      }
    }

    successCount++;
  }

  console.log("\n========================================");
  console.log(`Import complete: ${successCount} candidates processed`);
  if (errorCount > 0) {
    console.log(`Errors: ${errorCount}`);
  }
  console.log("========================================");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
