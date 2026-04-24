import { feature } from "topojson-client";
import { geoAlbersUsa, geoMercator, geoPath } from "d3-geo";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, MultiPolygon, Polygon } from "geojson";

const TOPO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const FIPS_TO_ABBR: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA",
  "08": "CO", "09": "CT", "10": "DE", "12": "FL", "13": "GA",
  "15": "HI", "16": "ID", "17": "IL", "18": "IN", "19": "IA",
  "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD",
  "25": "MA", "26": "MI", "27": "MN", "28": "MS", "29": "MO",
  "30": "MT", "31": "NE", "32": "NV", "33": "NH", "34": "NJ",
  "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH",
  "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC",
  "46": "SD", "47": "TN", "48": "TX", "49": "UT", "50": "VT",
  "51": "VA", "53": "WA", "54": "WV", "55": "WI", "56": "WY",
};

interface StateOutlineProps {
  abbr: string;
  /** Accessible alt label — usually the state's full name. */
  label: string;
  /** Fill color; defaults to sage (matches tracked states on the US map). */
  fill?: string;
  /** Square SVG viewBox size. */
  size?: number;
  className?: string;
}

/**
 * Server-rendered single-state silhouette. Fetches the shared us-atlas
 * TopoJSON (cached for 24h), isolates the requested state, and returns an
 * inline SVG sized to fit `size x size`. Alaska and Hawaii stay in their
 * Albers-USA insets; everything else uses a per-state Mercator projection
 * so the shape fills the box instead of sitting at its national position.
 */
export async function StateOutline({
  abbr,
  label,
  fill = "#5B7B6A",
  size = 260,
  className,
}: StateOutlineProps) {
  let pathD: string | null = null;

  try {
    const res = await fetch(TOPO_URL, { next: { revalidate: 86400 } });
    if (res.ok) {
      const topology = (await res.json()) as Topology<{
        states: GeometryCollection<{ name?: string }>;
      }>;

      const geojson = feature(topology, topology.objects.states);

      const target = geojson.features.find((f) => {
        const fips = String(f.id).padStart(2, "0");
        return FIPS_TO_ABBR[fips] === abbr.toUpperCase();
      }) as Feature<Polygon | MultiPolygon> | undefined;

      if (target) {
        // Fit the single state to the SVG box.
        const projection =
          abbr.toUpperCase() === "AK" || abbr.toUpperCase() === "HI"
            ? geoAlbersUsa().fitSize([size, size], target)
            : geoMercator().fitSize([size, size], target);

        pathD = geoPath().projection(projection)(target);
      }
    }
  } catch {
    // Fall through — render the abbr glyph fallback below.
  }

  if (!pathD) {
    return (
      <div
        className={className}
        role="img"
        aria-label={label}
        style={{
          aspectRatio: "1 / 1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: fill,
          fontFamily: "var(--font-display), Georgia, serif",
          fontSize: "2.5em",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          opacity: 0.55,
        }}
      >
        {abbr.toUpperCase()}
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={label}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
      preserveAspectRatio="xMidYMid meet"
    >
      <path d={pathD} fill={fill} />
    </svg>
  );
}
