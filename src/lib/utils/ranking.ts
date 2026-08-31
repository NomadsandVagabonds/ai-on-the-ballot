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
import { GENERAL_ELECTION_SEED } from "./general-election-seed";

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

/** Which lens a race's candidate list is being shown through. */
export type RaceDisplayMode = "general" | "primary";

/** A candidate annotated with their post-primary status for display. */
export type RosterCandidate<T extends CandidateSummary> = T & {
  /** True when the race has general-election results and this candidate is not on the November ballot. */
  not_advancing: boolean;
};

/**
 * Build the display roster for a race, post-primary.
 *
 * When at least one candidate is on the November ballot (via the
 * `in_general_election` flag, or the temporary demo seed for races the
 * sheet hasn't marked yet — see general-election-seed.ts, delete at
 * go-live), every candidate stays visible: general-ballot candidates
 * lead (alphabetical — nonpartisan default), followed by the
 * fundraising-ranked rest of the primary field marked `not_advancing`
 * so the UI can grey them out. The fundraising cap still bounds that
 * tail, so fringe filers don't bury the matchup.
 *
 * Races without primary results keep the capped primary view unchanged.
 */
export function selectRaceCandidates<T extends CandidateSummary>(
  candidates: T[],
  limit: number = CANDIDATE_DISPLAY_LIMIT
): { shown: RosterCandidate<T>[]; hidden: number; mode: RaceDisplayMode } {
  let general = candidates.filter((c) => c.in_general_election);
  if (general.length === 0) {
    general = candidates.filter((c) => GENERAL_ELECTION_SEED.has(c.slug));
  }
  if (general.length > 0) {
    const generalIds = new Set(general.map((c) => c.id));
    const onBallot = [...general]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => ({ ...c, not_advancing: false }));
    const eliminated = capByFundraising(candidates, limit)
      .shown.filter((c) => !generalIds.has(c.id))
      .map((c) => ({ ...c, not_advancing: true }));
    const shown = [...onBallot, ...eliminated];
    return {
      shown,
      hidden: candidates.length - shown.length,
      mode: "general",
    };
  }
  const { shown, hidden } = capByFundraising(candidates, limit);
  return {
    shown: shown.map((c) => ({ ...c, not_advancing: false })),
    hidden,
    mode: "primary",
  };
}
