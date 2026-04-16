/** Stance display utilities — colors, shapes, and labels for WCAG compliance */

import type { Stance, Confidence } from "@/types/database";

export interface StanceDisplay {
  label: string;
  color: string;
  bgColor: string;
  shape: "circle" | "square" | "diamond" | "circle-outline" | "dashed";
}

export const STANCE_DISPLAY: Record<Stance, StanceDisplay> = {
  support: {
    label: "Support",
    color: "var(--stance-support)",
    bgColor: "rgba(22, 163, 74, 0.1)",
    shape: "circle",
  },
  oppose: {
    label: "Oppose",
    color: "var(--stance-oppose)",
    bgColor: "rgba(220, 38, 38, 0.1)",
    shape: "square",
  },
  mixed: {
    label: "Mixed",
    color: "var(--stance-mixed)",
    bgColor: "rgba(217, 119, 6, 0.1)",
    shape: "diamond",
  },
  unclear: {
    label: "Unclear",
    color: "var(--stance-unclear)",
    bgColor: "rgba(156, 163, 175, 0.1)",
    shape: "circle-outline",
  },
  no_mention: {
    label: "No mention",
    color: "var(--stance-no-mention)",
    bgColor: "transparent",
    shape: "dashed",
  },
};

export interface ConfidenceDisplay {
  label: string;
  color: string;
}

export const CONFIDENCE_DISPLAY: Record<Confidence, ConfidenceDisplay> = {
  high: {
    label: "High confidence",
    color: "var(--confidence-high)",
  },
  medium: {
    label: "Medium confidence",
    color: "var(--confidence-medium)",
  },
  low: {
    label: "Low confidence",
    color: "var(--confidence-low)",
  },
};

/** Calculate coverage percentage: how many issues have a known position */
export function coveragePercentage(
  positionCount: number,
  totalIssues: number
): number {
  if (totalIssues === 0) return 0;
  return Math.round((positionCount / totalIssues) * 100);
}

/** Display-friendly chamber name */
export function chamberLabel(chamber: string): string {
  switch (chamber) {
    case "senate": return "U.S. Senate";
    case "house": return "U.S. House";
    case "governor": return "Governor";
    default: return chamber;
  }
}

/** Display-friendly party name */
export function partyLabel(party: string): string {
  switch (party) {
    case "D": return "Democrat";
    case "R": return "Republican";
    case "I": return "Independent";
    case "L": return "Libertarian";
    case "G": return "Green";
    default: return party;
  }
}
