"use client";

import { useState } from "react";
import type { CandidateSummary, ComparisonRow } from "@/types/domain";
import { PartyBadge } from "@/components/shared/PartyBadge";
import { ToggleSwitch } from "@/components/shared/ToggleSwitch";
import { useAppStore } from "@/stores/appStore";
import { resolveCandidatePhoto } from "@/lib/utils/portrait";
import { STANCE_DISPLAY } from "@/lib/utils/stance";

interface ComparisonGridProps {
  candidates: CandidateSummary[];
  comparisonData: ComparisonRow[];
}

/* ============================================================
   Helpers
   ============================================================ */

const ROMAN = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
] as const;

function roman(i: number): string {
  return ROMAN[i] ?? String(i + 1);
}

/** Trim a summary to an editorial micro-phrase (≤ words). */
function microSummary(summary: string | null, words = 7): string | null {
  if (!summary) return null;
  // Prefer first clause up to a comma, semicolon, em dash, or period.
  const firstClause = summary.split(/[,;—.]/)[0].trim();
  const tokens = firstClause.split(/\s+/);
  if (tokens.length <= words) return firstClause;
  return tokens.slice(0, words).join(" ") + "…";
}

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

/* ============================================================
   Candidate column header — square portrait, Crimson name,
   party + mono sub-line
   ============================================================ */

function CandidateHeader({ candidate }: { candidate: CandidateSummary }) {
  const subLine = [
    candidate.district ? `DIST ${candidate.district}` : null,
    candidate.is_incumbent ? "INCUMBENT" : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const portraitSrc = resolveCandidatePhoto(candidate);
  return (
    <div className="flex flex-col items-center gap-3 px-2 pb-4 text-center">
      <div className="portrait-frame w-16 h-16">
        {portraitSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={portraitSrc}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="monogram text-lg">{initials(candidate.name)}</span>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-display text-[17px] font-semibold leading-[1.1] text-text-primary">
          {candidate.name}
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <PartyBadge party={candidate.party} size="sm" />
          {subLine && (
            <span className="marginalia-label" style={{ margin: 0 }}>
              {subLine}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Desktop — CSS grid matrix (no <table>)
   ============================================================ */

function DesktopMatrix({
  candidates,
  rows,
}: {
  candidates: CandidateSummary[];
  rows: ComparisonRow[];
}) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const n = candidates.length;

  const gridTemplate = {
    gridTemplateColumns: `minmax(15rem, 1.3fr) repeat(${n}, minmax(9rem, 1fr))`,
  } as const;

  return (
    <div role="table" aria-label="Candidate positions by issue">
      {/* Header row */}
      <div
        role="row"
        className="grid items-end border-b border-border-strong pb-1"
        style={gridTemplate}
      >
        <div role="columnheader" className="px-4 pb-4">
          <span className="marginalia-label">Issue</span>
        </div>
        {candidates.map((c) => (
          <div
            key={c.id}
            role="columnheader"
            className="border-l border-border"
          >
            <CandidateHeader candidate={c} />
          </div>
        ))}
      </div>

      {/* Body rows */}
      <div role="rowgroup">
        {rows.map((row, i) => {
          const isExpanded = expandedIssue === row.issue.id;
          const isLast = i === rows.length - 1;
          const isBaselineRow = (i + 1) % 5 === 0 && !isLast;

          return (
            <div
              key={row.issue.id}
              role="row"
              className={`grid items-stretch border-b ${
                isBaselineRow ? "border-dotted" : "border-solid"
              } border-border hover:bg-bg-elevated/30 transition-colors`}
              style={gridTemplate}
            >
              {/* Issue cell — folio + name + always-visible description */}
              <div role="cell" className="px-4 py-5 pr-6">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedIssue(isExpanded ? null : row.issue.id)
                  }
                  aria-expanded={isExpanded}
                  aria-controls={`issue-expand-${row.issue.id}`}
                  className="group w-full text-left"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="folio text-xs shrink-0 pt-0.5">
                      {roman(i)}.
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-[17px] leading-[1.3] font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                        {row.issue.display_name}
                      </h3>
                      {row.issue.description && (
                        <p className="mt-1.5 text-[13px] leading-[1.5] text-text-secondary">
                          {row.issue.description}
                        </p>
                      )}
                      <span
                        className="mt-2 inline-block marginalia"
                        style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}
                      >
                        {isExpanded ? "Collapse ↑" : "Expand quotes ↓"}
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Stance cells */}
              {row.positions.map((pos, ci) => (
                <div
                  key={pos.candidate_id}
                  role="cell"
                  className="px-4 py-5 border-l border-border flex flex-col items-center gap-1.5 text-center"
                >
                  <span
                    className="stance-mark"
                    data-stance={pos.stance}
                  >
                    {STANCE_DISPLAY[pos.stance].label}
                  </span>
                  {microSummary(pos.summary) && (
                    <p className="mt-1 text-[12.5px] leading-[1.45] text-text-secondary max-w-[18ch]">
                      {microSummary(pos.summary)}
                    </p>
                  )}
                  {/* Invisible spacer to keep column widths even when only some have summaries */}
                  {ci === -1 && null}
                </div>
              ))}

              {/* Expanded full-row content — pull quotes per candidate */}
              {isExpanded && (
                <div
                  id={`issue-expand-${row.issue.id}`}
                  className="col-span-full bg-bg-elevated/40 border-t border-border -mt-px"
                  style={{ gridColumn: "1 / -1" }}
                >
                  <div
                    className="grid gap-x-4 px-4 py-6"
                    style={{
                      gridTemplateColumns: `minmax(15rem, 1.3fr) repeat(${n}, minmax(9rem, 1fr))`,
                    }}
                  >
                    <div className="pr-4">
                      <p className="kicker-muted mb-2">On the record</p>
                      <p className="font-display italic text-[15px] leading-[1.55] text-text-secondary">
                        {row.issue.description ||
                          "Candidate positions on this issue, drawn from the public record."}
                      </p>
                    </div>
                    {row.positions.map((pos) => {
                      // Prefer multi-source list; fall back to legacy single URL
                      const sources =
                        pos.sources && pos.sources.length > 0
                          ? pos.sources
                          : pos.source_url
                            ? [
                                {
                                  type: "statement" as const,
                                  title: null,
                                  url: pos.source_url,
                                  date: null,
                                  excerpt: null,
                                },
                              ]
                            : [];
                      return (
                        <div
                          key={pos.candidate_id}
                          className="border-l border-border pl-4"
                        >
                          {pos.summary ? (
                            <blockquote className="relative pl-5 hanging-quote">
                              <span
                                className="quote-ornament absolute -left-1 -top-2"
                                aria-hidden="true"
                              >
                                &ldquo;
                              </span>
                              <p className="font-display italic text-[14.5px] leading-[1.55] text-text-primary">
                                {pos.summary}
                              </p>
                            </blockquote>
                          ) : (
                            <p className="marginalia">— no summary recorded</p>
                          )}
                          {sources.length > 0 && (
                            <ul
                              className="mt-3 space-y-1.5 m-0 p-0 list-none"
                              style={{ marginTop: "0.75rem" }}
                            >
                              {sources.map((s, i) => {
                                const host = hostnameOf(s.url);
                                const typeLabel =
                                  SOURCE_TYPE_LABELS[s.type] ?? s.type;
                                return (
                                  <li
                                    key={`${s.url ?? "src"}-${i}`}
                                    className="leading-[1.45]"
                                  >
                                    <span
                                      className="marginalia-label"
                                      style={{ margin: 0, display: "inline" }}
                                    >
                                      {typeLabel}
                                    </span>
                                    {s.url && host && (
                                      <>
                                        {" "}
                                        <a
                                          href={s.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="marginalia hover:text-accent-primary transition-colors break-all"
                                          style={{
                                            textTransform: "uppercase",
                                            letterSpacing: "0.08em",
                                          }}
                                        >
                                          {host}
                                          <span aria-hidden="true"> →</span>
                                        </a>
                                      </>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   Mobile — per-candidate dispatch cards
   ============================================================ */

function MobileDispatches({
  candidates,
  rows,
}: {
  candidates: CandidateSummary[];
  rows: ComparisonRow[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const active = candidates[activeIndex];

  return (
    <div>
      {/* Candidate pager — rule-bordered pill bar */}
      <div className="flex items-stretch border border-border rounded-sm overflow-hidden mb-6">
        {candidates.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setActiveIndex(i);
              setExpandedIssue(null);
            }}
            aria-pressed={i === activeIndex}
            className={`flex-1 min-w-0 px-3 py-2.5 text-center truncate transition-colors border-l first:border-l-0 border-border ${
              i === activeIndex
                ? "bg-accent-primary text-white"
                : "bg-bg-surface text-text-secondary hover:bg-bg-elevated"
            }`}
          >
            <span className="font-display text-sm font-semibold">
              {c.name.split(" ").slice(-1)[0]}
            </span>
          </button>
        ))}
      </div>

      {/* Active candidate masthead */}
      <div className="flex items-center gap-4 pb-5 border-b border-border-strong">
        <div className="portrait-frame w-14 h-14 shrink-0">
          {(() => {
            const src = resolveCandidatePhoto(active);
            return src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="monogram text-base">
                {initials(active.name)}
              </span>
            );
          })()}
        </div>
        <div>
          <p className="kicker-muted mb-1">
            {active.district ? `Dist. ${active.district}` : active.office_sought}
            {active.is_incumbent && " · Incumbent"}
          </p>
          <p className="font-display text-lg font-semibold leading-tight text-text-primary">
            {active.name}
          </p>
          <div className="mt-1.5">
            <PartyBadge party={active.party} size="sm" />
          </div>
        </div>
      </div>

      {/* Issue dispatches */}
      <ul className="divide-y divide-border">
        {rows.map((row, i) => {
          const pos = row.positions.find((p) => p.candidate_id === active.id);
          if (!pos) return null;
          const isExpanded = expandedIssue === row.issue.id;
          const host = hostnameOf(pos.source_url);

          return (
            <li key={row.issue.id} className="py-5">
              <button
                type="button"
                onClick={() =>
                  setExpandedIssue(isExpanded ? null : row.issue.id)
                }
                aria-expanded={isExpanded}
                className="w-full text-left"
              >
                <div className="flex items-baseline gap-3">
                  <span className="folio text-[11px] shrink-0 pt-0.5">
                    {roman(i)}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base font-semibold leading-snug text-text-primary">
                      {row.issue.display_name}
                    </h3>
                    <div className="mt-2">
                      <span
                        className="stance-mark"
                        data-stance={pos.stance}
                      >
                        {STANCE_DISPLAY[pos.stance].label}
                      </span>
                    </div>
                    {microSummary(pos.summary) && (
                      <p className="mt-2 text-[13px] leading-[1.5] text-text-secondary">
                        {microSummary(pos.summary)}
                      </p>
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && pos.summary && (
                <div className="mt-3 ml-6 pl-4 border-l-2 border-accent-gold/50">
                  <p className="font-display italic text-sm leading-relaxed text-text-primary">
                    &ldquo;{pos.summary}&rdquo;
                  </p>
                  {host && pos.source_url && (
                    <a
                      href={pos.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 marginalia-label hover:text-accent-primary transition-colors"
                      style={{ margin: "0.5rem 0 0" }}
                    >
                      Source: {host}
                      <span aria-hidden="true">→</span>
                    </a>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ============================================================
   Public component
   ============================================================ */

export function ComparisonGrid({
  candidates,
  comparisonData,
}: ComparisonGridProps) {
  const hideNoMention = useAppStore((s) => s.hideNoMention);
  const toggleHideNoMention = useAppStore((s) => s.toggleHideNoMention);

  const filteredRows = hideNoMention
    ? comparisonData.filter((row) =>
        row.positions.some((p) => p.stance !== "no_mention")
      )
    : comparisonData;

  return (
    <section aria-label="Comparison matrix">
      {/* Matrix toolbar — mono label + rule */}
      <div className="flex items-center justify-between mb-5">
        <p className="kicker-muted">
          {filteredRows.length} issue
          {filteredRows.length === 1 ? "" : "s"}
        </p>
        <ToggleSwitch
          checked={hideNoMention}
          onChange={toggleHideNoMention}
          label="Hide no mention"
        />
      </div>

      {filteredRows.length === 0 ? (
        <div className="py-16 text-center border border-border rounded-sm">
          <p className="font-display italic text-xl text-text-secondary">
            No position data available for this race yet.
          </p>
          <p className="marginalia mt-3">Check back as we expand coverage</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <DesktopMatrix candidates={candidates} rows={filteredRows} />
          </div>
          <div className="md:hidden">
            <MobileDispatches candidates={candidates} rows={filteredRows} />
          </div>
        </>
      )}
    </section>
  );
}
