"use client";

import { useState } from "react";
import type { LegislativeActivityRow, LegislativeActivityType } from "@/types/database";

interface LegislativeActivityProps {
  activities: LegislativeActivityRow[];
}

const ACTIVITY_TYPE_LABELS: Record<LegislativeActivityType, string> = {
  bill_sponsored: "Sponsored",
  bill_cosponsored: "Cosponsored",
  vote: "Vote",
  hearing: "Hearing",
  letter: "Letter",
  statement: "Statement",
};

const ACTIVITY_TYPE_STYLES: Record<LegislativeActivityType, string> = {
  bill_sponsored: "bg-accent-primary/10 text-accent-primary",
  bill_cosponsored: "bg-accent-secondary/10 text-accent-secondary",
  vote: "bg-accent-gold/10 text-accent-gold",
  hearing: "bg-gray-100 text-text-secondary",
  letter: "bg-gray-100 text-text-secondary",
  statement: "bg-gray-100 text-text-secondary",
};

const INITIAL_VISIBLE = 5;

export function LegislativeActivity({ activities }: LegislativeActivityProps) {
  const [expanded, setExpanded] = useState(false);

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        <p>No legislative activity tracked yet.</p>
      </div>
    );
  }

  const visible = expanded ? activities : activities.slice(0, INITIAL_VISIBLE);
  const hasMore = activities.length > INITIAL_VISIBLE;

  return (
    <div className="space-y-4">
      <ol className="relative border-l-2 border-border ml-3 space-y-6">
        {visible.map((activity) => (
          <li key={activity.id} className="ml-6">
            {/* Timeline dot */}
            <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-bg-surface bg-accent-primary" />

            <div className="flex flex-wrap items-start gap-2 mb-1">
              {/* Type badge */}
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider leading-none ${
                  ACTIVITY_TYPE_STYLES[activity.activity_type] ?? "bg-gray-100 text-text-secondary"
                }`}
              >
                {ACTIVITY_TYPE_LABELS[activity.activity_type] ?? activity.activity_type}
              </span>

              {/* Date */}
              {activity.date && (
                <time
                  className="text-xs font-mono text-text-muted"
                  dateTime={activity.date}
                >
                  {new Date(activity.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              )}
            </div>

            {/* Title */}
            <h4 className="text-sm font-semibold text-text-primary leading-snug">
              {activity.title}
            </h4>

            {/* Description */}
            {activity.description && (
              <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                {activity.description}
              </p>
            )}

            {/* Source link */}
            {activity.source_url && (
              <a
                href={activity.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1.5 text-xs text-accent-primary hover:underline"
              >
                View source
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            )}
          </li>
        ))}
      </ol>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-sm font-medium text-accent-primary hover:underline"
        >
          {expanded
            ? "Show less"
            : `Show all ${activities.length} activities`}
        </button>
      )}
    </div>
  );
}
