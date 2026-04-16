/**
 * AI-Assisted Position Coding Script
 *
 * Reads research packets from data/research-output/ and uses the Claude API
 * to propose stance codings for each candidate-issue pair. Outputs staged
 * position files to data/staged-positions/ for human review.
 *
 * Usage:
 *   npx tsx scripts/code-positions.ts                      # All research packets
 *   npx tsx scripts/code-positions.ts --states=TX           # Specific states
 *   npx tsx scripts/code-positions.ts --candidate=ted-cruz-tx  # Single candidate
 *   npx tsx scripts/code-positions.ts --dry-run             # Preview API calls
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
} from "./pipeline-config";
import type { ResearchPacket, ResearchSource } from "./research-candidate";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StagedPosition {
  issue: string; // issue slug
  stance: "support" | "oppose" | "mixed" | "unclear" | "no_mention";
  confidence: "high" | "medium" | "low";
  summary: string;
  fullQuote: string | null;
  sourceUrl: string | null;
  dateRecorded: string | null;
  researchMethod: "ai_assisted";
  reviewed: false;
  aiReasoning: string; // Claude's reasoning for the coding
}

export interface StagedCandidateFile {
  candidateSlug: string;
  candidateName: string;
  party: string;
  state: string;
  office: string;
  codedAt: string;
  positions: StagedPosition[];
}

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeResponse {
  content: { type: string; text: string }[];
  usage: { input_tokens: number; output_tokens: number };
}

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  let states: string[] | null = null;
  let candidate: string | null = null;
  let dryRun = false;

  for (const arg of args) {
    if (arg.startsWith("--states=")) {
      states = arg
        .replace("--states=", "")
        .split(",")
        .map((s) => s.trim().toUpperCase());
    } else if (arg.startsWith("--candidate=")) {
      candidate = arg.replace("--candidate=", "");
    } else if (arg === "--dry-run") {
      dryRun = true;
    }
  }

  return { states, candidate, dryRun };
}

// ---------------------------------------------------------------------------
// Claude API
// ---------------------------------------------------------------------------

async function callClaude(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const apiKey = requireEnv("ANTHROPIC_API_KEY");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude API error: ${res.status} — ${body}`);
  }

  const data: ClaudeResponse = await res.json();
  return data.content[0].text;
}

// ---------------------------------------------------------------------------
// Prompt construction
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a nonpartisan political research assistant coding candidate positions for an AI governance tracker.

You will be given source material about a candidate's public statements and actions related to a specific AI policy issue. Your job is to code their position using a strict schema.

IMPORTANT RULES:
- Be strictly nonpartisan. Apply identical standards regardless of party.
- Code only what is supported by the provided sources. Do not infer from party affiliation.
- If sources contain no relevant information, code as "no_mention".
- "High" confidence requires a direct, unambiguous primary source (vote, bill sponsorship, explicit statement).
- "Medium" confidence is for clear statements that address the topic but aren't a formal policy position.
- "Low" confidence is for indirect, tangential, or ambiguous mentions.
- Keep summaries factual and neutral — no editorializing.

Respond with ONLY a JSON object (no markdown, no explanation outside the JSON):
{
  "stance": "support" | "oppose" | "mixed" | "unclear" | "no_mention",
  "confidence": "high" | "medium" | "low",
  "summary": "1-2 sentence factual summary of their position",
  "full_quote": "most relevant verbatim quote from sources, or null",
  "recommended_source_url": "the single most authoritative source URL, or null",
  "reasoning": "1-2 sentences explaining why you chose this stance and confidence level"
}`;

function buildUserPrompt(
  packet: ResearchPacket,
  issueConfig: (typeof ISSUE_CONFIGS)[number],
  relevantSources: ResearchSource[]
): string {
  const issueDesc = ISSUE_CONFIGS.find((i) => i.slug === issueConfig.slug);

  let prompt = `CANDIDATE: ${packet.candidateName} (${packet.party}-${packet.state}), running for ${packet.office}\n`;
  prompt += `ISSUE: ${issueConfig.displayName}\n`;
  prompt += `ISSUE SCOPE: ${issueDesc?.searchKeywords.join(", ")}\n\n`;

  if (relevantSources.length === 0) {
    prompt += `SOURCE MATERIAL: No relevant sources were found for this candidate on this specific issue.\n`;
    prompt += `\nCode this as "no_mention" with "low" confidence.`;
  } else {
    prompt += `SOURCE MATERIAL (${relevantSources.length} sources found):\n\n`;
    for (let i = 0; i < relevantSources.length; i++) {
      const src = relevantSources[i];
      prompt += `--- Source ${i + 1} (${src.sourceType}) ---\n`;
      prompt += `Title: ${src.title}\n`;
      prompt += `URL: ${src.url}\n`;
      prompt += `Excerpt: ${src.textExcerpt}\n\n`;
    }
    prompt += `\nBased on these sources, code this candidate's position on ${issueConfig.displayName}.`;
  }

  return prompt;
}

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

async function codeCandidate(
  packet: ResearchPacket,
  dryRun: boolean
): Promise<StagedCandidateFile> {
  const staged: StagedCandidateFile = {
    candidateSlug: packet.candidateSlug,
    candidateName: packet.candidateName,
    party: packet.party,
    state: packet.state,
    office: packet.office,
    codedAt: new Date().toISOString(),
    positions: [],
  };

  for (const issue of ISSUE_CONFIGS) {
    // Find sources relevant to this issue
    const relevantSources = packet.sources.filter(
      (s) =>
        s.issueRelevance.includes(issue.slug) ||
        s.issueRelevance.length === 0 // unclassified sources get included everywhere
    );

    if (dryRun) {
      log(
        `  [DRY RUN] ${issue.displayName}: ${relevantSources.length} relevant sources`
      );
      staged.positions.push({
        issue: issue.slug,
        stance: "no_mention",
        confidence: "low",
        summary: "[DRY RUN — would call Claude API]",
        fullQuote: null,
        sourceUrl: null,
        dateRecorded: null,
        researchMethod: "ai_assisted",
        reviewed: false,
        aiReasoning: "[dry run]",
      });
      continue;
    }

    log(`  Coding ${issue.displayName} (${relevantSources.length} sources)...`);

    try {
      const userPrompt = buildUserPrompt(packet, issue, relevantSources);
      const response = await callClaude(SYSTEM_PROMPT, userPrompt);

      // Parse Claude's JSON response
      const parsed = JSON.parse(response);

      staged.positions.push({
        issue: issue.slug,
        stance: parsed.stance,
        confidence: parsed.confidence,
        summary: parsed.summary,
        fullQuote: parsed.full_quote || null,
        sourceUrl: parsed.recommended_source_url || null,
        dateRecorded: null,
        researchMethod: "ai_assisted",
        reviewed: false,
        aiReasoning: parsed.reasoning,
      });

      log(
        `    → ${parsed.stance} (${parsed.confidence}): ${parsed.summary.slice(0, 80)}...`
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      warn(`  Failed to code ${issue.displayName}: ${msg}`);

      staged.positions.push({
        issue: issue.slug,
        stance: "no_mention",
        confidence: "low",
        summary: `[AI coding failed: ${msg}]`,
        fullQuote: null,
        sourceUrl: null,
        dateRecorded: null,
        researchMethod: "ai_assisted",
        reviewed: false,
        aiReasoning: `Error: ${msg}`,
      });
    }

    // Rate limit between API calls
    await sleep(1500);
  }

  return staged;
}

function saveStagedPositions(staged: StagedCandidateFile): string {
  const stateDir = path.join(PATHS.stagedPositions, staged.state);
  ensureDir(stateDir);
  const filePath = path.join(stateDir, `${staged.candidateSlug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(staged, null, 2));
  return filePath;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const { states, candidate, dryRun } = parseArgs();

  loadEnv();

  if (dryRun) log("DRY RUN mode — no Claude API calls");

  // Find research packets to process
  const packets: ResearchPacket[] = [];

  if (candidate) {
    // Single candidate
    const dirs = fs.readdirSync(PATHS.researchOutput);
    for (const dir of dirs) {
      const filePath = path.join(
        PATHS.researchOutput,
        dir,
        `${candidate}.json`
      );
      if (fs.existsSync(filePath)) {
        packets.push(JSON.parse(fs.readFileSync(filePath, "utf-8")));
        break;
      }
    }
    if (packets.length === 0) {
      error(`No research packet found for ${candidate}. Run research-candidate.ts first.`);
      process.exit(1);
    }
  } else {
    // All packets in specified states (or all states)
    if (!fs.existsSync(PATHS.researchOutput)) {
      error("No research output directory. Run research-candidate.ts first.");
      process.exit(1);
    }

    const dirs = fs.readdirSync(PATHS.researchOutput);
    for (const dir of dirs) {
      if (states && !states.includes(dir)) continue;

      const stateDir = path.join(PATHS.researchOutput, dir);
      if (!fs.statSync(stateDir).isDirectory()) continue;

      const files = fs
        .readdirSync(stateDir)
        .filter((f) => f.endsWith(".json"));
      for (const file of files) {
        const filePath = path.join(stateDir, file);
        packets.push(JSON.parse(fs.readFileSync(filePath, "utf-8")));
      }
    }
  }

  log(`Found ${packets.length} research packets to code`);

  let totalPositions = 0;

  for (let i = 0; i < packets.length; i++) {
    const packet = packets[i];

    // Skip if already coded
    const stagedPath = path.join(
      PATHS.stagedPositions,
      packet.state,
      `${packet.candidateSlug}.json`
    );
    if (fs.existsSync(stagedPath)) {
      log(
        `[${i + 1}/${packets.length}] ${packet.candidateName} — already coded, skipping`
      );
      continue;
    }

    log(
      `\n[${i + 1}/${packets.length}] Coding ${packet.candidateName} (${packet.party}-${packet.state})...`
    );

    const staged = await codeCandidate(packet, dryRun);
    const saved = saveStagedPositions(staged);
    totalPositions += staged.positions.length;

    log(`  Saved staged positions to ${saved}`);

    // Rate limit between candidates
    if (i < packets.length - 1) await sleep(2000);
  }

  log(`\n========================================`);
  log(`Position coding complete:`);
  log(`  Candidates processed: ${packets.length}`);
  log(`  Positions coded: ${totalPositions}`);
  log(`\nNext step: Review with  npx tsx scripts/review-positions.ts`);
  log(`========================================`);
}

main().catch((err) => {
  error(`Fatal: ${err.message}`);
  process.exit(1);
});
