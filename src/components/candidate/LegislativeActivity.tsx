"use client";

import { useState } from "react";
import type { LegislativeActivityRow, LegislativeActivityType } from "@/types/database";

interface LegislativeActivityProps {
  activities: LegislativeActivityRow[];
}

const ACTIVITY_TYPE_LABELS: Record<LegislativeActivityType, string> = {
  bill_sponsored: "BILL SPONSORED",
  bill_cosponsored: "BILL COSPONSORED",
  vote: "VOTE",
  hearing: "HEARING",
  letter: "LETTER",
  statement: "STATEMENT",
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
    <div>
      <ul className="divide-y divide-border">
        {visible.map((activity) => (
          <li key={activity.id} className="py-5 first:pt-0">
            {/* Date + type on same line */}
            <div className="flex items-baseline gap-3 mb-1.5">
              {activity.date && (
                <time
                  className="text-sm font-mono font-semibold text-text-primary tabular-nums shrink-0"
                  dateTime={activity.date}
                >
                  {new Date(activity.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              )}
              <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-text-muted">
                {ACTIVITY_TYPE_LABELS[activity.activity_type] ?? activity.activity_type}
              </span>
            </div>

            {/* Title */}
            <h4 className="text-sm font-semibold text-text-primary leading-snug">
              {activity.title}
            </h4>

            {/* Description */}
            {activity.description && (
              <p className="mt-1 text-sm text-text-secondary leading-relaxed max-w-prose">
                {activity.description}
              </p>
            )}

            {/* Source link */}
            {activity.source_url && (
              <a
                href={activity.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-2 text-xs text-accent-primary hover:underline hover:underline-offset-2"
              >
                View source
                <span aria-hidden="true">&rarr;</span>
              </a>
            )}
          </li>
        ))}
      </ul>

      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-sm font-medium text-accent-primary hover:underline hover:underline-offset-2"
        >
          {expanded
            ? "Show less"
            : `Show all ${activities.length} activities`}
        </button>
      )}
    </div>
  );
}
