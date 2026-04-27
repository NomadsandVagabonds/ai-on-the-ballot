# Candidate position research pipeline

End-to-end workflow for researching, reviewing, and publishing candidate
positions on the 10 tracked AI policy issues.

```
┌─────────────────────────────────┐
│ run_research_orchestrator.py    │   reads candidates.json, calls the
│ (Anthropic API + web_search,    │   Anthropic Messages API per candidate
│  threaded, resumable)           │   with the server-side web_search tool;
└────────────┬────────────────────┘   writes scripts/.research-cache/{slug}.json
             ▼
┌─────────────────────────┐
│ merge_research.py       │   schema + URL + verbatim-quote validation;
│ (validate + STAGE)      │   stages every passing position into
└────────────┬────────────┘   trackerv3.xlsx Positions v2 with
             ▼                reviewStatus = "draft"
┌─────────────────────────┐
│ Human review in xlsx    │   open `new design/trackerv3.xlsx`, read
│ flip reviewStatus to    │   each draft row + its sources, mark
│ "approved" on accepted  │   reviewStatus = "approved" on the rows
│ rows                    │   you want to ship
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ build_tracker_json.py   │   regenerates data/tracker/*.json. Drafts
│ (publish to site)       │   are filtered out — only approved (and
└────────────┬────────────┘   legacy un-flagged) rows reach positions.json
             ▼
┌─────────────────────────┐
│ npm run dev / deploy    │   the site reads positions.json
└─────────────────────────┘
```

## What lives where

| File / sheet | Role |
|---|---|
| `scripts/.research-cache/{slug}.json` | Raw per-candidate research output from one agent. Gitignored. |
| `scripts/.research-cache/_report.md` | Validation summary written by `merge_research.py`. |
| `new design/trackerv3.xlsx` → Positions v2 | **Single source of truth.** `reviewStatus` column gates publication. |
| `new design/trackerv3.xlsx` → Sources | All citations (positionId, type, url, date, excerpt). |
| `data/tracker/positions.json` | Generated artifact — only contains approved rows. The site reads this. |

## Hard guardrails the validator enforces

- Every source URL must return HTTP 2xx.
- Every `excerpt` and `full_quote` must appear as a normalized substring
  of the live page body (smart-quote / dash / whitespace normalized).
  Failed quote check = the URL is kept, the excerpt text is dropped.
- A position that loses its last source reverts to `no_mention`.
- Required: every record gets `reviewStatus = "draft"` until a human
  flips it to `"approved"`.

## Commands

```bash
# 0. One-time setup
pip3 install anthropic openpyxl certifi pandas
export ANTHROPIC_API_KEY=sk-ant-...     # required for the orchestrator

# 1. Run the orchestrator. Resumable — re-invoke as often as you want;
#    skips candidates that already have a cached file. Sorted so the
#    most-visible candidates (incumbents, highest-funded) run first.
python3 scripts/run_research_orchestrator.py                  # all 290
python3 scripts/run_research_orchestrator.py --limit 25       # first 25
python3 scripts/run_research_orchestrator.py --state TX       # one state
python3 scripts/run_research_orchestrator.py --min-raised 50000  # only ≥$50K
python3 scripts/run_research_orchestrator.py --slug john-cornyn-tx  # one
python3 scripts/run_research_orchestrator.py --dry-run        # plan only

# 2. Validate + stage everything to xlsx as drafts.
python3 scripts/merge_research.py            # apply
python3 scripts/merge_research.py --dry-run  # validate only
python3 scripts/merge_research.py one-slug   # one candidate only

# 3. Open new design/trackerv3.xlsx → Positions v2. Filter
#    reviewStatus = "draft", review each row + its sources, set
#    reviewStatus = "approved" on the ones you accept.

# 4. Publish to site (regenerates data/tracker/*.json).
python3 scripts/build_tracker_json.py

# Optional: select_pilot_cohort.py is the original 25-candidate cohort
# selector for sanity-checking on a small batch first.
python3 scripts/select_pilot_cohort.py
```

## Cost & time guidance

The orchestrator uses Anthropic's `claude-sonnet-4-5` with the
server-side `web_search` tool, capped at 8 searches per candidate.
Approximate costs at the time of writing:

- Model tokens: ~$0.10–0.20 per candidate
- Web search: ~$0.05 per candidate (5 searches × $10/1k)
- Total for the full 290 candidate sweep: ~$45–75

Wall-clock time at 4 workers: ~3–5 hours. Resume after interruption is
free — already-cached candidates are skipped.
