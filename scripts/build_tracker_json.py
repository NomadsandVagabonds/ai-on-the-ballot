"""
Ingest tracker_update.xlsx and emit normalized JSON files under data/tracker/.

The site's mock-data layer (src/lib/mock-data.ts) consumes these JSON files
directly at build time, so re-running this script is the only action needed
to refresh the site with newer research.

Outputs:
  data/tracker/issues.json
  data/tracker/candidates.json       (includes `general_sources` — orphan citations)
  data/tracker/races.json
  data/tracker/race_candidates.json
  data/tracker/positions.json        (includes embedded sources per position)

Normalization it performs:
  - Party strings (18 raw variants → D | R | I | L | G)
  - District format ("CD 1", "AR-1", "TX-01", "Senate" → canonical string)
  - Stance / confidence capitalization to match our enum
  - Seat + district derive chamber ("house" | "senate")
  - Races derived from unique (state, chamber, district) tuples
  - Slug in our project convention ({first}-{last}-{state_abbr})
  - Stable UUIDs (uuid5 from slug) so positions/sources keep referential
    integrity across re-ingests
"""

from __future__ import annotations

import json
import re
import unicodedata
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

import pandas as pd  # type: ignore[import-not-found]

ROOT = Path(__file__).resolve().parent.parent
def _pick_xlsx() -> Path:
    """Prefer the v3 file from the client's new design drop; fall back
    to the legacy tracker_update.xlsx for older workflows."""
    candidates = [
        ROOT.parent / "new design" / "trackerv3.xlsx",
        ROOT.parent / "tracker_update.xlsx",
    ]
    for c in candidates:
        if c.exists():
            return c
    return candidates[0]


XLSX_PATH = _pick_xlsx()


def _positions_sheet_name(xlsx_path: Path) -> str:
    """v3 renamed the sheet to 'Positions v2' and deprecated the old one."""
    import openpyxl  # type: ignore[import-not-found]

    wb = openpyxl.load_workbook(xlsx_path, data_only=True, read_only=True)
    names = wb.sheetnames
    for candidate in ("Positions v2", "Positions"):
        if candidate in names:
            return candidate
    return names[0]
OUT_DIR = ROOT / "data" / "tracker"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Stable namespace for deterministic UUIDs so positions keep their candidate_id
# mapping across re-ingests.
UUID_NAMESPACE = uuid.UUID("4a6f7572-6e61-6c2d-4f66-2d526563726f")

ELECTION_YEAR = 2026
FIXED_TIMESTAMP = "2026-04-17T00:00:00Z"

# ----------------------------------------------------------------------
# Normalizers
# ----------------------------------------------------------------------

PARTY_MAP: dict[str, str] = {
    # Normalized lowercase → enum
    "democrat": "D",
    "democratic": "D",
    "republican": "R",
    "independent": "I",
    "indepedent": "I",  # typo in source
    "independent (democratic)": "I",
    "independent (republican)": "I",
    "independent american": "I",
    "libertarian": "L",
    "green": "G",
    "working class": "I",
    "other": "I",
    "republican (write-in)": "R",
}

STANCE_MAP: dict[str, str] = {
    "no mention": "no_mention",
    "support": "support",
    "oppose": "oppose",
    "mixed": "mixed",
    "unclear": "unclear",
}

CONFIDENCE_MAP: dict[str, str] = {
    "high": "high",
    "medium": "medium",
    "low": "low",
}

SOURCE_TYPE_MAP: dict[str, str] = {
    "statement": "statement",
    "legislation": "legislation",
    "survey": "survey",
    "social media": "social_media",
    "news": "news",
}


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text


def candidate_slug(first: str, last: str, state: str) -> str:
    return f"{slugify(first)}-{slugify(last)}-{state.lower()}"


def stable_uuid(seed: str) -> str:
    return str(uuid.uuid5(UUID_NAMESPACE, seed))


def normalize_party(raw: str) -> str:
    key = str(raw).strip().lower()
    return PARTY_MAP.get(key, "I")


def normalize_stance(raw: Any) -> str:
    if pd.isna(raw):
        return "no_mention"
    return STANCE_MAP.get(str(raw).strip().lower(), "no_mention")


def normalize_confidence(raw: Any) -> str:
    if pd.isna(raw):
        return "low"
    return CONFIDENCE_MAP.get(str(raw).strip().lower(), "low")


def normalize_source_type(raw: Any) -> str:
    if pd.isna(raw):
        return "statement"
    return SOURCE_TYPE_MAP.get(str(raw).strip().lower(), "statement")


def normalize_seat(raw: Any) -> str:
    return str(raw or "").strip().lower()


def derive_chamber(seat: str) -> str | None:
    s = normalize_seat(seat)
    if s == "senate":
        return "senate"
    if s == "house":
        return "house"
    if s == "governor":
        return "governor"
    return None


DISTRICT_RE = re.compile(r"(\d+)")


def normalize_district(raw: Any, chamber: str | None) -> str | None:
    """Senate rows have district='Senate' or NaN. House rows have 'CD 1', 'AR-1', 'TX-01', etc."""
    if chamber == "senate":
        return None
    if pd.isna(raw):
        return None
    raw_str = str(raw).strip()
    if not raw_str or raw_str.lower() == "senate":
        return None
    # Extract first group of digits.
    m = DISTRICT_RE.search(raw_str)
    if not m:
        return None
    return str(int(m.group(1)))  # drops zero-padding; UI re-pads if needed


def split_name(full: str) -> tuple[str, str]:
    full = re.sub(r"\s+", " ", full.strip())
    # Strip quoted nicknames like 'Eric Alan "Rick" Crawford' → first+last
    full = re.sub(r"\"[^\"]+\"", "", full).strip()
    # Ensure single-letter initials ("G.") are followed by a space
    full = re.sub(r"([A-Z]\.)(?=[A-Z])", r"\1 ", full)
    full = re.sub(r"\s+", " ", full)
    parts = full.split(" ")
    if len(parts) == 1:
        return parts[0], parts[0]
    return parts[0], " ".join(parts[1:])


def office_sought(chamber: str | None) -> str:
    return {
        "senate": "U.S. Senate",
        "house": "U.S. House",
        "governor": "Governor",
    }.get(chamber or "", "U.S. House")


def race_slug(state: str, chamber: str, district: str | None, year: int) -> str:
    abbr = {"senate": "sen", "house": "house", "governor": "gov"}[chamber]
    parts = [state.lower(), abbr]
    if district:
        parts.append(district.zfill(2))
    parts.append(str(year))
    return "-".join(parts)


# ----------------------------------------------------------------------
# Builders
# ----------------------------------------------------------------------


@dataclass
class Ctx:
    candidates: list[dict[str, Any]]
    cand_by_source_id: dict[str, dict[str, Any]]


def build_issues(df_topics: pd.DataFrame) -> list[dict[str, Any]]:
    issues = []
    sort_order = 1
    for _, row in df_topics.iterrows():
        if pd.isna(row["id"]) or pd.isna(row["name"]):
            continue
        slug = str(row["id"]).strip()
        if not slug or slug.lower().startswith("considering"):
            continue
        issues.append(
            {
                "id": stable_uuid(f"issue:{slug}"),
                "slug": slug,
                "display_name": str(row["name"]).strip(),
                "description": str(row["description"]).strip() if pd.notna(row["description"]) else "",
                "icon": None,
                "sort_order": sort_order,
                "created_at": FIXED_TIMESTAMP,
                "updated_at": FIXED_TIMESTAMP,
            }
        )
        sort_order += 1
    return issues


def build_candidates(df_cands: pd.DataFrame) -> tuple[list[dict[str, Any]], dict[str, dict[str, Any]]]:
    out: list[dict[str, Any]] = []
    by_source_id: dict[str, dict[str, Any]] = {}

    for _, row in df_cands.iterrows():
        source_id = str(row["id"]).strip() if pd.notna(row["id"]) else None
        if not source_id:
            continue

        name = str(row["name"]).strip() if pd.notna(row["name"]) else ""
        if not name:
            continue

        first, last = split_name(name)
        state = str(row["state"]).strip().upper() if pd.notna(row["state"]) else ""
        party = normalize_party(row["party"])
        chamber = derive_chamber(row["seat"])
        district = normalize_district(row.get("district"), chamber)
        is_incumbent = str(row.get("incumbency", "N")).strip().upper() == "Y"
        amount_raised = row.get("amount raised")
        total_raised = int(amount_raised) if pd.notna(amount_raised) else None
        notes = str(row["notes"]).strip() if pd.notna(row.get("notes")) else None

        slug = candidate_slug(first, last, state)
        cand = {
            "id": stable_uuid(f"candidate:{source_id}"),
            "source_id": source_id,  # internal only, stripped before export
            "name": name,
            "first_name": first,
            "last_name": last,
            "slug": slug,
            "photo_url": None,
            "party": party,
            "state": state,
            "district": district,
            "office_sought": office_sought(chamber),
            "chamber": chamber,  # internal only
            "committee_assignments": [],
            "election_year": ELECTION_YEAR,
            "fec_id": None,
            "bioguide_id": None,
            "is_incumbent": is_incumbent,
            "total_raised": total_raised,
            "notes": notes,
            "created_at": FIXED_TIMESTAMP,
            "updated_at": FIXED_TIMESTAMP,
        }
        out.append(cand)
        by_source_id[source_id] = cand

    return out, by_source_id


def build_races_and_junction(candidates: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    races_by_key: dict[tuple[str, str, str | None], dict[str, Any]] = {}
    for c in candidates:
        chamber = c.get("chamber")
        if chamber not in ("senate", "house", "governor"):
            continue
        key = (c["state"], chamber, c["district"])
        if key in races_by_key:
            continue
        slug = race_slug(c["state"], chamber, c["district"], ELECTION_YEAR)
        races_by_key[key] = {
            "id": stable_uuid(f"race:{slug}"),
            "slug": slug,
            "state": c["state"],
            "chamber": chamber,
            "district": c["district"],
            "election_year": ELECTION_YEAR,
            "race_type": "regular",
            "created_at": FIXED_TIMESTAMP,
            "updated_at": FIXED_TIMESTAMP,
        }

    junction: list[dict[str, Any]] = []
    for c in candidates:
        chamber = c.get("chamber")
        if chamber not in ("senate", "house", "governor"):
            continue
        key = (c["state"], chamber, c["district"])
        race = races_by_key.get(key)
        if not race:
            continue
        junction.append({"race_id": race["id"], "candidate_id": c["id"]})

    # Sort for deterministic output
    races = sorted(races_by_key.values(), key=lambda r: (r["state"], r["chamber"], r["district"] or ""))
    junction.sort(key=lambda rc: (rc["race_id"], rc["candidate_id"]))
    return races, junction


def route_sources(
    df_sources: pd.DataFrame,
    position_ids: set[str],
    candidate_source_ids: set[str],
) -> tuple[dict[str, list[dict[str, Any]]], dict[str, list[dict[str, Any]]], int]:
    """
    The spreadsheet's Sources sheet uses a `positionId` column that sometimes
    contains a candidate slug (e.g. "foster-bill") rather than a position ID
    (e.g. "pos-0007"). Route each source to the right bucket:
      - Known position ID → attach to that position
      - Known candidate slug → attach to that candidate as a general citation
      - Neither → drop and count
    """
    by_pos: dict[str, list[dict[str, Any]]] = {}
    by_cand: dict[str, list[dict[str, Any]]] = {}
    dropped = 0

    for _, s in df_sources.iterrows():
        key = str(s["positionId"]).strip() if pd.notna(s["positionId"]) else None
        if not key:
            dropped += 1
            continue

        record = {
            "type": normalize_source_type(s.get("type")),
            "title": str(s["title"]).strip() if pd.notna(s["title"]) else None,
            "url": str(s["url"]).strip() if pd.notna(s["url"]) else None,
            "date": s["date"].date().isoformat()
            if pd.notna(s["date"]) and hasattr(s["date"], "date")
            else (str(s["date"])[:10] if pd.notna(s["date"]) else None),
            "excerpt": str(s["excerpt"]).strip() if pd.notna(s["excerpt"]) else None,
        }

        if key in position_ids:
            by_pos.setdefault(key, []).append(record)
        elif key in candidate_source_ids:
            by_cand.setdefault(key, []).append(record)
        else:
            dropped += 1

    return by_pos, by_cand, dropped


def build_positions(
    df_pos: pd.DataFrame,
    sources_by_pos: dict[str, list[dict[str, Any]]],
    candidates_by_source_id: dict[str, dict[str, Any]],
    issues: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    issue_by_slug = {i["slug"]: i for i in issues}

    out: list[dict[str, Any]] = []
    for _, row in df_pos.iterrows():
        source_pos_id = str(row["id"]).strip() if pd.notna(row["id"]) else None
        cand_source_id = str(row["candidateId"]).strip() if pd.notna(row["candidateId"]) else None
        topic_slug = str(row["topicId"]).strip() if pd.notna(row["topicId"]) else None
        if not (source_pos_id and cand_source_id and topic_slug):
            continue

        cand = candidates_by_source_id.get(cand_source_id)
        issue = issue_by_slug.get(topic_slug)
        if not cand or not issue:
            continue

        stance = normalize_stance(row.get("stance"))
        confidence = normalize_confidence(row.get("confidence"))
        summary = str(row["summary"]).strip() if pd.notna(row.get("summary")) else None
        last_updated = (
            row["lastUpdated"].date().isoformat()
            if pd.notna(row.get("lastUpdated")) and hasattr(row["lastUpdated"], "date")
            else (str(row["lastUpdated"])[:10] if pd.notna(row.get("lastUpdated")) else None)
        )

        sources = sources_by_pos.get(source_pos_id, [])
        first_source = sources[0] if sources else None

        full_quote = first_source.get("excerpt") if first_source else None

        out.append(
            {
                "id": stable_uuid(f"position:{source_pos_id}"),
                "candidate_id": cand["id"],
                "issue_id": issue["id"],
                "stance": stance,
                "confidence": confidence,
                "summary": summary,
                "full_quote": full_quote,
                "source_url": first_source.get("url") if first_source else None,
                "date_recorded": last_updated,
                "last_updated": last_updated or FIXED_TIMESTAMP,
                "created_at": FIXED_TIMESTAMP,
                "updated_at": FIXED_TIMESTAMP,
                "sources": sources,
            }
        )

    return out


# ----------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------


def strip_internal(rows: Iterable[dict[str, Any]], keys: list[str]) -> list[dict[str, Any]]:
    cleaned = []
    for r in rows:
        copy = dict(r)
        for k in keys:
            copy.pop(k, None)
        cleaned.append(copy)
    return cleaned


def main() -> None:
    if not XLSX_PATH.exists():
        raise SystemExit(f"Missing spreadsheet at {XLSX_PATH}")

    df_cands = pd.read_excel(XLSX_PATH, sheet_name="Candidates")
    df_topics = pd.read_excel(XLSX_PATH, sheet_name="Topics")
    df_pos = pd.read_excel(XLSX_PATH, sheet_name=_positions_sheet_name(XLSX_PATH))
    df_sources = pd.read_excel(XLSX_PATH, sheet_name="Sources")

    issues = build_issues(df_topics)
    print(f"  issues        {len(issues):4d}")

    candidates, cand_by_source_id = build_candidates(df_cands)
    print(f"  candidates    {len(candidates):4d}")

    races, race_candidates = build_races_and_junction(candidates)
    print(f"  races         {len(races):4d}")
    print(f"  race_cands    {len(race_candidates):4d}")

    # Route sources: some key on position id, some key on candidate slug
    position_ids_in_pos = set(
        str(r["id"]).strip() for _, r in df_pos.iterrows() if pd.notna(r["id"])
    )
    sources_by_pos, sources_by_cand, dropped_sources = route_sources(
        df_sources, position_ids_in_pos, set(cand_by_source_id.keys())
    )
    pos_source_count = sum(len(v) for v in sources_by_pos.values())
    cand_source_count = sum(len(v) for v in sources_by_cand.values())
    print(f"  sources/pos   {pos_source_count:4d}")
    print(f"  sources/cand  {cand_source_count:4d} (candidate-level citations)")
    if dropped_sources:
        print(f"  sources dropped {dropped_sources:4d}")

    # Attach per-candidate general sources
    for source_id, sources in sources_by_cand.items():
        cand = cand_by_source_id.get(source_id)
        if cand is not None:
            cand["general_sources"] = sources
    for c in candidates:
        c.setdefault("general_sources", [])

    positions = build_positions(df_pos, sources_by_pos, cand_by_source_id, issues)
    print(f"  positions     {len(positions):4d}")

    real_positions = [p for p in positions if p["stance"] != "no_mention"]
    print(f"  real positions {len(real_positions):4d}")

    # Strip internal fields not part of the DB/TS shape
    candidates_out = strip_internal(candidates, ["source_id", "chamber", "notes"])

    def dump(name: str, data: Any) -> None:
        path = OUT_DIR / name
        with open(path, "w") as f:
            json.dump(data, f, indent=2, default=str)
        print(f"  wrote {path.relative_to(ROOT)}")

    dump("issues.json", issues)
    dump("candidates.json", candidates_out)
    dump("races.json", races)
    dump("race_candidates.json", race_candidates)
    dump("positions.json", positions)


if __name__ == "__main__":
    main()
