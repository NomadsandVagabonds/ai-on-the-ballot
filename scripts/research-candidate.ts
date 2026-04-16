/**
 * Per-Candidate Web Research Script
 *
 * For a given candidate, performs structured web searches to find
 * AI-related public statements, then saves raw research packets
 * to data/research-output/{state}/{slug}.json.
 *
 * Can be run standalone for a single candidate or called by
 * research-batch.ts for bulk processing.
 *
 * Usage:
 *   npx tsx scripts/research-candidate.ts ted-cruz-tx
 *   npx tsx scripts/research-candidate.ts --all --states=TX
 */

import * as fs from "node:fs";
import * as path from "node:path";
import {
  loadEnv,
  requireEnv,
  ISSUE_CONFIGS,
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

export interface ResearchSource {
  url: string;
  title: string;
  textExcerpt: string;
  sourceType:
    | "campaign_website"
    | "news"
    | "social_media"
    | "congressional_record"
    | "web_search";
  issueRelevance: string[]; // issue slugs this source is relevant to
  retrievedAt: string;
}

export interface ResearchPacket {
  candidateSlug: string;
  candidateName: string;
  party: string;
  state: string;
  office: string;
  researchedAt: string;
  sources: ResearchSource[];
  searchQueries: string[];
}

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

// ---------------------------------------------------------------------------
// Web search abstraction
// ---------------------------------------------------------------------------

/**
 * Performs a web search using Google Custom Search API.
 * Falls back to a simulated response if API is not configured.
 */
async function webSearch(query: string): Promise<WebSearchResult[]> {
  const googleApiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const googleCx = process.env.GOOGLE_SEARCH_CX;

  if (googleApiKey && googleCx) {
    return googleCustomSearch(query, googleApiKey, googleCx);
  }

  // Fallback: use SerpAPI if available
  const serpApiKey = process.env.SERPAPI_KEY;
  if (serpApiKey) {
    return serpApiSearch(query, serpApiKey);
  }

  warn(
    "No search API configured (GOOGLE_SEARCH_API_KEY+GOOGLE_SEARCH_CX or SERPAPI_KEY). " +
      "Set one in .env.local to enable web research."
  );
  return [];
}

async function googleCustomSearch(
  query: string,
  apiKey: string,
  cx: string
): Promise<WebSearchResult[]> {
  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("cx", cx);
  url.searchParams.set("q", query);
  url.searchParams.set("num", "10");

  const res = await fetch(url.toString());
  if (!res.ok) {
    warn(`Google Search API error: ${res.status} — ${query}`);
    return [];
  }

  const data = await res.json();
  return (data.items || []).map(
    (item: { title: string; link: string; snippet: string }) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
    })
  );
}

async function serpApiSearch(
  query: string,
  apiKey: string
): Promise<WebSearchResult[]> {
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("num", "10");

  const res = await fetch(url.toString());
  if (!res.ok) {
    warn(`SerpAPI error: ${res.status} — ${query}`);
    return [];
  }

  const data = await res.json();
  return (data.organic_results || []).map(
    (item: { title: string; link: string; snippet: string }) => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet,
    })
  );
}

// ---------------------------------------------------------------------------
// Research logic
// ---------------------------------------------------------------------------

/**
 * Determine which issue slugs a search result is relevant to
 * based on keyword matching in its title and snippet.
 */
function classifyRelevance(title: string, snippet: string): string[] {
  const combined = `${title} ${snippet}`.toLowerCase();
  const relevant: string[] = [];

  for (const issue of ISSUE_CONFIGS) {
    if (issue.searchKeywords.some((kw) => combined.includes(kw.toLowerCase()))) {
      relevant.push(issue.slug);
    }
  }

  return relevant;
}

/**
 * Run all research passes for a single candidate.
 */
export async function researchCandidate(candidate: {
  slug: string;
  name: string;
  party: string;
  state: string;
  office_sought: string;
  campaign_url?: string | null;
}): Promise<ResearchPacket> {
  const packet: ResearchPacket = {
    candidateSlug: candidate.slug,
    candidateName: candidate.name,
    party: candidate.party,
    state: candidate.state,
    office: candidate.office_sought,
    researchedAt: new Date().toISOString(),
    sources: [],
    searchQueries: [],
  };

  const allResults: WebSearchResult[] = [];

  // Pass 1: Campaign website search
  log(`  [1/4] Campaign website search...`);
  const campaignQuery = `"${candidate.name}" ${candidate.state} 2026 campaign official website`;
  packet.searchQueries.push(campaignQuery);
  const campaignResults = await webSearch(campaignQuery);
  await sleep(1000);

  for (const r of campaignResults.slice(0, 3)) {
    // Try to identify the actual campaign site
    const isCampaignSite =
      r.url.includes(candidate.name.toLowerCase().replace(/\s+/g, "")) ||
      r.title.toLowerCase().includes("official") ||
      r.title.toLowerCase().includes("campaign");

    if (isCampaignSite || campaignResults.indexOf(r) === 0) {
      packet.sources.push({
        url: r.url,
        title: r.title,
        textExcerpt: r.snippet,
        sourceType: "campaign_website",
        issueRelevance: classifyRelevance(r.title, r.snippet),
        retrievedAt: new Date().toISOString(),
      });
    }
  }
  allResults.push(...campaignResults);

  // Pass 2: AI-specific issue searches
  log(`  [2/4] Issue-specific searches...`);
  for (const issue of ISSUE_CONFIGS) {
    // Build a focused query using the top 3 keywords for this issue
    const keywords = issue.searchKeywords.slice(0, 3).join(" OR ");
    const query = `"${candidate.name}" (${keywords})`;
    packet.searchQueries.push(query);

    const results = await webSearch(query);
    await sleep(1000);

    for (const r of results.slice(0, 5)) {
      // Avoid duplicates
      if (allResults.some((existing) => existing.url === r.url)) continue;

      const relevance = classifyRelevance(r.title, r.snippet);
      if (relevance.length > 0) {
        packet.sources.push({
          url: r.url,
          title: r.title,
          textExcerpt: r.snippet,
          sourceType: "news",
          issueRelevance: relevance,
          retrievedAt: new Date().toISOString(),
        });
      }

      allResults.push(r);
    }
  }

  // Pass 3: Social media search
  log(`  [3/4] Social media search...`);
  const socialQuery = `site:x.com "${candidate.name}" (AI OR "artificial intelligence" OR "data center" OR "deepfake")`;
  packet.searchQueries.push(socialQuery);
  const socialResults = await webSearch(socialQuery);
  await sleep(1000);

  for (const r of socialResults.slice(0, 5)) {
    if (allResults.some((existing) => existing.url === r.url)) continue;

    packet.sources.push({
      url: r.url,
      title: r.title,
      textExcerpt: r.snippet,
      sourceType: "social_media",
      issueRelevance: classifyRelevance(r.title, r.snippet),
      retrievedAt: new Date().toISOString(),
    });
    allResults.push(r);
  }

  // Pass 4: General AI governance search
  log(`  [4/4] General AI governance search...`);
  const generalQuery = `"${candidate.name}" ("artificial intelligence" OR "AI regulation" OR "AI safety" OR "autonomous weapons")`;
  packet.searchQueries.push(generalQuery);
  const generalResults = await webSearch(generalQuery);

  for (const r of generalResults.slice(0, 5)) {
    if (allResults.some((existing) => existing.url === r.url)) continue;

    const relevance = classifyRelevance(r.title, r.snippet);
    packet.sources.push({
      url: r.url,
      title: r.title,
      textExcerpt: r.snippet,
      sourceType: "web_search",
      issueRelevance: relevance.length > 0 ? relevance : ["regulation"], // default to regulation for general AI mentions
      retrievedAt: new Date().toISOString(),
    });
    allResults.push(r);
  }

  log(
    `  Found ${packet.sources.length} sources across ${packet.searchQueries.length} queries`
  );
  return packet;
}

/**
 * Save a research packet to disk.
 */
export function saveResearchPacket(packet: ResearchPacket): string {
  const stateDir = path.join(PATHS.researchOutput, packet.state);
  ensureDir(stateDir);
  const filePath = path.join(stateDir, `${packet.candidateSlug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(packet, null, 2));
  return filePath;
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      "Usage:\n" +
        "  npx tsx scripts/research-candidate.ts <candidate-slug>\n" +
        "  npx tsx scripts/research-candidate.ts --all --states=TX,NC"
    );
    process.exit(1);
  }

  loadEnv();

  const supabase = await createScriptSupabaseClient();

  if (args.includes("--all")) {
    // Batch mode: research all candidates in specified states
    let states: string[] | null = null;
    for (const arg of args) {
      if (arg.startsWith("--states=")) {
        states = arg
          .replace("--states=", "")
          .split(",")
          .map((s) => s.trim().toUpperCase());
      }
    }

    let query = supabase
      .from("candidates")
      .select("slug, name, party, state, office_sought, campaign_url")
      .order("state")
      .order("last_name");

    if (states) {
      query = query.in("state", states);
    }

    const { data: candidates, error: dbErr } = await query;
    if (dbErr || !candidates) {
      error(`Failed to fetch candidates: ${dbErr?.message}`);
      process.exit(1);
    }

    log(`Researching ${candidates.length} candidates...`);

    for (let i = 0; i < candidates.length; i++) {
      const cand = candidates[i];
      log(`\n[${i + 1}/${candidates.length}] ${cand.name} (${cand.party}-${cand.state})`);

      // Check if already researched
      const outputPath = path.join(
        PATHS.researchOutput,
        cand.state,
        `${cand.slug}.json`
      );
      if (fs.existsSync(outputPath)) {
        log("  Already researched — skipping (delete file to re-research)");
        continue;
      }

      const packet = await researchCandidate(cand);
      const saved = saveResearchPacket(packet);
      log(`  Saved to ${saved}`);

      // Rate limit between candidates
      if (i < candidates.length - 1) await sleep(2000);
    }
  } else {
    // Single candidate mode
    const slug = args[0];
    const { data: cand, error: dbErr } = await supabase
      .from("candidates")
      .select("slug, name, party, state, office_sought, campaign_url")
      .eq("slug", slug)
      .single();

    if (dbErr || !cand) {
      error(`Candidate not found: ${slug}`);
      process.exit(1);
    }

    log(`Researching ${cand.name} (${cand.party}-${cand.state})...`);
    const packet = await researchCandidate(cand);
    const saved = saveResearchPacket(packet);
    log(`Saved research packet to ${saved}`);
  }
}

main().catch((err) => {
  error(`Fatal: ${err.message}`);
  process.exit(1);
});
