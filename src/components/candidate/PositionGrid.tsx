"use client";

import { useState } from "react";
import type { PositionWithIssue } from "@/types/domain";
import { STANCE_DISPLAY, CONFIDENCE_DISPLAY } from "@/lib/utils/stance";
import { useAppStore } from "@/stores/appStore";
import { ToggleSwitch } from "@/components/shared/ToggleSwitch";

interface PositionGridProps {
  positions: PositionWithIssue[];
}

function PositionRow({ position, index }: { position: PositionWithIssue; index: number }) {
  const [showFullQuote, setShowFullQuote] = useState(false);
  const display = STANCE_DISPLAY[position.stance];
  const confidenceDisplay = CONFIDENCE_DISPLAY[position.confidence];
  const isLongQuote = position.full_quote && position.full_quote.length > 200;

  return (
    <div className="py-6 first:pt-0">
      {/* Issue number + name + stance — editorial layout */}
      <div className="flex items-baseline gap-x-3 mb-2">
        <span className="font-mono text-xs text-text-muted tabular-nums shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 className="text-base font-semibold text-text-primary leading-snug">
            {position.issue.display_name}
          </h3>
          <span className="text-sm font-bold" style={{ color: display.color }}>
            {display.label}
          </span>
          <span className="text-xs text-text-muted">
            {confidenceDisplay.label.toLowerCase()}
          </span>
        </div>
      </div>

      {/* Summary — always visible, indented to align with text above */}
      <div className="ml-8">
        {position.summary && (
          <p className="text-sm text-text-secondary leading-relaxed max-w-prose">
            {position.summary}
          </p>
        )}

        {/* Source + date */}
        <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
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

        {/* Full quote */}
        {position.full_quote && (
          <div className="mt-3">
            {isLongQuote && !showFullQuote ? (
              <>
                <blockquote className="pl-4 border-l-2 border-border-strong py-1">
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
              <blockquote className="pl-4 border-l-2 border-border-strong py-1">
                <p className="font-display text-sm italic text-text-secondary leading-relaxed">
                  &ldquo;{position.full_quote}&rdquo;
                </p>
              </blockquote>
            )}
          </div>
        )}
      </div>
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
        <div className="divide-y divide-border">
          {filtered.map((position, i) => (
            <PositionRow key={position.id} position={position} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
