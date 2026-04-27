# Candidate AI-Policy Position Research Brief

You are researching one candidate for the **AI on the Ballot** project — a nonpartisan transparency resource that documents the public AI-governance positions of U.S. congressional candidates. Your job is to produce a citation-grade record of where this candidate stands on **all 10 tracked AI-policy issues**.

The output you write will be patched directly into the live site. **Citation integrity is paramount.** Hallucinated quotes or dead URLs are a project-killing failure. Read the guardrails below carefully.

---

## Candidate

- **Name**: {{name}}
- **Party**: {{party}}
- **State**: {{state}}
- **Office sought**: {{office_sought}}{{district_clause}}
- **Election year**: {{election_year}}
- **Incumbent?**: {{is_incumbent}}
- **Slug** (use verbatim in output filename): `{{slug}}`
- **FEC ID**: {{fec_id}}
- **Bioguide ID** (if House/Senate sitting member): {{bioguide_id}}

## The 10 issues (research each one)

For each candidate × issue pair, you must produce one position record. Use the issue's `slug` exactly as listed below in the output JSON.

| slug | display_name | what to look for |
|---|---|---|
| `export-control` | Export Control and Compute Governance | restricting chip exports, semiconductor policy, controlling access to advanced compute |
| `military-ai` | Military and National Security Uses of AI | AI in defense, autonomous weapons, intelligence applications, national-security frameworks |
| `regulation-philosophy` | AI Regulation Philosophy | how (or whether) to regulate AI: licensing, liability, open-source, federal agency roles |
| `companion-chatbots` | AI Companion Chatbots | AI companions, romantic/emotional companion chatbots, psychological effects on users |
| `children-safety` | Children's Online Safety | AI-driven content moderation for minors, age verification, algorithmic protections for kids |
| `data-centers` | Data Centers | data-center permitting, energy consumption, federal support, environmental impact |
| `jobs-workforce` | Jobs and Workforce Disruption | labor-market effects of AI: automation, displacement, retraining, workforce policy |
| `deepfakes-fraud` | Deepfakes and AI Fraud | AI-generated impersonation, synthetic media, election deepfakes, fraud enforcement |
| `AI-preemption` | AI Preemption | whether federal AI law should preempt state and local AI regulation |
| `intellectual-property` | Intellectual Property and AI | copyright, training-data licensing, author/artist protections against generative-AI use |

---

## Where to look

Use **WebSearch** + **WebFetch**. Search broadly first, then verify each citation by fetching the underlying page.

For incumbents, prioritize:
1. **Congress.gov** — sponsored bills, cosponsorships, floor statements (search by Bioguide ID or name)
2. **Official House/Senate website** — press releases, issue statements (`{lastname}.house.gov` or `{lastname}.senate.gov`)
3. **Committee hearing transcripts** if relevant
4. **Roll-call votes** on AI-relevant legislation

For all candidates:
1. **Campaign website** — issues / policy pages
2. **News coverage** — interviews, op-eds, debate transcripts (Politico, Axios, local press, AP, Reuters, state-specific outlets)
3. **Social media** — public posts on X/Twitter, Facebook, Threads, Bluesky, LinkedIn (only if directly accessible without login walls)
4. **Voter-guide surveys** — Vote Smart, On The Issues, candidate questionnaires from local press

If a candidate has **no public position** on a given issue after a real search (≥3 distinct queries), that is a valid and expected outcome — emit a `no_mention` record (see schema). **Do not invent a position to fill the slot.**

---

## Coding rubric

### Stance (one of these five)
- **`support`** — candidate clearly favors the policy area or approach
- **`oppose`** — candidate clearly opposes it
- **`mixed`** — both supportive and opposing views, or supports some aspects while opposing others
- **`unclear`** — has addressed the topic but their position can't be confidently categorized
- **`no_mention`** — no public record of the candidate addressing this topic

### Confidence (only meaningful when stance ≠ no_mention)
- **`high`** — direct, unambiguous: sponsored bill, explicit policy page, or floor vote
- **`medium`** — clear but indirect: social-media post, interview remark, cosponsorship of a related bill
- **`low`** — inferred or tangential: brief remark in a broader context, position extrapolated from related statements

### Summary (1–2 sentences, neutral voice, plain English)
Examples of acceptable phrasing:
- "Cosponsored the Chip Security Act, a bipartisan bill to restrict advanced AI chip exports to China."
- "Said in a 2025 Politico interview that federal AI regulation should preempt a 'patchwork' of state laws."
- "Voted no on the BIOSECURE Act amendment limiting Pentagon use of foreign-developed AI."

**Never editorialize.** No "rightly", "controversially", "courageously", etc. Report what they said or did, not whether you agree.

---

## Hard guardrails — read every word

1. **Every URL must be live.** Before recording a source, fetch the page with WebFetch. If it returns a 4xx or 5xx, drop the source. If you can't reach it, drop the source.
2. **Every quote must be verbatim.** The `excerpt` and `full_quote` fields must be a literal substring of the page you fetched (allowing whitespace normalization). The merge step will reject any record where this isn't true.
3. **No paraphrased "quotes".** If you can't pull the exact wording from the source, leave `excerpt` and `full_quote` empty and rely on the `summary`.
4. **Sources must be primary or near-primary.** Direct candidate statements, official press releases, congressional records, named news outlets — not aggregator/blog summaries unless those are the only available record.
5. **Date the source.** Use the publication date in `YYYY-MM-DD` format. If the page doesn't disclose a date, use the URL's date if embedded; otherwise leave `date` null.
6. **Distinguish stance from confidence.** A floor vote against an AI-regulation bill is `oppose` + `high`. A tweet criticizing "AI overreach" is `oppose` + `medium`. Inferring opposition from generic "deregulation" rhetoric is `low` confidence.
7. **No fabrication, no extrapolation across issues.** A candidate's stance on data centers does *not* tell you their stance on companion chatbots. Code each issue independently.
8. **Currency.** Prefer evidence from 2024 onward. Older statements are fine for incumbents with consistent records but should be flagged with lower confidence if the topic has evolved (e.g., AI preemption is a 2025 debate).

---

## Output format

Write a single JSON file to **`scripts/.research-cache/{{slug}}.json`** with the following shape (and only this shape — no extra prose, no comments):

```json
{
  "candidate_slug": "{{slug}}",
  "candidate_id": "{{id}}",
  "researched_at": "YYYY-MM-DD",
  "researcher_notes": "Optional 1-2 sentences describing the search effort or any caveats.",
  "positions": [
    {
      "issue_slug": "regulation-philosophy",
      "stance": "support",
      "confidence": "high",
      "summary": "One- to two-sentence neutral description.",
      "full_quote": "Optional verbatim excerpt from the strongest source. Leave null if no clean quote.",
      "sources": [
        {
          "type": "statement",
          "title": "Headline or page title from the source",
          "url": "https://full.url/of/source",
          "date": "2025-07-29",
          "excerpt": "Verbatim sentence or two from the page that supports the coded stance."
        }
      ]
    }
    // ... exactly 10 entries, one per issue slug listed above
  ]
}
```

### Rules for each position entry

- **Always emit exactly 10 entries**, one per issue slug, in the order they appear in the issue table above.
- For `no_mention`: set `confidence: "low"`, `summary: null`, `full_quote: null`, `sources: []`. Do not include a sentinel "no record found" source.
- For any other stance: `sources` must contain **≥1** verified citation.
- `type` must be one of: `"statement" | "legislation" | "survey" | "social_media" | "news"`.
- Quote each `excerpt` from the page you actually fetched. Do not paste headlines as excerpts unless the headline itself is the substantive quote.

---

## Workflow

You have a **5-minute soft time budget** and a 10-minute hard ceiling. Pace
yourself: 30 seconds per issue on average. Coded 6 of 10 with strong
sources is much better than coded 9 of 10 where you ran out of time
before writing the file.

1. Read this brief.
2. **First action: write a skeleton file** to `scripts/.research-cache/{{slug}}.json`
   containing all 10 issue entries pre-populated with
   `stance: "no_mention", confidence: "low", summary: null, full_quote: null, sources: []`.
   This guarantees a valid output exists even if the watchdog kills you mid-research.
3. For each issue, allocate ~30s:
   - 1 WebSearch query, ~2 WebFetch verifications max.
   - If the candidate's house.gov / senate.gov page returns 4xx, **don't retry** — fall back to Congress.gov, news, or accept no_mention.
   - When you find solid evidence, **immediately rewrite the JSON file in place** with the upgraded entry. Don't batch.
4. **Hard rule when you hit any .house.gov / .senate.gov 403 or 404**: do not loop. Move to news/Congress.gov within 30 seconds.
5. After all 10 issues (or when ~5 minutes have elapsed), do one final write of the JSON.
6. Reply with: "Coded N of 10 issues for {{name}}; M high / K medium / L low confidence."

**The JSON file on disk is the deliverable. A complete file with 4 coded
issues beats a planned file with 9 coded issues that never gets written.**

---

**Begin by writing the skeleton file now.**
