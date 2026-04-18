/**
 * Ranking and capping for candidate lists.
 *
 * Races can surface dozens of fringe filers whose presence buries the
 * serious contenders in both the state dossier and the race comparison
 * grid. We cap display at `CANDIDATE_DISPLAY_LIMIT` (5) and rank by
 * FEC-reported total raised. Ties, null, and zero values fall to the
 * bottom in a stable, alphabetical-by-name order so the cap is
 * deterministic and nonpartisan.
 */

import type { CandidateSummary } from "@/types/domain";

export const CANDIDATE_DISPLAY_LIMIT = 5;

/**
 * Return candidates ranked by reported fundraising, descending.
 * Null / zero fundraising ties break alphabetically by name so the
 * output is deterministic and doesn't silently favor one party.
 */
export function rankByFundraising<T extends CandidateSummary>(
  candidates: T[]
): T[] {
  return [...candidates].sort((a, b) => {
    const ra = a.total_raised ?? -1;
    const rb = b.total_raised ?? -1;
    if (ra !== rb) return rb - ra;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Cap a candidate list at `limit` (default 5), ranked by fundraising.
 * Returns the visible slice plus how many were cut — so the UI can
 * render an honest "N more not shown" footer.
 */
export function capByFundraising<T extends CandidateSummary>(
  candidates: T[],
  limit: number = CANDIDATE_DISPLAY_LIMIT
): { shown: T[]; hidden: number } {
  const ranked = rankByFundraising(candidates);
  const shown = ranked.slice(0, limit);
  const hidden = Math.max(0, ranked.length - shown.length);
  return { shown, hidden };
}
