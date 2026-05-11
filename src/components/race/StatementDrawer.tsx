"use client";

import { useEffect } from "react";
import type { CandidateSummary } from "@/types/domain";
import type { IssueRow } from "@/types/database";
import { PartyBadge } from "@/components/shared/PartyBadge";
import { STANCE_DISPLAY } from "@/lib/utils/stance";
import type { Stance } from "@/types/database";

/** Minimal shape the drawer reads from. Loose enough to accept both
 * candidate-page positions (rich, with full_quote) and comparison-row
 * positions (lean, no full_quote / issue_id). Optional fields default
 * to "absent." */
export interface DrawerPosition {
  candidate_id: string;
  stance: string;
  confidence?: string | null;
  summary?: string | null;
  full_quote?: string | null;
  source_url?: string | null;
  sources?: Array<{
    type: string;
    title: string | null;
    url: string | null;
    date: string | null;
    excerpt: string | null;
  }>;
}

export interface DrawerContent {
  candidate: CandidateSummary;
  issue: IssueRow;
  position: DrawerPosition;
}

interface StatementDrawerProps {
  content: DrawerContent | null;
  onClose: () => void;
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  statement: "Statement",
  legislation: "Legislation",
  survey: "Survey",
  social_media: "Social Media",
  news: "News",
};

function hostnameOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function StatementDrawer({ content, onClose }: StatementDrawerProps) {
  // Trap Esc, lock body scroll while open
  useEffect(() => {
    if (!content) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [content, onClose]);

  const open = !!content;

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden={!open}
        onClick={open ? onClose : undefined}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[28rem] md:w-[32rem] bg-bg-surface border-l border-border shadow-2xl transition-transform duration-200 ease-out flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {content && <DrawerBody content={content} onClose={onClose} />}
      </aside>
    </>
  );
}

function DrawerBody({
  content,
  onClose,
}: {
  content: DrawerContent;
  onClose: () => void;
}) {
  const { candidate, issue, position } = content;
  const stanceLabel =
    STANCE_DISPLAY[position.stance as Stance]?.label ?? position.stance;

  // Build a unified source list. Prefer position.sources[] if present;
  // otherwise fall back to source_url alone.
  const sources =
    "sources" in position && position.sources && position.sources.length > 0
      ? position.sources
      : position.source_url
        ? [
            {
              type: "statement",
              title: null,
              url: position.source_url,
              date: null,
              excerpt: null,
            },
          ]
        : [];

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-border">
        <div className="min-w-0">
          <p className="kicker-muted mb-1">
            {candidate.district ? `Dist. ${candidate.district}` : candidate.office_sought}
            {candidate.is_incumbent && " · Incumbent"}
          </p>
          <p className="font-display text-xl font-semibold leading-tight text-text-primary truncate">
            {candidate.name}
          </p>
          <div className="mt-1.5">
            <PartyBadge party={candidate.party} size="sm" />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-sm text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        <section>
          <p className="kicker-muted mb-2">Issue</p>
          <h2 className="font-display text-lg font-semibold leading-snug text-text-primary">
            {issue.display_name}
          </h2>
          {issue.description && (
            <p className="mt-2 text-[13.5px] leading-[1.55] text-text-secondary">
              {issue.description}
            </p>
          )}
        </section>

        <section>
          <p className="kicker-muted mb-2">Stance</p>
          <span className="stance-mark" data-stance={position.stance}>
            {stanceLabel}
          </span>
          {position.confidence && position.confidence !== "medium" && (
            <span className="ml-2 text-[12px] text-text-muted uppercase tracking-wider">
              {position.confidence} confidence
            </span>
          )}
        </section>

        {position.summary && (
          <section>
            <p className="kicker-muted mb-2">Summary</p>
            <p className="text-[14.5px] leading-[1.6] text-text-secondary whitespace-pre-line">
              {position.summary}
            </p>
          </section>
        )}

        {position.full_quote && (
          <section>
            <p className="kicker-muted mb-2">Quote</p>
            <blockquote className="border-l-2 border-accent-primary/60 pl-4 italic text-[14px] leading-[1.6] text-text-secondary">
              {position.full_quote}
            </blockquote>
          </section>
        )}

        {sources.length > 0 && (
          <section>
            <p className="kicker-muted mb-3">
              {sources.length === 1 ? "Source" : `Sources (${sources.length})`}
            </p>
            <ul className="space-y-3">
              {sources.map((src, i) => {
                const typeLabel = SOURCE_TYPE_LABELS[src.type] ?? src.type;
                const host = hostnameOf(src.url);
                const dateLabel = formatDate(src.date);
                return (
                  <li
                    key={i}
                    className="rounded-sm border border-border bg-bg-elevated/40 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-wider text-text-muted">
                      <span className="font-semibold">{typeLabel}</span>
                      {dateLabel && <span>{dateLabel}</span>}
                    </div>
                    {src.title && (
                      <p className="mt-1.5 text-[13.5px] leading-[1.45] text-text-primary">
                        {src.title}
                      </p>
                    )}
                    {src.excerpt && (
                      <p className="mt-1.5 text-[12.5px] leading-[1.5] italic text-text-secondary">
                        “{src.excerpt}”
                      </p>
                    )}
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-[12px] text-accent-primary hover:text-accent-primary-hover hover:underline underline-offset-2 break-all"
                      >
                        {host ?? src.url}
                        <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {!position.summary &&
          !position.full_quote &&
          sources.length === 0 && (
            <p className="text-sm text-text-muted italic">
              No further detail recorded for this position.
            </p>
          )}
      </div>
    </>
  );
}
