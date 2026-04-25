"use client";

import type { PositionSource, PositionWithIssue } from "@/types/domain";
import { STANCE_DISPLAY, CONFIDENCE_DISPLAY } from "@/lib/utils/stance";
import { useAppStore } from "@/stores/appStore";
import { ToggleSwitch } from "@/components/shared/ToggleSwitch";

interface PositionGridProps {
  positions: PositionWithIssue[];
}

function hostnameOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
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

function PrimarySource({
  sources,
  legacySingleUrl,
}: {
  sources: PositionSource[];
  legacySingleUrl?: string | null;
}) {
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

  const first = list[0];
  const typeLabel = SOURCE_TYPE_LABELS[first.type] ?? first.type;
  const host = hostnameOf(first.url);
  const more = list.length - 1;

  return (
    <p className="position-source">
      <span className="position-source-label">Source:</span>{" "}
      {first.url ? (
        <a
          href={first.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent-primary transition-colors underline-offset-2 hover:underline"
        >
          {typeLabel}
          {host ? ` — ${host}` : ""}
        </a>
      ) : (
        <span>{typeLabel}</span>
      )}
      {more > 0 && (
        <span className="text-text-muted">
          {" "}
          · +{more} more
        </span>
      )}
    </p>
  );
}

function PositionRow({ position }: { position: PositionWithIssue }) {
  const stanceDisplay = STANCE_DISPLAY[position.stance];
  const confidence = position.confidence;
  const confidenceLabel = CONFIDENCE_DISPLAY[confidence].label;
  const sources = position.sources ?? [];

  const note =
    position.summary ||
    (position.full_quote
      ? position.full_quote.length > 260
        ? position.full_quote.slice(0, 240).trimEnd() + "…"
        : position.full_quote
      : null);

  return (
    <article className="position-row" data-stance={position.stance}>
      {/* Left column — issue name + description */}
      <div>
        <h3 className="position-issue-name">{position.issue.display_name}</h3>
        <p className="position-issue-desc">{position.issue.description}</p>
      </div>

      {/* Right column — stance + confidence + note + source */}
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="stance-mark" data-stance={position.stance}>
            {stanceDisplay.label}
          </span>
          <span
            className="confidence-dot"
            data-level={confidence}
            aria-label={confidenceLabel}
          >
            {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
          </span>
        </div>

        {note && <p className="position-note">{note}</p>}

        <PrimarySource
          sources={sources}
          legacySingleUrl={position.source_url}
        />
      </div>
    </article>
  );
}

export function PositionGrid({ positions }: PositionGridProps) {
  const hideNoMention = useAppStore((s) => s.hideNoMention);
  const toggleHideNoMention = useAppStore((s) => s.toggleHideNoMention);

  const filtered = hideNoMention
    ? positions.filter((p) => p.stance !== "no_mention")
    : positions;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-text-muted">
          {filtered.length} position{filtered.length === 1 ? "" : "s"} on record
        </p>
        <ToggleSwitch
          checked={hideNoMention}
          onChange={toggleHideNoMention}
          label='Hide "No Mention" entries'
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-14 text-center">
          <p className="font-display text-lg text-text-secondary">
            No recorded positions on tracked AI issues.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((position) => (
            <PositionRow key={position.id} position={position} />
          ))}
        </div>
      )}
    </div>
  );
}

/* Overview bar — rendered at top of candidate page, above PositionGrid.
   Exposed as a named export so the server page can render it statically. */
export function PositionOverview({ positions }: { positions: PositionWithIssue[] }) {
  if (positions.length === 0) return null;

  return (
    <div className="overview-bar">
      {positions.map((p) => {
        const stanceDisplay = STANCE_DISPLAY[p.stance];
        return (
          <div key={p.id} className="overview-cell">
            <span className="overview-cell-label">
              {p.issue.display_name}
            </span>
            <span className="stance-mark" data-stance={p.stance}>
              {stanceDisplay.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
