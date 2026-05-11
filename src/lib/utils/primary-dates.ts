/**
 * 2026 U.S. primary election dates by state.
 *
 * Used to sort "Key Congressional Races" so states with the soonest
 * upcoming primary appear first, and to label release timelines on
 * the map.
 *
 * Only the seven states currently covered by the tracker are pinned
 * here intentionally — dates are sourced from each state's election
 * authority and should be reviewed by editorial before adding new
 * states. Returning null for unknown states lets the UI fall back
 * to neutral copy ("Coming soon") rather than a guessed date.
 */
const PRIMARY_DATES_2026: Record<string, string> = {
  AR: "2026-03-03",
  NC: "2026-03-03",
  TX: "2026-03-03",
  MS: "2026-03-10",
  IL: "2026-03-17",
  IN: "2026-05-05",
  OH: "2026-05-05",
};

/** Return the primary date (YYYY-MM-DD) for a state, or null. */
export function getPrimaryDate(stateAbbr: string): string | null {
  return PRIMARY_DATES_2026[stateAbbr.toUpperCase()] ?? null;
}

/** Sortable timestamp; states without a known date sort to the end. */
export function primarySortKey(stateAbbr: string): number {
  const d = getPrimaryDate(stateAbbr);
  return d ? new Date(d + "T00:00:00Z").getTime() : Number.POSITIVE_INFINITY;
}

/** Pretty label, e.g. "Mar 3" or "May 5, 2026". */
export function formatPrimaryDate(
  stateAbbr: string,
  opts: { withYear?: boolean } = {}
): string | null {
  const iso = getPrimaryDate(stateAbbr);
  if (!iso) return null;
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
    ...(opts.withYear ? { year: "numeric" } : {}),
  });
}
