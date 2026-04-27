#!/usr/bin/env python3
"""
Select the pilot research cohort.

Strategy:
  - All Senate candidates that meet the FEC funding threshold ($100K),
    per the methodology in src/app/about/page.tsx.
  - Top 3 House incumbents per state by total_raised (proxy for visibility,
    since committee_assignments isn't populated yet).

Writes scripts/.research-cache/_cohort.json containing the briefing record
each research subagent will receive.

Usage:
  python3 scripts/select_pilot_cohort.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "tracker"
CACHE = ROOT / "scripts" / ".research-cache"
SENATE_FUNDING_FLOOR = 100_000  # FEC inclusion threshold for Senate
HOUSE_INCUMBENTS_PER_STATE = 3


def load(name: str):
    return json.loads((DATA / name).read_text())


def brief_record(c: dict) -> dict:
    """Subset of candidate fields the subagent prompt will reference."""
    return {
        "id": c["id"],
        "slug": c["slug"],
        "name": c["name"],
        "first_name": c.get("first_name"),
        "last_name": c.get("last_name"),
        "party": c["party"],
        "state": c["state"],
        "chamber": (
            "senate"
            if "Senate" in c["office_sought"]
            else "house"
            if "House" in c["office_sought"]
            else "governor"
            if "Governor" in c["office_sought"]
            else "other"
        ),
        "office_sought": c["office_sought"],
        "district": c.get("district"),
        "election_year": c.get("election_year"),
        "fec_id": c.get("fec_id"),
        "bioguide_id": c.get("bioguide_id"),
        "is_incumbent": bool(c.get("is_incumbent")),
        "total_raised": c.get("total_raised") or 0,
        "committee_assignments": c.get("committee_assignments") or [],
    }


def main() -> None:
    candidates = load("candidates.json")

    senate = [
        c
        for c in candidates
        if "Senate" in c["office_sought"]
        and (c.get("total_raised") or 0) >= SENATE_FUNDING_FLOOR
    ]

    # Top House incumbents per state by fundraising.
    house_inc_by_state: dict[str, list[dict]] = {}
    for c in candidates:
        if "House" not in c["office_sought"]:
            continue
        if not c.get("is_incumbent"):
            continue
        house_inc_by_state.setdefault(c["state"], []).append(c)

    house_pick: list[dict] = []
    for st, lst in house_inc_by_state.items():
        lst.sort(key=lambda x: -(x.get("total_raised") or 0))
        house_pick.extend(lst[:HOUSE_INCUMBENTS_PER_STATE])

    cohort = [brief_record(c) for c in senate + house_pick]
    cohort.sort(key=lambda x: (x["state"], x["chamber"], x["name"]))

    CACHE.mkdir(parents=True, exist_ok=True)
    out = CACHE / "_cohort.json"
    out.write_text(json.dumps(cohort, indent=2) + "\n")

    print(f"Cohort: {len(cohort)} candidates")
    print(f"  Senate (>=${SENATE_FUNDING_FLOOR:,}): {len(senate)}")
    print(f"  House incumbents (top {HOUSE_INCUMBENTS_PER_STATE}/state): {len(house_pick)}")
    print()
    by_state: dict[str, int] = {}
    for c in cohort:
        by_state[c["state"]] = by_state.get(c["state"], 0) + 1
    for st, n in sorted(by_state.items()):
        print(f"  {st}: {n}")
    print()
    print(f"Wrote {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
