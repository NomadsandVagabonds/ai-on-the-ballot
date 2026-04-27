#!/usr/bin/env python3
"""
Research-orchestrator. Calls the Anthropic Messages API directly (with the
server-side web_search tool) per candidate, in a small thread pool, with
proper retry / timeout handling. Resumable: skips candidates that already
have a cached file.

Usage:
  # research everything (writes to scripts/.research-cache/{slug}.json)
  python3 scripts/run_research_orchestrator.py

  # dry-run — just print what it would do
  python3 scripts/run_research_orchestrator.py --dry-run

  # cap to N candidates (for cost/time control)
  python3 scripts/run_research_orchestrator.py --limit 25

  # filter to a state
  python3 scripts/run_research_orchestrator.py --state TX

  # only candidates above a fundraising threshold (defaults to 0 = all)
  python3 scripts/run_research_orchestrator.py --min-raised 50000

  # one specific candidate slug
  python3 scripts/run_research_orchestrator.py --slug john-cornyn-tx

Pre-reqs:
  pip install anthropic
  export ANTHROPIC_API_KEY=sk-ant-...
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass
from datetime import date, datetime
from pathlib import Path
from typing import Any

try:
    from anthropic import Anthropic, APIError, APIStatusError, APITimeoutError
except ImportError:
    sys.exit(
        "anthropic SDK not installed. Run: pip3 install anthropic"
    )

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "tracker"
CACHE = ROOT / "scripts" / ".research-cache"
TEMPLATE_PATH = ROOT / "scripts" / "research_prompt_template.md"
CANDIDATES_PATH = DATA / "candidates.json"

MODEL = "claude-sonnet-4-5"
MAX_TOKENS = 16_000
PER_CANDIDATE_TIMEOUT = 480.0  # 8 minutes
MAX_WEB_SEARCHES = 8
RETRIES = 2
RETRY_BACKOFF_SECS = 30
DEFAULT_WORKERS = 4

# JSON the prompt asks the model to produce.
RESPONSE_SCHEMA_HINT = """
Return ONLY a single JSON object — no prose, no markdown fences. Shape:

{
  "candidate_slug": "...",
  "candidate_id": "...",
  "researched_at": "YYYY-MM-DD",
  "researcher_notes": "1-2 sentences (or empty string)",
  "positions": [
    {
      "issue_slug": "<one of the 10 slugs>",
      "stance": "support|oppose|mixed|unclear|no_mention",
      "confidence": "high|medium|low",
      "summary": "1-2 sentences or null when stance is no_mention",
      "full_quote": "verbatim excerpt or null",
      "sources": [
        {
          "type": "statement|legislation|survey|social_media|news",
          "title": "...",
          "url": "https://...",
          "date": "YYYY-MM-DD or null",
          "excerpt": "verbatim sentence-or-two from the page"
        }
      ]
    }
    /* exactly 10 entries, one per issue slug */
  ]
}
""".strip()


@dataclass
class CandidateBrief:
    slug: str
    record: dict[str, Any]


def render_brief(rec: dict[str, Any], template: str) -> str:
    district_clause = (
        f", district {rec['district']}" if rec.get("district") else ""
    )
    fec = rec.get("fec_id") or "(unknown — search FEC.gov by name + state)"
    bg = (
        rec.get("bioguide_id")
        or "(unknown — search Congress.gov by name)"
    )
    inc = "yes" if rec.get("is_incumbent") else "no"
    chamber = (
        "senate"
        if "Senate" in rec["office_sought"]
        else "house"
        if "House" in rec["office_sought"]
        else "governor"
    )
    out = template
    for k, v in [
        ("{{name}}", rec["name"]),
        ("{{party}}", rec["party"]),
        ("{{state}}", rec["state"]),
        ("{{office_sought}}", rec["office_sought"]),
        ("{{district_clause}}", district_clause),
        ("{{election_year}}", str(rec.get("election_year", ""))),
        ("{{is_incumbent}}", inc),
        ("{{slug}}", rec["slug"]),
        ("{{fec_id}}", fec),
        ("{{bioguide_id}}", bg),
        ("{{id}}", rec["id"]),
    ]:
        out = out.replace(k, v)
    return out + "\n\n---\n\n" + RESPONSE_SCHEMA_HINT + "\n"


def extract_json(text: str) -> dict[str, Any] | None:
    """Pull a single JSON object out of model output that may have extra prose."""
    text = text.strip()
    # Strip ```json fences if any
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    # Find first { ... last matching }
    start = text.find("{")
    end = text.rfind("}")
    if start < 0 or end < 0:
        return None
    candidate = text[start : end + 1]
    try:
        return json.loads(candidate)
    except json.JSONDecodeError:
        return None


def call_api(
    client: Anthropic,
    brief: str,
    timeout_secs: float,
) -> tuple[dict[str, Any] | None, str]:
    """Returns (parsed_json, error_message)."""
    last_err = ""
    for attempt in range(1, RETRIES + 2):
        try:
            resp = client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                timeout=timeout_secs,
                tools=[
                    {
                        "type": "web_search_20250305",
                        "name": "web_search",
                        "max_uses": MAX_WEB_SEARCHES,
                    }
                ],
                messages=[{"role": "user", "content": brief}],
            )
        except APITimeoutError as e:
            last_err = f"timeout: {e}"
        except APIStatusError as e:
            last_err = f"status {e.status_code}: {str(e)[:200]}"
            if e.status_code in (401, 403):
                # auth failure — don't retry
                return None, last_err
        except APIError as e:
            last_err = f"api error: {str(e)[:200]}"
        except Exception as e:  # noqa: BLE001
            last_err = f"{type(e).__name__}: {str(e)[:200]}"
        else:
            # Concatenate all text blocks (web_search citations live inline).
            text_parts: list[str] = []
            for block in resp.content:
                if getattr(block, "type", None) == "text":
                    text_parts.append(block.text)
            full_text = "\n\n".join(text_parts)
            parsed = extract_json(full_text)
            if parsed is None:
                last_err = f"could not parse JSON (response len={len(full_text)})"
            else:
                return parsed, ""
        # backoff before retry
        if attempt <= RETRIES:
            time.sleep(RETRY_BACKOFF_SECS * attempt)
    return None, last_err


def process_one(
    rec: dict[str, Any],
    template: str,
    client: Anthropic,
) -> tuple[str, bool, str]:
    """Returns (slug, success, message)."""
    slug = rec["slug"]
    out_path = CACHE / f"{slug}.json"
    if out_path.exists():
        return slug, True, "skipped (cached)"

    brief = render_brief(rec, template)
    parsed, err = call_api(client, brief, PER_CANDIDATE_TIMEOUT)
    if parsed is None:
        return slug, False, err

    # Stamp candidate metadata in case the model dropped it.
    parsed.setdefault("candidate_slug", slug)
    parsed.setdefault("candidate_id", rec["id"])
    parsed.setdefault("researched_at", date.today().isoformat())

    # Atomic write.
    tmp = out_path.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(parsed, indent=2) + "\n")
    tmp.replace(out_path)
    coded = sum(
        1
        for p in (parsed.get("positions") or [])
        if p.get("stance") and p["stance"] != "no_mention"
    )
    return slug, True, f"coded {coded}/10"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--limit", type=int, default=0,
                        help="process at most N candidates")
    parser.add_argument("--state", type=str, default=None,
                        help="filter to one state (e.g. TX)")
    parser.add_argument("--min-raised", type=int, default=0,
                        help="only candidates with total_raised >= this")
    parser.add_argument("--slug", type=str, default=None,
                        help="research one specific candidate slug")
    parser.add_argument("--workers", type=int, default=DEFAULT_WORKERS,
                        help=f"parallel workers (default {DEFAULT_WORKERS})")
    args = parser.parse_args()

    if not args.dry_run and not os.environ.get("ANTHROPIC_API_KEY"):
        print("error: ANTHROPIC_API_KEY not set", file=sys.stderr)
        return 1

    candidates = json.loads(CANDIDATES_PATH.read_text())
    template = TEMPLATE_PATH.read_text()
    CACHE.mkdir(parents=True, exist_ok=True)

    queue: list[dict[str, Any]] = []
    for c in candidates:
        if args.slug and c["slug"] != args.slug:
            continue
        if args.state and c["state"] != args.state.upper():
            continue
        if (c.get("total_raised") or 0) < args.min_raised:
            continue
        queue.append(c)

    # Sort by visibility (incumbents + funding) so the most useful work happens first.
    queue.sort(
        key=lambda x: (
            0 if x.get("is_incumbent") else 1,
            -(x.get("total_raised") or 0),
        )
    )
    if args.limit:
        queue = queue[: args.limit]

    already_cached = sum(1 for c in queue if (CACHE / f"{c['slug']}.json").exists())
    todo = len(queue) - already_cached
    print(
        f"Plan: {len(queue)} candidate(s) in queue,"
        f" {already_cached} already cached,"
        f" {todo} to research,"
        f" {args.workers} workers."
    )
    if args.dry_run:
        print("[dry-run] not making API calls.")
        for c in queue[:25]:
            mark = "★" if c.get("is_incumbent") else " "
            cached = "✓" if (CACHE / f"{c['slug']}.json").exists() else " "
            print(
                f"  {cached} {mark} {c['state']} {c['party']} {c['office_sought']:<12}"
                f" ${(c.get('total_raised') or 0):>10,} {c['name']}"
            )
        if len(queue) > 25:
            print(f"  … +{len(queue) - 25} more")
        return 0

    if todo == 0:
        print("Nothing to do.")
        return 0

    client = Anthropic()
    started = time.time()
    completed = 0
    failed: list[tuple[str, str]] = []

    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        futures = {
            ex.submit(process_one, c, template, client): c["slug"]
            for c in queue
        }
        for fut in as_completed(futures):
            slug = futures[fut]
            try:
                _, ok, msg = fut.result()
            except Exception as e:  # noqa: BLE001
                ok, msg = False, f"crash: {e}"
            completed += 1
            elapsed = time.time() - started
            tag = "OK " if ok else "ERR"
            print(
                f"  [{completed:3d}/{len(queue)}] {tag} {slug:<40} {msg}"
                f"  ({elapsed:.0f}s elapsed)"
            )
            if not ok:
                failed.append((slug, msg))

    print()
    print(f"Done. {completed - len(failed)} succeeded, {len(failed)} failed.")
    if failed:
        print("Failures (re-runnable: just re-invoke the script):")
        for slug, msg in failed:
            print(f"  {slug}: {msg}")
    print(
        "\nNext step: python3 scripts/merge_research.py — validates URLs +"
        " quotes, stages all results into trackerv3.xlsx as drafts."
    )
    return 0 if not failed else 2


if __name__ == "__main__":
    sys.exit(main())
