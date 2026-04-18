"use client";

import type { PositionSource, PositionWithIssue } from "@/types/domain";
import { STANCE_DISPLAY, CONFIDENCE_DISPLAY } from "@/lib/utils/stance";
import { StanceIndicator } from "@/components/shared/StanceIndicator";
import { useAppStore } from "@/stores/appStore";
import { ToggleSwitch } from "@/components/shared/ToggleSwitch";

interface PositionGridProps {
  positions: PositionWithIssue[];
}

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
];

function roman(i: number): string {
  return ROMAN[i] ?? String(i + 1);
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

/** Render a list of citations (type + linked host). Used in the marginalia
 *  rail and mobile stack on each position row. */
function SourceList({
  sources,
  legacySingleUrl,
}: {
  sources: PositionSource[];
  /** Back-compat: if the position has no `sources` yet (live Supabase path),
   *  fall back to rendering the single `source_url` if set. */
  legacySingleUrl?: string | null;
}) {
  // Normalize — prefer sources array; fall back to the legacy single URL.
  const list: PositionSource[] = sources.length
    ? sources
    : legacySingleUrl
      ? [
          {
            type: "statement",
            title: null,
            url: legacySingleUrl,
            date: null,
            excerpt: null,
          },
        ]
      : [];

  if (list.length === 0) return null;

  return (
    <dd className="space-y-2">
      {list.map((s, i) => {
        const host = hostnameOf(s.url);
        const typeLabel = SOURCE_TYPE_LABELS[s.type] ?? s.type;
        return (
          <div key={`${s.url ?? "src"}-${i}`} className="leading-[1.45]">
            <span
              className="marginalia-label"
              style={{ margin: 0, display: "inline" }}
            >
              {typeLabel}
            </span>
            {s.url && host ? (
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
                  title={s.title ?? undefined}
                >
                  {host}
                  <span aria-hidden="true"> →</span>
                </a>
              </>
            ) : (
              <span className="marginalia ml-1 italic">— no link</span>
            )}
          </div>
        );
      })}
    </dd>
  );
}

/* ============================================================
   Position row — [folio] [main] [marginalia]
   ============================================================ */

function PositionRow({
  position,
  index,
}: {
  position: PositionWithIssue;
  index: number;
}) {
  const stanceDisplay = STANCE_DISPLAY[position.stance];
  const confidence = position.confidence;
  const confidenceLabel = CONFIDENCE_DISPLAY[confidence].label;
  const sources = position.sources ?? [];
  const hasAnySource = sources.length > 0 || !!position.source_url;
  const isLongQuote =
    !!position.full_quote && position.full_quote.length > 240;
  const quoteInline =
    position.full_quote && !isLongQuote
      ? position.full_quote
      : position.full_quote
        ? position.full_quote.slice(0, 220).trimEnd() + "…"
        : null;

  const recordedMonth = position.date_recorded
    ? new Date(position.date_recorded).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      })
    : null;

  return (
    <article
      className="grid gap-x-6 py-8 first:pt-4 border-b border-border last:border-b-0"
      style={{
        gridTemplateColumns:
          "minmax(0, 3.5rem) minmax(0, 1fr) minmax(0, 14rem)",
      }}
    >
      {/* Folio — Roman numeral, Crimson, right-aligned */}
      <div className="text-right">
        <span
          className="font-display text-[28px] leading-none font-normal text-text-muted"
          aria-hidden="true"
        >
          {roman(index)}
        </span>
      </div>

      {/* Main column — issue name, stance, summary, hanging quote */}
      <div className="min-w-0">
        <h3 className="font-display text-[22px] leading-[1.25] font-semibold text-text-primary">
          {position.issue.display_name}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <StanceIndicator stance={position.stance} size="md" />
          <span
            className="text-[11px] font-mono uppercase"
            style={{ letterSpacing: "0.15em", color: stanceDisplay.color }}
          >
            {stanceDisplay.label}
          </span>
        </div>

        {position.summary && (
          <p
            className="mt-4 text-[15.5px] leading-[1.65] text-text-secondary"
            style={{ maxWidth: "60ch" }}
          >
            {position.summary}
          </p>
        )}

        {position.full_quote && (
          <figure className="mt-5 relative pl-8" style={{ maxWidth: "62ch" }}>
            <span
              className="quote-ornament absolute left-0 -top-1"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            {isLongQuote ? (
              <details className="group">
                <summary
                  className="cursor-pointer list-none"
                  aria-label="Expand full quote"
                >
                  <blockquote>
                    <p className="font-display italic text-[16px] leading-[1.6] text-text-primary">
                      {quoteInline}
                    </p>
                  </blockquote>
                  <span className="mt-2 inline-flex items-center gap-1 marginalia-label hover:text-accent-primary transition-colors" style={{ margin: "0.5rem 0 0" }}>
                    Read full quote <span aria-hidden="true">↓</span>
                  </span>
                </summary>
                <blockquote className="mt-1">
                  <p className="font-display italic text-[16px] leading-[1.6] text-text-primary">
                    &ldquo;{position.full_quote}&rdquo;
                  </p>
                </blockquote>
              </details>
            ) : (
              <blockquote>
                <p className="font-display italic text-[16px] leading-[1.6] text-text-primary">
                  {quoteInline}
                </p>
              </blockquote>
            )}
          </figure>
        )}

        {/* Mobile-only marginalia (stacks under main on narrow viewports) */}
        <dl className="md:hidden mt-5 pt-4 border-t border-dotted border-border-strong grid grid-cols-2 gap-y-3 gap-x-5">
          {hasAnySource && (
            <div className="col-span-2">
              <dt className="marginalia-label">
                {sources.length > 1 ? "Sources" : "Source"}
              </dt>
              <SourceList
                sources={sources}
                legacySingleUrl={position.source_url}
              />
            </div>
          )}
          {recordedMonth && (
            <div>
              <dt className="marginalia-label">Recorded</dt>
              <dd className="marginalia" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {recordedMonth}
              </dd>
            </div>
          )}
          <div>
            <dt className="marginalia-label">Confidence</dt>
            <dd className="mt-0.5 flex items-center gap-2">
              <span
                className="confidence-bars"
                data-level={confidence}
                aria-label={confidenceLabel}
              >
                <span />
                <span />
                <span />
              </span>
              <span className="marginalia" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {confidence}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {/* Marginalia rail — desktop only */}
      <div className="hidden md:block pl-5 border-l border-border">
        <dl className="space-y-4">
          {hasAnySource && (
            <div>
              <dt className="marginalia-label">
                {sources.length > 1 ? "Sources" : "Source"}
              </dt>
              <SourceList
                sources={sources}
                legacySingleUrl={position.source_url}
              />
            </div>
          )}
          {recordedMonth && (
            <div>
              <dt className="marginalia-label">Recorded</dt>
              <dd className="marginalia" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {recordedMonth}
              </dd>
            </div>
          )}
          <div>
            <dt className="marginalia-label">Confidence</dt>
            <dd className="mt-0.5 flex items-center gap-2">
              <span
                className="confidence-bars"
                data-level={confidence}
                aria-label={confidenceLabel}
              >
                <span />
                <span />
                <span />
              </span>
              <span className="marginalia" style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {confidence}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

/* ============================================================
   PositionGrid — thin client wrapper with the filter toggle
   ============================================================ */

export function PositionGrid({ positions }: PositionGridProps) {
  const hideNoMention = useAppStore((s) => s.hideNoMention);
  const toggleHideNoMention = useAppStore((s) => s.toggleHideNoMention);

  const filtered = hideNoMention
    ? positions.filter((p) => p.stance !== "no_mention")
    : positions;

  return (
    <div>
      <div className="flex items-center justify-between mb-2 mt-4">
        <p className="kicker-muted">
          {filtered.length} position{filtered.length === 1 ? "" : "s"} on record
        </p>
        <ToggleSwitch
          checked={hideNoMention}
          onChange={toggleHideNoMention}
          label="Hide no mention"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-14 text-center">
          <p className="font-display italic text-lg text-text-secondary">
            No recorded positions on tracked AI issues.
          </p>
        </div>
      ) : (
        <div>
          {filtered.map((position, i) => (
            <PositionRow key={position.id} position={position} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
