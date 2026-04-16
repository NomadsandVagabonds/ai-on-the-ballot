/** Slug generation and parsing utilities */

import type { Chamber } from "@/types/database";

/** Generate a candidate slug: first-last-st (e.g., "ted-cruz-tx") */
export function candidateSlug(
  firstName: string,
  lastName: string,
  stateAbbr: string
): string {
  return `${slugify(firstName)}-${slugify(lastName)}-${stateAbbr.toLowerCase()}`;
}

/** Generate a race slug: st-chamber-district-year (e.g., "tx-sen-2026" or "tx-house-07-2026") */
export function raceSlug(
  stateAbbr: string,
  chamber: Chamber,
  year: number,
  district?: string | null
): string {
  const parts = [stateAbbr.toLowerCase(), chamberAbbr(chamber)];
  if (district) parts.push(district.padStart(2, "0"));
  parts.push(year.toString());
  return parts.join("-");
}

/** Parse a race slug back into components */
export function parseRaceSlug(slug: string): {
  stateAbbr: string;
  chamber: string;
  district: string | null;
  year: number;
} | null {
  const parts = slug.split("-");
  if (parts.length < 3) return null;

  const stateAbbr = parts[0].toUpperCase();
  const chamber = parts[1];
  const year = parseInt(parts[parts.length - 1], 10);
  const district = parts.length === 4 ? parts[2] : null;

  if (isNaN(year)) return null;
  return { stateAbbr, chamber, district, year };
}

function chamberAbbr(chamber: Chamber): string {
  switch (chamber) {
    case "senate": return "sen";
    case "house": return "house";
    case "governor": return "gov";
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
