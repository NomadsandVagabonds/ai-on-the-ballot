#!/usr/bin/env python3
"""
Backfill `bioguide_id` on incumbent candidates in data/tracker/candidates.json
from the unitedstates/congress-legislators public-domain roster.

Matching strategy (most reliable first):
  1. House  — (chamber=rep, state, district)         → unique
  2. Senate — (chamber=sen, state, last_name_match)  → 2-of-2 disambiguate
  3. Name+state fallback for anything else.

After matching we optionally HEAD-check each photo URL on
unitedstates.github.io/images to flag bioguide IDs with no published
portrait so the UI will fall back to the monogram gracefully.

Usage:
  python3 scripts/backfill_bioguide.py            # match + write + photo verify
  python3 scripts/backfill_bioguide.py --dry-run  # match only, no file writes
  python3 scripts/backfill_bioguide.py --no-verify  # skip photo HEAD checks
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import urllib.request
import urllib.error
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
CANDIDATES_PATH = ROOT / "data" / "tracker" / "candidates.json"
# The old theunitedstates.io JSON endpoint started returning HTTP 410
# sometime before 2026-04; fall back to the raw YAML on the canonical
# GitHub repo. The content is identical and refreshed daily.
LEGISLATORS_URL = (
    "https://raw.githubusercontent.com/unitedstates/"
    "congress-legislators/master/legislators-current.yaml"
)
PHOTO_URL = (
    "https://unitedstates.github.io/images/congress/{size}/{bioguide}.jpg"
)


def normalize(s: str) -> str:
    """Lowercase, strip non-letters — robust to nicknames, punctuation, diacritics-ish."""
    return re.sub(r"[^a-z]", "", s.lower())


def last_token(s: str) -> str:
    """Last whitespace-separated token ('Alan Crawford' → 'Crawford')."""
    parts = [p for p in re.split(r"\s+", s.strip()) if p]
    return parts[-1] if parts else s


def chamber_type(office: str) -> str | None:
    o = office.lower()
    if "senate" in o:
        return "sen"
    if "house" in o:
        return "rep"
    if "governor" in o:
        return "gov"
    return None


def load_candidates() -> list[dict[str, Any]]:
    with CANDIDATES_PATH.open() as f:
        return json.load(f)


def save_candidates(candidates: list[dict[str, Any]]) -> None:
    with CANDIDATES_PATH.open("w") as f:
        json.dump(candidates, f, indent=2, ensure_ascii=False)
        f.write("\n")


def fetch_legislators() -> list[dict[str, Any]]:
    """Fetch the legislators roster from GitHub via curl (sidesteps the
    macOS Python cert-store issue) and parse the YAML body."""
    import yaml  # local import so the rest of the script runs without it

    print(f"→ fetching {LEGISLATORS_URL}")
    proc = subprocess.run(
        ["curl", "-fsSL", "--max-time", "60", LEGISLATORS_URL],
        capture_output=True,
        check=True,
    )
    data = yaml.safe_load(proc.stdout.decode("utf-8"))
    print(f"  loaded {len(data)} sitting members")
    return data


def current_term(leg: dict[str, Any]) -> dict[str, Any] | None:
    terms = leg.get("terms") or []
    return terms[-1] if terms else None


def build_indexes(legislators: list[dict[str, Any]]):
    """
    Indexes:
      by_house[(state, district_str)]            → bioguide
      by_senate[state]                           → [(bioguide, last_norm), ...]
      by_name[(first_norm, last_norm, state)]    → bioguide   (fallback)
      by_fec[fec_upper]                          → bioguide
    """
    by_house: dict[tuple[str, str], str] = {}
    by_senate: dict[str, list[tuple[str, str]]] = {}
    by_name: dict[tuple[str, str, str], str] = {}
    by_fec: dict[str, str] = {}

    for leg in legislators:
        bioguide = leg.get("id", {}).get("bioguide")
        if not bioguide:
            continue

        for fec in leg.get("id", {}).get("fec") or []:
            by_fec[fec.upper()] = bioguide

        term = current_term(leg)
        if not term:
            continue
        state = (term.get("state") or "").upper()
        if not state:
            continue

        first = normalize(leg.get("name", {}).get("first", ""))
        last = normalize(leg.get("name", {}).get("last", ""))
        by_name[(first, last, state)] = bioguide

        ttype = term.get("type")
        if ttype == "rep":
            dist = str(term.get("district", "")).strip()
            if dist:
                by_house[(state, dist.zfill(2))] = bioguide
                # Also index unpadded for tolerance.
                by_house[(state, dist)] = bioguide
        elif ttype == "sen":
            by_senate.setdefault(state, []).append((bioguide, last))

    print(
        f"  indexed → house={len(by_house)//2} state+district,"
        f" senate_seats={sum(len(v) for v in by_senate.values())},"
        f" fec={len(by_fec)}, names={len(by_name)}"
    )
    return by_house, by_senate, by_name, by_fec


def match_candidate(
    c: dict[str, Any],
    by_house, by_senate, by_name, by_fec,
) -> tuple[str, str] | None:
    """Returns (bioguide_id, matched_by) or None."""

    # 0 — FEC ID (rare in this dataset but authoritative)
    fec = (c.get("fec_id") or "").upper().strip()
    if fec:
        hit = by_fec.get(fec)
        if hit:
            return hit, "fec"

    state = (c.get("state") or "").upper()
    chamber = chamber_type(c.get("office_sought", ""))

    # 1 — House: state + district is unique
    if chamber == "rep":
        dist = str(c.get("district") or "").strip()
        if dist:
            hit = by_house.get((state, dist.zfill(2))) or by_house.get((state, dist))
            if hit:
                return hit, "house-district"

    # 2 — Senate: at most 2 legislators per state; disambiguate by last name
    if chamber == "sen":
        seats = by_senate.get(state) or []
        cand_last = normalize(last_token(c.get("last_name") or ""))
        # exact last-name match
        matches = [b for b, last in seats if last == cand_last]
        if len(matches) == 1:
            return matches[0], "senate-lastname"
        # substring fallback — e.g. "Smith-Jones" vs "Smith"
        sub_matches = [
            b for b, last in seats if last and (last in cand_last or cand_last in last)
        ]
        if len(sub_matches) == 1:
            return sub_matches[0], "senate-lastname-sub"

    # 3 — Fallback: name+state, tolerant of split "first=Eric last=Alan Crawford"
    first = normalize(c.get("first_name") or "")
    last_full = c.get("last_name") or ""
    last_tok = normalize(last_token(last_full))
    last_full_norm = normalize(last_full)
    for last_candidate in (last_tok, last_full_norm):
        hit = by_name.get((first, last_candidate, state))
        if hit:
            return hit, "name"
    # Also try: combine candidate.first + last_token of full name against legislators
    full_name_norm = normalize(c.get("name") or "")
    # last-resort scan by (last_tok, state) across all name index entries
    last_only = [
        (k, v)
        for k, v in by_name.items()
        if k[2] == state and k[1] == last_tok
    ]
    if len(last_only) == 1:
        return last_only[0][1], "state+lastname"
    # still ambiguous — try to pick the one whose first name is a prefix of ours
    for k, v in last_only:
        leg_first = k[0]
        if leg_first and (first.startswith(leg_first) or leg_first.startswith(first)):
            return v, "state+lastname+firstprefix"
    # scan by last token appearing in full name
    for k, v in by_name.items():
        if k[2] != state:
            continue
        if k[1] and k[1] in full_name_norm:
            # stricter: require first-initial match
            if k[0] and k[0][0] == first[:1]:
                return v, "fuzzy"

    return None


def verify_photo(bioguide: str, size: str = "225x275") -> bool:
    """HEAD-check the photo via curl (same cert-store reason as the
    legislator fetch)."""
    url = PHOTO_URL.format(size=size, bioguide=bioguide)
    try:
        proc = subprocess.run(
            [
                "curl",
                "-sI",
                "--max-time",
                "10",
                "-o",
                "/dev/null",
                "-w",
                "%{http_code}",
                url,
            ],
            capture_output=True,
            check=False,
        )
        return proc.stdout.decode().strip() == "200"
    except Exception:
        return False


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--no-verify", action="store_true",
                        help="Skip HEAD checks on photo URLs")
    args = parser.parse_args()

    candidates = load_candidates()
    incumbents = [c for c in candidates if c.get("is_incumbent")]
    print(f"candidates: {len(candidates)}  incumbents: {len(incumbents)}")

    need = [c for c in incumbents if not c.get("bioguide_id")]
    print(f"incumbents missing bioguide_id: {len(need)}")
    if not need:
        print("nothing to backfill.")
        return 0

    legislators = fetch_legislators()
    by_house, by_senate, by_name, by_fec = build_indexes(legislators)

    matches: list[tuple[dict[str, Any], str, str]] = []
    unmatched: list[dict[str, Any]] = []
    stats: dict[str, int] = {}

    for c in need:
        hit = match_candidate(c, by_house, by_senate, by_name, by_fec)
        if hit:
            bioguide, how = hit
            matches.append((c, bioguide, how))
            stats[how] = stats.get(how, 0) + 1
        else:
            unmatched.append(c)

    print(f"\nmatched: {len(matches)}  unmatched: {len(unmatched)}")
    for how, n in sorted(stats.items(), key=lambda kv: -kv[1]):
        print(f"  {how:24s} {n}")

    if unmatched:
        print("\nunmatched incumbents (need manual review):")
        for c in unmatched:
            print(
                f"  · {c['name']:35s}"
                f" {c['state']}-{c.get('district') or '  '}"
                f"  ({c.get('office_sought')})"
            )

    # Write back to JSON
    if args.dry_run:
        print("\ndry-run — not writing candidates.json")
    else:
        by_id = {c["id"]: c for c in candidates}
        for c, bioguide, _ in matches:
            by_id[c["id"]]["bioguide_id"] = bioguide
        save_candidates(candidates)
        print(f"\nwrote {len(matches)} bioguide IDs → {CANDIDATES_PATH}")

    # Photo verify
    if not args.no_verify and matches:
        print("\nverifying photo URLs (HEAD)...")
        ok = 0
        broken: list[tuple[dict[str, Any], str]] = []
        for c, bioguide, _ in matches:
            if verify_photo(bioguide):
                ok += 1
            else:
                broken.append((c, bioguide))
        print(f"photos live: {ok} / {len(matches)}")
        if broken:
            print("no portrait on unitedstates/images (will render as monogram):")
            for c, b in broken:
                print(f"  · {c['name']} ({b})")

    return 0


if __name__ == "__main__":
    sys.exit(main())
