/**
 * Shared configuration for the data collection pipeline.
 *
 * All scripts import from here so thresholds, API endpoints,
 * keyword lists, and target states are defined in one place.
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

/** Load env vars from .env.local (same pattern as import-csv.ts) */
export function loadEnv(): void {
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

export function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    console.error(`ERROR: ${key} must be set in .env.local`);
    process.exit(1);
  }
  return val;
}

// ---------------------------------------------------------------------------
// Election parameters
// ---------------------------------------------------------------------------

export const ELECTION_YEAR = 2026;

/** Launch states — Phase 1 targets */
export const LAUNCH_STATES = ["TX", "NC", "AR", "MS", "IL"] as const;

/** FEC fundraising thresholds for candidate inclusion */
export const FEC_THRESHOLDS = {
  senate: 100_000, // $100K for Senate candidates
  house_initial: 15_000, // $15K initial for House candidates
  house_later: 50_000, // $50K for later-added House candidates
} as const;

// ---------------------------------------------------------------------------
// Issue categories & keywords
// ---------------------------------------------------------------------------

export interface IssueConfig {
  slug: string;
  displayName: string;
  searchKeywords: string[];
}

export const ISSUE_CONFIGS: IssueConfig[] = [
  {
    slug: "export-control",
    displayName: "Export Control & Compute Governance",
    searchKeywords: [
      "export control",
      "semiconductor",
      "chip",
      "CHIPS Act",
      "compute governance",
      "AI chip",
      "frontier model",
      "compute access",
      "allied compute",
    ],
  },
  {
    slug: "military-ai",
    displayName: "Military & National Security AI",
    searchKeywords: [
      "military AI",
      "autonomous weapons",
      "defense AI",
      "DoD artificial intelligence",
      "human-in-the-loop",
      "AI surveillance",
      "national security AI",
      "AI defense",
      "lethal autonomous",
    ],
  },
  {
    slug: "regulation",
    displayName: "AI Regulation Philosophy",
    searchKeywords: [
      "AI regulation",
      "AI safety",
      "AI oversight",
      "AI accountability",
      "AI licensing",
      "AI audit",
      "AI framework",
      "regulate artificial intelligence",
      "AI standards",
      "AI governance",
    ],
  },
  {
    slug: "data-centers",
    displayName: "Data Centers",
    searchKeywords: [
      "data center",
      "AI energy",
      "compute infrastructure",
      "data center permitting",
      "data center energy",
      "data center water",
      "AI power grid",
      "hyperscale",
    ],
  },
  {
    slug: "children-safety",
    displayName: "Children's Online Safety",
    searchKeywords: [
      "children online safety",
      "COPPA",
      "KOSA",
      "Kids Online Safety",
      "age verification",
      "deepfake minors",
      "AI children",
      "algorithmic transparency minors",
      "child data privacy",
    ],
  },
];

/** Flat list of all AI-related keywords for broad filtering */
export const ALL_AI_KEYWORDS = [
  "artificial intelligence",
  "AI ",
  "machine learning",
  "algorithm",
  "autonomous",
  "deepfake",
  "semiconductor",
  "chip",
  "compute",
  "data center",
  "children online",
  "COPPA",
  "KOSA",
];

// ---------------------------------------------------------------------------
// API endpoints
// ---------------------------------------------------------------------------

export const FEC_API_BASE = "https://api.open.fec.gov/v1";
export const CONGRESS_API_BASE = "https://api.congress.gov/v3";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const PROJECT_ROOT = path.resolve(__dirname, "..");

export const PATHS = {
  projectRoot: PROJECT_ROOT,
  data: path.join(PROJECT_ROOT, "data"),
  researchOutput: path.join(PROJECT_ROOT, "data", "research-output"),
  stagedPositions: path.join(PROJECT_ROOT, "data", "staged-positions"),
  candidateManifest: path.join(PROJECT_ROOT, "data", "candidate-manifest.csv"),
  fecToBioguide: path.join(PROJECT_ROOT, "data", "fec-to-bioguide.json"),
  billToIssueMapping: path.join(
    PROJECT_ROOT,
    "data",
    "bill-to-issue-mapping.json"
  ),
} as const;

/** Ensure a directory exists */
export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ---------------------------------------------------------------------------
// Supabase client factory for scripts
// ---------------------------------------------------------------------------

export async function createScriptSupabaseClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

// ---------------------------------------------------------------------------
// Slug generation (mirrors src/lib/utils/slugs.ts for standalone scripts)
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function candidateSlug(
  firstName: string,
  lastName: string,
  stateAbbr: string
): string {
  return `${slugify(firstName)}-${slugify(lastName)}-${stateAbbr.toLowerCase()}`;
}

export function raceSlug(
  stateAbbr: string,
  chamber: "senate" | "house" | "governor",
  year: number,
  district?: string | null
): string {
  const chamberMap = { senate: "sen", house: "house", governor: "gov" };
  const parts = [stateAbbr.toLowerCase(), chamberMap[chamber]];
  if (district) parts.push(district.padStart(2, "0"));
  parts.push(year.toString());
  return parts.join("-");
}

/** Split "First Last" into first/last. Handles multi-word last names. */
export function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: parts[0] };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

// ---------------------------------------------------------------------------
// Rate limiting helper
// ---------------------------------------------------------------------------

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Simple rate limiter: calls fn with a delay between each invocation */
export async function rateLimited<T>(
  items: T[],
  fn: (item: T, index: number) => Promise<void>,
  delayMs: number
): Promise<void> {
  for (let i = 0; i < items.length; i++) {
    await fn(items[i], i);
    if (i < items.length - 1) await sleep(delayMs);
  }
}

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------

export function log(msg: string): void {
  console.log(`[pipeline] ${msg}`);
}

export function warn(msg: string): void {
  console.warn(`[pipeline] WARNING: ${msg}`);
}

export function error(msg: string): void {
  console.error(`[pipeline] ERROR: ${msg}`);
}
