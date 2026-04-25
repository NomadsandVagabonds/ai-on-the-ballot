"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type {
  IssuePositionRecord,
  IssueWithRecords,
} from "@/types/domain";
import type { Party, Stance } from "@/types/database";
import { STANCE_DISPLAY, partyLabel } from "@/lib/utils/stance";
import { STATE_MAP } from "@/lib/utils/states";
import { StanceIndicator } from "@/components/shared/StanceIndicator";
import { PartyBadge } from "@/components/shared/PartyBadge";
import { ToggleSwitch } from "@/components/shared/ToggleSwitch";
import { resolveCandidatePhoto } from "@/lib/utils/portrait";

interface IssueRosterProps {
  data: IssueWithRecords;
}

/* ============================================================
   Helpers
   ============================================================ */

const STANCE_ORDER: Stance[] = [
  "support",
  "oppose",
  "mixed",
  "unclear",
  "no_mention",
];

// Stances included in the stance filter UI (excludes no_mention;
// that one is governed by the Hide No Mention toggle).
const STANCE_FILTER_OPTIONS: Stance[] = [
  "support",
  "oppose",
  "mixed",
  "unclear",
];

const PARTY_ORDER: Party[] = ["D", "R", "I", "L", "G"];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function hostnameOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "").toUpperCase();
  } catch {
    return null;
  }
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  statement: "Statement",
  legislation: "Legislation",
  survey: "Survey",
  social_media: "Social Media",
  news: "News",
};

function officeAbbr(office: string, district: string | null): string {
  const lower = office.toLowerCase();
  if (lower.includes("senate")) return "Senate";
  if (lower.includes("house") || lower.includes("representative")) {
    return district ? `House · Dist. ${district}` : "House";
  }
  if (lower.includes("governor")) return "Governor";
  return office;
}

/* ============================================================
   Filter pill
   ============================================================ */

function FilterPill({
  active,
  onClick,
  children,
  accent,
  disabled,
  disabledTitle,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  /** Optional stance color for stance-filter pills */
  accent?: string;
  /** Render as non-interactive — no candidates match this filter */
  disabled?: boolean;
  /** Tooltip shown when disabled */
  disabledTitle?: string;
}) {
  const activeStyle: React.CSSProperties | undefined =
    active && !disabled
      ? accent
        ? { backgroundColor: accent, borderColor: accent, color: "#FFFFFF" }
        : { color: "#FFFFFF" }
      : undefined;

  const baseClasses =
    "inline-flex items-center px-3 py-1.5 rounded-sm border transition-colors marginalia-label";

  const stateClasses = disabled
    ? "bg-bg-surface text-text-muted border-border opacity-55 cursor-not-allowed"
    : active && !accent
      ? "bg-accent-primary text-white border-accent-primary cursor-pointer"
      : active
        ? "cursor-pointer"
        : "bg-bg-surface text-text-secondary border-border hover:bg-bg-elevated hover:border-border-strong hover:text-text-primary cursor-pointer";

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-pressed={active}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      title={disabled ? disabledTitle : undefined}
      style={{ margin: 0, ...activeStyle }}
      className={`${baseClasses} ${stateClasses}`}
    >
      {children}
    </button>
  );
}

/* ============================================================
   Record card — collapsed by default when extras exist
   ============================================================ */

function RecordCard({ record }: { record: IssuePositionRecord }) {
  const display = STANCE_DISPLAY[record.stance];
  const stateName = STATE_MAP[record.state] ?? record.state;
  const portraitSrc = resolveCandidatePhoto(record);

  // Back-compat: if `sources` is empty but a legacy single `source_url` is
  // present, synthesise a single source entry so the rendering is uniform.
  const sources = record.sources && record.sources.length > 0
    ? record.sources
    : record.source_url
      ? [
          {
            type: "statement" as const,
            title: null,
            url: record.source_url,
            date: record.date_recorded,
            excerpt: record.full_quote,
          },
        ]
      : [];

  const hasExtras = !!record.full_quote || sources.length > 0;

  const truncatedQuote =
    record.full_quote && record.full_quote.length > 320
      ? record.full_quote.slice(0, 300).trimEnd() + "…"
      : record.full_quote;

  return (
    <article className="py-6 first:pt-2 border-b border-border last:border-b-0">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-4">
        {/* Identity — cols 1–4 */}
        <div className="md:col-span-4 flex items-start gap-4 min-w-0">
          <div className="portrait-frame w-14 h-14 shrink-0">
            {portraitSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portraitSrc}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="monogram text-base">
                {initials(record.name)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/candidate/${record.slug}`}
              className="font-display text-[19px] leading-[1.2] font-semibold text-text-primary hover:text-accent-primary transition-colors"
            >
              {record.name}
            </Link>
            <div className="mt-1.5 flex items-center flex-wrap gap-x-2 gap-y-1">
              <PartyBadge party={record.party} size="sm" />
              <span
                className="marginalia-label"
                style={{ margin: 0 }}
                aria-label={partyLabel(record.party)}
              >
                {stateName}
                <span className="mx-1" aria-hidden="true">·</span>
                {officeAbbr(record.office_sought, record.district)}
                {record.is_incumbent && (
                  <>
                    <span className="mx-1" aria-hidden="true">·</span>
                    <span className="text-accent-gold">Incumbent</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Stance — cols 5–6 */}
        <div className="md:col-span-2 flex md:flex-col md:items-start items-center gap-3 md:gap-1.5 md:pt-1">
          <StanceIndicator stance={record.stance} size="md" />
          <span
            className="text-[11px] font-semibold uppercase"
            style={{ letterSpacing: "0.08em", color: display.color }}
          >
            {display.label}
          </span>
        </div>

        {/* Evidence — cols 7–12 */}
        <div className="md:col-span-6 min-w-0">
          {record.summary ? (
            <p
              className="text-[14.5px] leading-[1.6] text-text-secondary"
              style={{ maxWidth: "58ch" }}
            >
              {record.summary}
            </p>
          ) : (
            <p className="marginalia">
              — no summary recorded for this position.
            </p>
          )}

          {hasExtras && (
            <details className="group mt-3">
              <summary
                className="list-none cursor-pointer inline-flex items-center gap-2 marginalia-label hover:text-accent-primary transition-colors"
                style={{ margin: 0 }}
              >
                <span className="group-open:hidden">
                  {sources.length > 1
                    ? `Read ${sources.length} citations`
                    : "Read full citation"}
                  <span aria-hidden="true"> ↓</span>
                </span>
                <span className="hidden group-open:inline">
                  Collapse
                  <span aria-hidden="true"> ↑</span>
                </span>
              </summary>

              <div className="mt-4 pl-4 border-l border-border-strong space-y-4">
                {record.full_quote && (
                  <blockquote
                    className="relative pl-7"
                    style={{ maxWidth: "58ch" }}
                  >
                    <span
                      aria-hidden="true"
                      className="quote-ornament absolute left-0 -top-1"
                    >
                      &ldquo;
                    </span>
                    <p className="font-display text-[15px] leading-[1.65] text-text-primary">
                      {truncatedQuote}
                    </p>
                  </blockquote>
                )}

                {sources.length > 0 && (
                  <ul className="space-y-2 m-0 p-0 list-none">
                    {sources.map((s, i) => {
                      const host = hostnameOf(s.url);
                      const typeLabel =
                        SOURCE_TYPE_LABELS[s.type] ?? s.type;
                      return (
                        <li key={`${s.url ?? "src"}-${i}`} className="leading-[1.55]">
                          <span
                            className="marginalia-label"
                            style={{
                              margin: 0,
                              display: "inline-block",
                              minWidth: "5.5rem",
                            }}
                          >
                            {typeLabel}
                          </span>
                          {s.url && host ? (
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="marginalia hover:text-accent-primary transition-colors break-all"
                              style={{
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                              }}
                              title={s.title ?? undefined}
                            >
                              {host}
                              <span aria-hidden="true"> →</span>
                            </a>
                          ) : (
                            <span className="marginalia ml-1">
                              — no link
                            </span>
                          )}
                          {s.title && (
                            <p
                              className="mt-0.5 text-[13px] text-text-secondary"
                              style={{ maxWidth: "58ch" }}
                            >
                              {s.title}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </article>
  );
}

/* ============================================================
   Main component
   ============================================================ */

export function IssueRoster({ data }: IssueRosterProps) {
  const { records } = data;

  // Controls — all stateful client-side
  const [stanceFilter, setStanceFilter] = useState<Stance | "all">("all");
  const [partyFilter, setPartyFilter] = useState<Party | "all">("all");
  const [stateFilter, setStateFilter] = useState<string>("all");
  const [hideNoMention, setHideNoMention] = useState(true);
  const [groupByStance, setGroupByStance] = useState(true);

  // Derive filter option lists + counts from raw data
  const stateOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const r of records) seen.add(r.state);
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [records]);

  // Which parties actually appear in the data (drives which pills render)
  const partiesPresentSet = useMemo(() => {
    const set = new Set<Party>();
    for (const r of records) set.add(r.party);
    return set;
  }, [records]);

  // Which stances actually appear (drives which stance pills render)
  const stancesPresent = useMemo(() => {
    const set = new Set<Stance>();
    for (const r of records) set.add(r.stance);
    return set;
  }, [records]);

  // Filter records in one pass
  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (hideNoMention && r.stance === "no_mention") return false;
      // "All" here means "all on record" — exclude unclear when no explicit
      // stance is chosen. Unclear remains a separately-selectable category.
      if (stanceFilter === "all" && r.stance === "unclear") return false;
      if (stanceFilter !== "all" && r.stance !== stanceFilter) return false;
      if (partyFilter !== "all" && r.party !== partyFilter) return false;
      if (stateFilter !== "all" && r.state !== stateFilter) return false;
      return true;
    });
  }, [records, stanceFilter, partyFilter, stateFilter, hideNoMention]);

  // Optional grouping
  const grouped = useMemo(() => {
    if (!groupByStance) return null;
    const map = new Map<Stance, IssuePositionRecord[]>();
    for (const r of filtered) {
      if (!map.has(r.stance)) map.set(r.stance, []);
      map.get(r.stance)!.push(r);
    }
    return STANCE_ORDER.filter((s) => map.has(s)).map((s) => ({
      stance: s,
      items: map.get(s)!,
    }));
  }, [filtered, groupByStance]);

  const filtersDirty =
    stanceFilter !== "all" ||
    partyFilter !== "all" ||
    stateFilter !== "all" ||
    !hideNoMention;

  return (
    <section aria-label="Candidate roster for this issue">
      {/* ============================================================
          Compact filter bar — stance on row 1, scope + toggles on row 2.
          "The Record" opener is inlined into the top-left of the bar.
         ============================================================ */}
      <div className="border-y border-border-strong py-3.5 mb-6">
        {/* Row 1 — label column + stance pills */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <p className="marginalia-label shrink-0" style={{ margin: 0, minWidth: "5.5rem" }}>
            The Record
          </p>
          <div className="flex flex-wrap gap-1.5 items-center">
            <FilterPill
              active={stanceFilter === "all"}
              onClick={() => setStanceFilter("all")}
            >
              All on record
            </FilterPill>
            {STANCE_FILTER_OPTIONS.map((s) => {
              const display = STANCE_DISPLAY[s];
              const present = stancesPresent.has(s);
              return (
                <FilterPill
                  key={s}
                  active={stanceFilter === s}
                  onClick={() => setStanceFilter(s)}
                  accent={display.color}
                  disabled={!present}
                  disabledTitle={`No candidates currently tracked as ${display.label}`}
                >
                  {display.label}
                </FilterPill>
              );
            })}
          </div>
        </div>

        {/* Row 2 — scope filters + toggles + count, on a single row at desktop */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <p className="marginalia-label shrink-0" style={{ margin: 0, minWidth: "5.5rem" }}>
            Scope
          </p>

          {/* Party — show the standard D / R always; minor parties only when present */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <FilterPill
              active={partyFilter === "all"}
              onClick={() => setPartyFilter("all")}
            >
              All parties
            </FilterPill>
            {PARTY_ORDER.map((p) => {
              const present = partiesPresentSet.has(p);
              // Always show the major parties (D, R) for taxonomic consistency.
              // Minor parties (I, L, G) only appear when they have records.
              const isMajor = p === "D" || p === "R";
              if (!isMajor && !present) return null;
              return (
                <FilterPill
                  key={p}
                  active={partyFilter === p}
                  onClick={() => setPartyFilter(p)}
                  disabled={!present}
                  disabledTitle={`No ${partyLabel(p)} candidates tracked on this issue`}
                >
                  {partyLabel(p)}
                </FilterPill>
              );
            })}
          </div>

          {/* State */}
          {stateOptions.length > 1 && (
            <div className="relative inline-block">
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="appearance-none bg-bg-surface border border-border rounded-sm pl-3 pr-8 py-1.5 marginalia-label focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-1 hover:bg-bg-elevated hover:border-border-strong transition-colors cursor-pointer"
                style={{ margin: 0 }}
                aria-label="Filter by state"
              >
                <option value="all">All states</option>
                {stateOptions.map((s) => (
                  <option key={s} value={s}>
                    {STATE_MAP[s] ?? s}
                  </option>
                ))}
              </select>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}
              >
                ▾
              </span>
            </div>
          )}

          {/* Toggles — right-aligned on desktop */}
          <div className="md:ml-auto flex flex-wrap items-center gap-x-5 gap-y-2">
            <ToggleSwitch
              checked={hideNoMention}
              onChange={setHideNoMention}
              label="Hide no mention"
            />
            <ToggleSwitch
              checked={groupByStance}
              onChange={setGroupByStance}
              label="Group"
            />
          </div>
        </div>

        {/* Count strip */}
        <p className="marginalia mt-3" style={{ margin: "0.75rem 0 0" }}>
          Showing{" "}
          <span className="font-mono tabular-nums text-text-primary font-semibold">
            {filtered.length}
          </span>{" "}
          of {records.length}
          {filtersDirty && (
            <button
              type="button"
              onClick={() => {
                setStanceFilter("all");
                setPartyFilter("all");
                setStateFilter("all");
                setHideNoMention(true);
              }}
              className="ml-3 marginalia-label hover:text-accent-primary transition-colors underline underline-offset-2"
              style={{ margin: 0 }}
            >
              Reset filters
            </button>
          )}
        </p>
      </div>

      {/* ============================================================
          Body
         ============================================================ */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center border border-border rounded-sm">
          <p className="font-display text-xl text-text-secondary">
            No candidates match the current filter.
          </p>
          <p className="marginalia mt-3">
            Try widening the stance, party, or state selection
          </p>
        </div>
      ) : groupByStance && grouped ? (
        <div>
          {grouped.map((group) => {
            const display = STANCE_DISPLAY[group.stance];
            return (
              <section key={group.stance} className="mb-12 last:mb-0">
                <header className="flex items-baseline gap-4 mb-4">
                  <StanceIndicator stance={group.stance} size="md" />
                  <h3
                    className="font-display text-[24px] font-bold leading-none"
                    style={{ color: display.color }}
                  >
                    {display.label}
                  </h3>
                  <span className="leader-fill" aria-hidden="true" />
                  <span className="font-mono text-sm text-text-muted tabular-nums">
                    {group.items.length}
                  </span>
                </header>
                <div>
                  {group.items.map((record) => (
                    <RecordCard
                      key={record.candidate_id}
                      record={record}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div>
          {filtered.map((record) => (
            <RecordCard key={record.candidate_id} record={record} />
          ))}
        </div>
      )}
    </section>
  );
}
