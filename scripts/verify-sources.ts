/**
 * Source URL Verification Script
 *
 * Checks every source_url in staged position files to verify:
 *   1. The URL resolves (HTTP 200)
 *   2. The domain is on the allowlist (legitimate sources)
 *
 * Generates a report of broken links and suspicious domains.
 *
 * Usage:
 *   npx tsx scripts/verify-sources.ts                       # All staged positions
 *   npx tsx scripts/verify-sources.ts --states=TX           # Specific states
 *   npx tsx scripts/verify-sources.ts --fix                 # Remove broken URLs
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
  loadEnv,
  PATHS,
  sleep,
  log,
  warn,
  error,
} from "./pipeline-config";
import type { StagedCandidateFile } from "./code-positions";

// ---------------------------------------------------------------------------
// Domain allowlist
// ---------------------------------------------------------------------------

const ALLOWED_DOMAINS = new Set([
  // Government
  "congress.gov",
  "senate.gov",
  "house.gov",
  "govtrack.us",
  "govinfo.gov",
  "whitehouse.gov",
  "fec.gov",
  // Major news
  "apnews.com",
  "reuters.com",
  "nytimes.com",
  "washingtonpost.com",
  "politico.com",
  "thehill.com",
  "cnn.com",
  "foxnews.com",
  "nbcnews.com",
  "abcnews.go.com",
  "cbsnews.com",
  "npr.org",
  "pbs.org",
  "bbc.com",
  "usatoday.com",
  "wsj.com",
  "bloomberg.com",
  // Tech/policy
  "wired.com",
  "theverge.com",
  "arstechnica.com",
  "techcrunch.com",
  // Think tanks
  "brookings.edu",
  "cato.org",
  "heritage.org",
  "cfr.org",
  "rand.org",
  // Social media
  "x.com",
  "twitter.com",
  "facebook.com",
  "youtube.com",
  // State/local news (patterns)
  "statesman.com",
  "dallasnews.com",
  "houstonchronicle.com",
  "texastribune.org",
  "charlotteobserver.com",
  "chicagotribune.com",
  "suntimes.com",
]);

/** Check if a domain is on the allowlist (supports subdomains) */
function isDomainAllowed(hostname: string): boolean {
  // Direct match
  if (ALLOWED_DOMAINS.has(hostname)) return true;

  // Subdomain match (e.g., "www.politico.com" → "politico.com")
  for (const allowed of ALLOWED_DOMAINS) {
    if (hostname.endsWith(`.${allowed}`)) return true;
  }

  // Government domains (.gov, .senate.gov, .house.gov)
  if (hostname.endsWith(".gov")) return true;

  // Campaign sites (heuristic: contains candidate-like patterns)
  if (
    hostname.includes("for") ||
    hostname.includes("elect") ||
    hostname.includes("vote") ||
    hostname.includes("campaign") ||
    hostname.includes("2026")
  ) {
    return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// URL verification
// ---------------------------------------------------------------------------

interface VerificationResult {
  url: string;
  candidate: string;
  issue: string;
  status: "ok" | "broken" | "suspicious_domain" | "error";
  httpStatus?: number;
  domain?: string;
  message?: string;
}

async function verifyUrl(
  url: string,
  candidate: string,
  issue: string
): Promise<VerificationResult> {
  try {
    const parsed = new URL(url);

    // Domain check
    if (!isDomainAllowed(parsed.hostname)) {
      return {
        url,
        candidate,
        issue,
        status: "suspicious_domain",
        domain: parsed.hostname,
        message: `Domain not on allowlist: ${parsed.hostname}`,
      };
    }

    // HTTP check (HEAD request with timeout)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent":
            "AI-on-the-Ballot-Tracker/1.0 (source verification bot)",
        },
      });
      clearTimeout(timeout);

      if (res.ok) {
        return { url, candidate, issue, status: "ok", httpStatus: res.status };
      } else {
        // Some servers block HEAD — try GET
        const getRes = await fetch(url, {
          method: "GET",
          signal: AbortSignal.timeout(10_000),
          redirect: "follow",
          headers: {
            "User-Agent":
              "AI-on-the-Ballot-Tracker/1.0 (source verification bot)",
          },
        });

        if (getRes.ok) {
          return {
            url,
            candidate,
            issue,
            status: "ok",
            httpStatus: getRes.status,
          };
        }

        return {
          url,
          candidate,
          issue,
          status: "broken",
          httpStatus: getRes.status,
          message: `HTTP ${getRes.status}`,
        };
      }
    } catch {
      clearTimeout(timeout);
      return {
        url,
        candidate,
        issue,
        status: "broken",
        message: "Request failed or timed out",
      };
    }
  } catch {
    return {
      url,
      candidate,
      issue,
      status: "error",
      message: `Invalid URL: ${url}`,
    };
  }
}

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  let states: string[] | null = null;
  let fix = false;

  for (const arg of args) {
    if (arg.startsWith("--states=")) {
      states = arg
        .replace("--states=", "")
        .split(",")
        .map((s) => s.trim().toUpperCase());
    } else if (arg === "--fix") {
      fix = true;
    }
  }

  return { states, fix };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { states, fix } = parseArgs();

  loadEnv();

  if (fix) log("FIX mode — will null out broken URLs in staged files");

  // Collect all URLs to verify
  const urlsToVerify: {
    url: string;
    candidate: string;
    issue: string;
    filePath: string;
    positionIndex: number;
  }[] = [];

  const stateDirs = fs.readdirSync(PATHS.stagedPositions);

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

      for (let i = 0; i < staged.positions.length; i++) {
        const pos = staged.positions[i];
        if (pos.sourceUrl) {
          urlsToVerify.push({
            url: pos.sourceUrl,
            candidate: staged.candidateName,
            issue: pos.issue,
            filePath,
            positionIndex: i,
          });
        }
      }
    }
  }

  log(`Found ${urlsToVerify.length} source URLs to verify`);

  // Verify URLs
  const results: VerificationResult[] = [];
  let okCount = 0;
  let brokenCount = 0;
  let suspiciousCount = 0;

  for (let i = 0; i < urlsToVerify.length; i++) {
    const { url, candidate, issue, filePath, positionIndex } =
      urlsToVerify[i];

    const result = await verifyUrl(url, candidate, issue);
    results.push(result);

    if (result.status === "ok") {
      okCount++;
    } else if (result.status === "broken" || result.status === "error") {
      brokenCount++;
      warn(`BROKEN: ${candidate} / ${issue} — ${url} (${result.message})`);

      if (fix) {
        const staged: StagedCandidateFile = JSON.parse(
          fs.readFileSync(filePath, "utf-8")
        );
        staged.positions[positionIndex].sourceUrl = null;
        fs.writeFileSync(filePath, JSON.stringify(staged, null, 2));
        log(`  → Nulled out broken URL`);
      }
    } else if (result.status === "suspicious_domain") {
      suspiciousCount++;
      warn(
        `SUSPICIOUS: ${candidate} / ${issue} — ${url} (${result.message})`
      );
    }

    // Progress indicator
    if ((i + 1) % 20 === 0) {
      log(`  Verified ${i + 1}/${urlsToVerify.length}...`);
    }

    // Rate limit
    await sleep(500);
  }

  // Report
  log(`\n========================================`);
  log(`Source verification complete:`);
  log(`  Total URLs: ${urlsToVerify.length}`);
  log(`  OK: ${okCount}`);
  log(`  Broken: ${brokenCount}`);
  log(`  Suspicious domain: ${suspiciousCount}`);
  log(`========================================`);

  if (brokenCount > 0 && !fix) {
    log(`\nRe-run with --fix to null out broken URLs.`);
  }

  // Write detailed report
  const reportPath = path.join(PATHS.data, "source-verification-report.json");
  const report = {
    verifiedAt: new Date().toISOString(),
    summary: {
      total: urlsToVerify.length,
      ok: okCount,
      broken: brokenCount,
      suspicious: suspiciousCount,
    },
    broken: results.filter(
      (r) => r.status === "broken" || r.status === "error"
    ),
    suspicious: results.filter((r) => r.status === "suspicious_domain"),
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`Detailed report: ${reportPath}`);
}

main().catch((err) => {
  error(`Fatal: ${err.message}`);
  process.exit(1);
});
