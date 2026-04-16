"use client";

import { useState } from "react";
import type { PositionWithIssue } from "@/types/domain";
import { STANCE_DISPLAY, CONFIDENCE_DISPLAY } from "@/lib/utils/stance";
import { useAppStore } from "@/stores/appStore";
import { ToggleSwitch } from "@/components/shared/ToggleSwitch";

interface PositionGridProps {
  positions: PositionWithIssue[];
}

/** Map stance to Tailwind border-l color class */
function stanceBorderClass(stance: string): string {
  switch (stance) {
    case "support":
      return "border-l-stance-support";
    case "oppose":
      return "border-l-stance-oppose";
    case "mixed":
      return "border-l-stance-mixed";
    case "unclear":
      return "border-l-stance-unclear";
    default:
      return "border-l-stance-no-mention";
  }
}

/** Map stance to a very faint background tint */
function stanceBgStyle(stance: string): React.CSSProperties {
  const display = STANCE_DISPLAY[stance as keyof typeof STANCE_DISPLAY];
  if (!display || stance === "no_mention") return {};
  // Use the color with very low opacity for a structural tint
  return { backgroundColor: display.bgColor };
}

function PositionRow({ position }: { position: PositionWithIssue }) {
  const [showFullQuote, setShowFullQuote] = useState(false);
  const display = STANCE_DISPLAY[position.stance];
  const confidenceDisplay = CONFIDENCE_DISPLAY[position.confidence];
  const isLongQuote = position.full_quote && position.full_quote.length > 200;

  return (
    <div
      className={`border-l-[4px] ${stanceBorderClass(position.stance)} pl-5 pr-5 py-5 md:pl-6 md:pr-6 md:py-6`}
      style={stanceBgStyle(position.stance)}
    >
      {/* Issue name + stance inline */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="text-base font-semibold text-text-primary leading-snug">
          {position.issue.display_name}
        </h3>
        <span className="text-sm font-bold" style={{ color: display.color }}>
          &mdash; {display.label}
        </span>
        <span className="text-xs text-text-muted">
          ({confidenceDisplay.label.toLowerCase()})
        </span>
      </div>

      {/* Summary — always visible */}
      {position.summary && (
        <p className="mt-2 text-sm text-text-secondary leading-relaxed max-w-prose">
          {position.summary}
        </p>
      )}

      {/* Source + date */}
      <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
        {position.source_url && (
          <a
            href={position.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-primary hover:underline hover:underline-offset-2"
          >
            Source
          </a>
        )}
        {position.source_url && position.date_recorded && (
          <span aria-hidden="true">&middot;</span>
        )}
        {position.date_recorded && (
          <time className="font-mono" dateTime={position.date_recorded}>
            {new Date(position.date_recorded).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
            })}
          </time>
        )}
      </div>

      {/* Full quote as pull-quote */}
      {position.full_quote && (
        <div className="mt-4">
          {isLongQuote && !showFullQuote ? (
            <>
              <blockquote
                className="border-l-2 border-accent-primary/30 pl-4 py-1"
              >
                <p className="font-display text-sm italic text-text-secondary leading-relaxed">
                  &ldquo;{position.full_quote.slice(0, 180)}&hellip;&rdquo;
                </p>
              </blockquote>
              <button
                type="button"
                onClick={() => setShowFullQuote(true)}
                className="mt-1.5 text-xs font-medium text-accent-primary hover:underline hover:underline-offset-2"
              >
                Read full quote
              </button>
            </>
          ) : (
            <blockquote
              className="border-l-2 border-accent-primary/30 pl-4 py-1"
            >
              <p className="font-display text-sm italic text-text-secondary leading-relaxed">
                &ldquo;{position.full_quote}&rdquo;
              </p>
            </blockquote>
          )}
        </div>
      )}
    </div>
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
      <div className="flex items-center justify-end mb-5">
        <ToggleSwitch
          checked={hideNoMention}
          onChange={toggleHideNoMention}
          label="Hide no mention"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-8 text-text-muted">
          No recorded positions on tracked AI issues.
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((position) => (
            <PositionRow key={position.id} position={position} />
          ))}
        </div>
      )}
    </div>
  );
}
