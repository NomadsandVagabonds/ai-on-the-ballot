"use client";

import { useState } from "react";
import type { PositionWithIssue } from "@/types/domain";
import { StanceIndicator } from "@/components/shared/StanceIndicator";
import { ConfidenceBadge } from "@/components/shared/ConfidenceBadge";
import { QuoteCard } from "@/components/candidate/QuoteCard";
import { useAppStore } from "@/stores/appStore";
import { ToggleSwitch } from "@/components/shared/ToggleSwitch";

interface PositionGridProps {
  positions: PositionWithIssue[];
}

export function PositionGrid({ positions }: PositionGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const hideNoMention = useAppStore((s) => s.hideNoMention);
  const toggleHideNoMention = useAppStore((s) => s.toggleHideNoMention);

  const filtered = hideNoMention
    ? positions.filter((p) => p.stance !== "no_mention")
    : positions;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-text-primary">
          Positions on AI Issues
        </h3>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((position) => {
            const isExpanded = expandedId === position.id;

            return (
              <div
                key={position.id}
                className="bg-bg-surface border border-border rounded-lg overflow-hidden transition-shadow hover:shadow-[var(--shadow-md)]"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : position.id)
                  }
                  className="w-full text-left px-4 py-3 flex items-start justify-between gap-3"
                  aria-expanded={isExpanded}
                >
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {position.issue.display_name}
                    </p>
                    <StanceIndicator stance={position.stance} size="sm" />
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <ConfidenceBadge confidence={position.confidence} />
                    <svg
                      className={`h-4 w-4 text-text-muted transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-border pt-3 space-y-3">
                    {position.summary && (
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {position.summary}
                      </p>
                    )}

                    {position.full_quote && (
                      <QuoteCard
                        quote={position.full_quote}
                        source={null}
                        sourceUrl={position.source_url}
                        date={position.date_recorded}
                      />
                    )}

                    {position.source_url && !position.full_quote && (
                      <a
                        href={position.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-accent-primary hover:underline"
                      >
                        View source
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          />
                        </svg>
                      </a>
                    )}

                    {position.date_recorded && (
                      <p className="text-xs text-text-muted font-mono">
                        Recorded{" "}
                        {new Date(position.date_recorded).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
