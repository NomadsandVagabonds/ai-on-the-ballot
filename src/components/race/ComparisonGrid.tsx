"use client";

import { useState } from "react";
import type { CandidateSummary, ComparisonRow } from "@/types/domain";
import { StanceIndicator } from "@/components/shared/StanceIndicator";
import { PartyBadge } from "@/components/shared/PartyBadge";
import { ToggleSwitch } from "@/components/shared/ToggleSwitch";
import { useAppStore } from "@/stores/appStore";

interface ComparisonGridProps {
  candidates: CandidateSummary[];
  comparisonData: ComparisonRow[];
}

function CandidateColumnHeader({ candidate }: { candidate: CandidateSummary }) {
  return (
    <div className="flex flex-col items-center gap-2 px-2 py-3">
      {candidate.photo_url ? (
        <img
          src={candidate.photo_url}
          alt={candidate.name}
          className="h-12 w-12 rounded-full object-cover"
        />
      ) : (
        <div className="h-12 w-12 rounded-full bg-bg-elevated flex items-center justify-center">
          <span className="font-display text-sm font-bold text-text-secondary">
            {candidate.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </span>
        </div>
      )}
      <div className="text-center">
        <p className="text-xs font-semibold text-text-primary leading-tight">
          {candidate.name}
        </p>
        <div className="mt-1">
          <PartyBadge party={candidate.party} size="sm" />
        </div>
      </div>
    </div>
  );
}

/** Desktop/tablet: side-by-side grid */
function DesktopGrid({
  candidates,
  rows,
}: {
  candidates: CandidateSummary[];
  rows: ComparisonRow[];
}) {
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th scope="col" className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3 border-b border-border w-48">
              Issue
            </th>
            {candidates.map((c) => (
              <th scope="col" key={c.id} className="border-b border-border min-w-[140px]">
                <CandidateColumnHeader candidate={c} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isExpanded = expandedIssue === row.issue.id;

            return (
              <tr key={row.issue.id} className="group">
                <td className="border-b border-border">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedIssue(isExpanded ? null : row.issue.id)
                    }
                    className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-bg-elevated/50 transition-colors"
                    aria-expanded={isExpanded}
                  >
                    <span className="text-sm font-medium text-text-primary">
                      {row.issue.display_name}
                    </span>
                    <svg
                      className={`h-3.5 w-3.5 text-text-muted shrink-0 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-3">
                      <p className="text-xs text-text-muted">
                        {row.issue.description}
                      </p>
                    </div>
                  )}
                </td>
                {row.positions.map((pos) => (
                  <td
                    key={pos.candidate_id}
                    className="border-b border-border px-4 py-3 text-center align-top"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <StanceIndicator stance={pos.stance} size="md" />
                    </div>
                    {isExpanded && pos.summary && (
                      <p className="mt-2 text-xs text-text-secondary text-left leading-relaxed">
                        {pos.summary}
                      </p>
                    )}
                    {isExpanded && pos.source_url && (
                      <a
                        href={pos.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-1 text-[10px] text-accent-primary hover:underline"
                      >
                        Source
                      </a>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Mobile: tabbed candidate view */
function MobileView({
  candidates,
  rows,
}: {
  candidates: CandidateSummary[];
  rows: ComparisonRow[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  const activeCandidate = candidates[activeIndex];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-border overflow-x-auto" role="tablist">
        {candidates.map((c, i) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            id={`candidate-tab-${c.id}`}
            aria-selected={i === activeIndex}
            aria-controls="candidate-tabpanel"
            onClick={() => {
              setActiveIndex(i);
              setExpandedIssue(null);
            }}
            className={`flex-1 min-w-0 px-3 py-2.5 text-center text-sm font-medium border-b-2 transition-colors ${
              i === activeIndex
                ? "border-accent-primary text-accent-primary"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            <span className="truncate block">{c.name}</span>
          </button>
        ))}
      </div>

      {/* Tab panel content */}
      <div
        id="candidate-tabpanel"
        role="tabpanel"
        aria-labelledby={`candidate-tab-${activeCandidate.id}`}
      >
      {/* Candidate info */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        {activeCandidate.photo_url ? (
          <img
            src={activeCandidate.photo_url}
            alt={activeCandidate.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-bg-elevated flex items-center justify-center">
            <span className="font-display text-xs font-bold text-text-secondary">
              {activeCandidate.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-text-primary">
            {activeCandidate.name}
          </p>
          <PartyBadge party={activeCandidate.party} size="sm" />
        </div>
      </div>

      {/* Issue list */}
      <div className="divide-y divide-border">
        {rows.map((row) => {
          const pos = row.positions.find(
            (p) => p.candidate_id === activeCandidate.id
          );
          if (!pos) return null;

          const isExpanded = expandedIssue === row.issue.id;

          return (
            <div key={row.issue.id}>
              <button
                type="button"
                onClick={() =>
                  setExpandedIssue(isExpanded ? null : row.issue.id)
                }
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-bg-elevated/50 transition-colors"
                aria-expanded={isExpanded}
              >
                <span className="text-sm font-medium text-text-primary">
                  {row.issue.display_name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <StanceIndicator stance={pos.stance} size="sm" />
                  <svg
                    className={`h-3.5 w-3.5 text-text-muted transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    aria-hidden="true"
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
                <div className="px-4 pb-3 space-y-2">
                  {pos.summary && (
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {pos.summary}
                    </p>
                  )}
                  {pos.source_url && (
                    <a
                      href={pos.source_url}
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
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}

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
    <div>
      <div className="flex items-center justify-end mb-4">
        <ToggleSwitch
          checked={hideNoMention}
          onChange={toggleHideNoMention}
          label="Hide no mention"
        />
      </div>

      {filteredRows.length === 0 ? (
        <p className="text-center py-8 text-text-muted">
          No position data available for this race yet.
        </p>
      ) : (
        <>
          {/* Desktop / tablet */}
          <div className="hidden md:block bg-bg-surface border border-border rounded-lg overflow-hidden">
            <DesktopGrid candidates={candidates} rows={filteredRows} />
          </div>

          {/* Mobile */}
          <div className="md:hidden bg-bg-surface border border-border rounded-lg overflow-hidden">
            <MobileView candidates={candidates} rows={filteredRows} />
          </div>
        </>
      )}
    </div>
  );
}
