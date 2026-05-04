"""
Seed Supabase from data/tracker/*.json (the live JSON the site reads).

This makes Supabase a 1:1 mirror — same UUIDs, same row counts, same
relationships — so parity checks during the JSON-to-Supabase migration
are a simple count comparison.

Usage:
    python3 scripts/seed_supabase_from_json.py            # full upsert
    python3 scripts/seed_supabase_from_json.py --wipe     # truncate first
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}")


def _safe_date(v):
    if v is None:
        return None
    s = str(v)
    return v if DATE_RE.match(s) else None

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "tracker"


def load_env() -> dict[str, str]:
    env_path = ROOT / ".env.local"
    out: dict[str, str] = {}
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def rest_request(
    base: str,
    secret: str,
    method: str,
    path: str,
    body: Any = None,
    prefer: str | None = None,
) -> tuple[int, bytes]:
    url = f"{base}/rest/v1/{path}"
    data = None if body is None else json.dumps(body).encode("utf-8")
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("apikey", secret)
    req.add_header("Authorization", f"Bearer {secret}")
    req.add_header("Content-Type", "application/json")
    if prefer:
        req.add_header("Prefer", prefer)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def upsert_chunked(
    base: str,
    secret: str,
    table: str,
    rows: list[dict],
    on_conflict: str,
    chunk: int = 500,
) -> None:
    print(f"  upserting {len(rows)} rows into {table} (chunk={chunk})…")
    for i in range(0, len(rows), chunk):
        batch = rows[i : i + chunk]
        path = f"{table}?on_conflict={on_conflict}"
        status, body = rest_request(
            base,
            secret,
            "POST",
            path,
            body=batch,
            prefer="resolution=merge-duplicates,return=minimal",
        )
        if status >= 300:
            print(
                f"    ERROR at offset {i}: HTTP {status}: {body.decode('utf-8', 'replace')[:400]}",
                file=sys.stderr,
            )
            sys.exit(1)


def truncate(base: str, secret: str, table: str, key_col: str = "id") -> None:
    # PostgREST won't TRUNCATE; we DELETE everything via a never-true filter.
    path = f"{table}?{key_col}=neq.00000000-0000-0000-0000-000000000000"
    status, body = rest_request(base, secret, "DELETE", path, prefer="return=minimal")
    if status >= 300:
        print(
            f"  WARN: wipe of {table} returned HTTP {status}: {body.decode('utf-8','replace')[:200]}",
            file=sys.stderr,
        )


def count_rows(base: str, secret: str, table: str) -> int:
    req = urllib.request.Request(f"{base}/rest/v1/{table}?select=count", method="HEAD")
    req.add_header("apikey", secret)
    req.add_header("Authorization", f"Bearer {secret}")
    req.add_header("Prefer", "count=exact")
    req.add_header("Range-Unit", "items")
    req.add_header("Range", "0-0")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            cr = resp.headers.get("Content-Range", "")
    except urllib.error.HTTPError as e:
        return -1
    if "/" in cr:
        return int(cr.split("/")[-1])
    return -1


def run(wipe: bool = False) -> int:
    """Push data/tracker/*.json to Supabase. Returns 0 on parity match, 1 on mismatch."""
    env = load_env()
    if "NEXT_PUBLIC_SUPABASE_URL" not in env or "SUPABASE_SERVICE_ROLE_KEY" not in env:
        print(
            "  Supabase env not configured (NEXT_PUBLIC_SUPABASE_URL / "
            "SUPABASE_SERVICE_ROLE_KEY missing) — skipping push.",
            file=sys.stderr,
        )
        return 0
    base = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
    secret = env["SUPABASE_SERVICE_ROLE_KEY"]
    if "your-project" in base or "your-service-role" in secret:
        print(
            "  Supabase env still has placeholder values — skipping push.",
            file=sys.stderr,
        )
        return 0

    print(f"Target: {base}")

    issues = json.loads((DATA / "issues.json").read_text())
    candidates = json.loads((DATA / "candidates.json").read_text())
    races = json.loads((DATA / "races.json").read_text())
    race_candidates = json.loads((DATA / "race_candidates.json").read_text())
    positions = json.loads((DATA / "positions.json").read_text())
    corrections = json.loads((DATA / "corrections.json").read_text())

    print(
        f"Loaded JSON: issues={len(issues)} candidates={len(candidates)} "
        f"races={len(races)} race_candidates={len(race_candidates)} "
        f"positions={len(positions)} corrections={len(corrections)}"
    )

    if wipe:
        print("Wiping existing rows (positions → race_candidates → candidates → races → issues → corrections_log)…")
        # Order matters for FK-safe deletion
        for tbl in (
            "positions",
            "race_candidates",
            "legislative_activity",
            "candidates",
            "races",
            "issues",
            "corrections_log",
        ):
            truncate(base, secret, tbl)

    # ---- Issues ----
    issue_rows = [
        {
            "id": i["id"],
            "slug": i["slug"],
            "display_name": i["display_name"],
            "description": i.get("description") or "",
            "icon": i.get("icon"),
            "sort_order": i.get("sort_order", 0),
        }
        for i in issues
    ]
    upsert_chunked(base, secret, "issues", issue_rows, on_conflict="id")

    # ---- Candidates ----
    cand_rows = []
    for c in candidates:
        cand_rows.append(
            {
                "id": c["id"],
                "slug": c["slug"],
                "name": c["name"],
                "first_name": c["first_name"],
                "last_name": c["last_name"],
                "party": c["party"],
                "state": c["state"],
                "district": c.get("district"),
                "office_sought": c.get("office_sought"),
                "committee_assignments": c.get("committee_assignments") or [],
                "election_year": c.get("election_year") or 2026,
                "fec_id": c.get("fec_id"),
                "bioguide_id": c.get("bioguide_id"),
                "photo_url": c.get("photo_url"),
                "is_incumbent": bool(c.get("is_incumbent")),
                "total_raised": c.get("total_raised"),
            }
        )
    upsert_chunked(base, secret, "candidates", cand_rows, on_conflict="id", chunk=200)

    # ---- Races ----
    race_rows = [
        {
            "id": r["id"],
            "slug": r["slug"],
            "state": r["state"],
            "chamber": r["chamber"],
            "district": r.get("district"),
            "election_year": r.get("election_year") or 2026,
            "race_type": r.get("race_type") or "regular",
        }
        for r in races
    ]
    upsert_chunked(base, secret, "races", race_rows, on_conflict="id")

    # ---- race_candidates ----
    rc_rows = [
        {"race_id": rc["race_id"], "candidate_id": rc["candidate_id"]}
        for rc in race_candidates
    ]
    upsert_chunked(
        base,
        secret,
        "race_candidates",
        rc_rows,
        on_conflict="race_id,candidate_id",
        chunk=500,
    )

    # ---- Positions ----
    pos_rows = []
    for p in positions:
        # last_updated is NOT NULL with a now() default; let the DB fill it.
        # The JSON values include malformed/missing entries so don't round-trip them.
        pos_rows.append(
            {
                "id": p["id"],
                "candidate_id": p["candidate_id"],
                "issue_id": p["issue_id"],
                "stance": p["stance"],
                "confidence": p["confidence"],
                "summary": p.get("summary"),
                "full_quote": p.get("full_quote"),
                "source_url": p.get("source_url"),
                "date_recorded": _safe_date(p.get("date_recorded")),
            }
        )
    upsert_chunked(
        base, secret, "positions", pos_rows, on_conflict="id", chunk=500
    )

    # ---- Corrections ----
    # Note: data/tracker/corrections.json is the published correction log (date,
    # description). The corrections_log table in the DB models public-submitted
    # corrections (candidate_name, issue, proposed_correction, status…). Different
    # concepts — handled in a later migration. Skipping for now.
    if corrections:
        print(
            f"  skipping {len(corrections)} corrections — schema/JSON shapes differ; revisit in Phase 2"
        )

    # ---- Parity check ----
    print("\nParity check:")
    parity_ok = True
    for tbl, expected in (
        ("issues", len(issues)),
        ("candidates", len(candidates)),
        ("races", len(races)),
        ("race_candidates", len(race_candidates)),
        ("positions", len(positions)),
    ):
        actual = count_rows(base, secret, tbl)
        match = actual == expected
        marker = "✅" if match else "❌"
        print(f"  {marker} {tbl}: json={expected} supabase={actual}")
        if not match:
            parity_ok = False

    return 0 if parity_ok else 1


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--wipe",
        action="store_true",
        help="Delete existing rows before upsert (DEV ONLY).",
    )
    args = ap.parse_args()
    sys.exit(run(wipe=args.wipe))


if __name__ == "__main__":
    main()
