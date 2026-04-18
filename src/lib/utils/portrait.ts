/**
 * Portrait resolution for candidates.
 *
 * Rules:
 *   1. If `photo_url` is set, use it as-is. This covers challengers and any
 *      manually-uploaded portraits.
 *   2. Else, if `bioguide_id` is set, build the public-domain URL at
 *      https://unitedstates.github.io/images/congress/{size}/{id}.jpg
 *   3. Else, return null — the rendering component shows the monogram fallback.
 *
 * The unitedstates/images repository is CC0 public domain. URLs are predictable
 * and CDN-hosted by GitHub Pages. Only sitting members of Congress have bioguide
 * IDs; challengers and governors will always fall through to the monogram.
 */

export type PortraitSize = "original" | "450x550" | "225x275";

/**
 * Default portrait size. 450x550 is the sweet spot for the square portrait
 * frames we render (~220px) — enough resolution for retina, modest bytes.
 */
const DEFAULT_SIZE: PortraitSize = "450x550";

export function bioguidePhotoUrl(
  bioguideId: string | null | undefined,
  size: PortraitSize = DEFAULT_SIZE
): string | null {
  if (!bioguideId) return null;
  const clean = bioguideId.trim().toUpperCase();
  // Bioguide IDs are 1 letter + 6 digits. Guard against malformed values
  // rather than hand a broken URL to <img>.
  if (!/^[A-Z][0-9]{6}$/.test(clean)) return null;
  return `https://unitedstates.github.io/images/congress/${size}/${clean}.jpg`;
}

/**
 * Resolve a candidate's portrait URL using the fallback chain.
 * Returns null when no image is available; callers should render the monogram.
 */
export function resolveCandidatePhoto(candidate: {
  photo_url: string | null;
  bioguide_id?: string | null;
}, size: PortraitSize = DEFAULT_SIZE): string | null {
  if (candidate.photo_url) return candidate.photo_url;
  return bioguidePhotoUrl(candidate.bioguide_id, size);
}
