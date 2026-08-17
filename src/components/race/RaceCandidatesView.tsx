"use client";

import { useMemo, useState } from "react";
import type { CandidateSummary, ComparisonRow } from "@/types/domain";
import { ToggleSwitch } from "@/components/shared/ToggleSwitch";
import { ComparisonGrid } from "@/components/race/ComparisonGrid";

interface RaceCandidatesViewProps {
  /** Candidates on the November general-election ballot (default view). */
  general: CandidateSummary[];
  /** Fundraising-capped primary field, for the "show all" toggle. */
  allPrimary: CandidateSummary[];
  /** How many primary candidates fall outside the fundraising cap. */
  primaryHidden: number;
  /** Comparison rows fetched for the union of both candidate lists. */
  comparisonData: ComparisonRow[];
}

/**
 * Post-primary race view: defaults to the November general-election
 * matchup, with a toggle to reveal the full primary field. Rendered only
 * when at least one candidate in the race is marked in_general_election;
 * races without primary results entered keep the plain ComparisonGrid.
 */
export function RaceCandidatesView({
  general,
  allPrimary,
  primaryHidden,
  comparisonData,
}: RaceCandidatesViewProps) {
  const [showAllPrimary, setShowAllPrimary] = useState(false);
  const active = showAllPrimary ? allPrimary : general;

  // Rebuild each row's position cells to match the active candidate
  // order — comparisonData was fetched for the union of both lists.
  const rows = useMemo(
    () =>
      comparisonData.map((row) => {
        const byCandidate = new Map(
          row.positions.map((p) => [p.candidate_id, p])
        );
        return {
          ...row,
          positions: active
            .map((c) => byCandidate.get(c.id))
            .filter((p): p is NonNullable<typeof p> => Boolean(p)),
        };
      }),
    [comparisonData, active]
  );

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-sm border border-border bg-bg-elevated px-4 py-3">
        <p className="text-sm text-text-secondary">
          {showAllPrimary ? (
            <>
              Showing the primary field
              {primaryHidden > 0 && (
                <span className="text-text-muted">
                  {" "}
                  · top five by reported fundraising, {primaryHidden} more not
                  shown
                </span>
              )}
            </>
          ) : (
            <>Showing the November general-election matchup</>
          )}
        </p>
        <ToggleSwitch
          checked={showAllPrimary}
          onChange={setShowAllPrimary}
          label="Show all primary candidates"
        />
      </div>

      <ComparisonGrid candidates={active} comparisonData={rows} />
    </div>
  );
}
