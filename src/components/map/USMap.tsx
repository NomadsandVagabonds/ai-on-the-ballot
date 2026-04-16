"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { feature } from "topojson-client";
import { geoAlbersUsa, geoPath } from "d3-geo";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, MultiPolygon, Polygon } from "geojson";
import type { StateMapEntry } from "@/types/domain";
import { STATE_MAP } from "@/lib/utils/states";
import { useMapStore } from "@/stores/mapStore";
import Link from "next/link";

const TOPO_URL =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

/** FIPS code to state abbreviation mapping */
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

interface StateFeature {
  abbr: string;
  name: string;
  pathD: string;
}

interface USMapProps {
  states: StateMapEntry[];
}

export function USMap({ states }: USMapProps) {
  const router = useRouter();
  const hoveredState = useMapStore((s) => s.hoveredState);
  const setHoveredState = useMapStore((s) => s.setHoveredState);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [stateFeatures, setStateFeatures] = useState<StateFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const stateDataMap = useMemo(() => {
    const map = new Map<string, StateMapEntry>();
    for (const s of states) {
      map.set(s.abbreviation, s);
    }
    return map;
  }, [states]);

  // Fetch TopoJSON and convert to projected SVG paths
  useEffect(() => {
    let cancelled = false;

    async function loadMap() {
      try {
        const res = await fetch(TOPO_URL);
        if (!res.ok) throw new Error(`Failed to fetch map data: ${res.status}`);

        const topology = (await res.json()) as Topology<{
          states: GeometryCollection<{ name?: string }>;
        }>;

        const geojson = feature(topology, topology.objects.states);

        // Set up projection — geoAlbersUsa includes Alaska/Hawaii repositioning
        const projection = geoAlbersUsa()
          .scale(1280)
          .translate([480, 300]);

        const pathGenerator = geoPath().projection(projection);

        const features: StateFeature[] = [];
        for (const feat of geojson.features) {
          const fipsId = String(feat.id).padStart(2, "0");
          const abbr = FIPS_TO_ABBR[fipsId];
          if (!abbr) continue;

          const d = pathGenerator(
            feat as Feature<Polygon | MultiPolygon>
          );
          if (!d) continue;

          features.push({
            abbr,
            name: STATE_MAP[abbr] ?? abbr,
            pathD: d,
          });
        }

        if (!cancelled) {
          setStateFeatures(features);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load map"
          );
          setLoading(false);
        }
      }
    }

    loadMap();
    return () => {
      cancelled = true;
    };
  }, []);

  const hoveredStateData = hoveredState
    ? stateDataMap.get(hoveredState)
    : null;

  // Hovering over a state with no data entry — show name + "Coming soon"
  const hoveredStateName = hoveredState
    ? STATE_MAP[hoveredState] ?? hoveredState
    : null;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleStateClick = useCallback(
    (abbr: string) => {
      const entry = stateDataMap.get(abbr);
      if (entry) {
        router.push(`/state/${entry.slug}`);
      }
    },
    [stateDataMap, router]
  );

  const handleStateKeyDown = useCallback(
    (e: React.KeyboardEvent, abbr: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleStateClick(abbr);
      }
    },
    [handleStateClick]
  );

  // Stats
  const totalStatesWithData = states.filter((s) => s.has_data).length;
  const totalRaces = states.reduce((sum, s) => sum + s.race_count, 0);
  const sortedStates = useMemo(
    () => [...states].sort((a, b) => a.name.localeCompare(b.name)),
    [states]
  );

  return (
    <div>
      {/* Desktop/tablet: interactive SVG map */}
      <div className="hidden md:block">
        <div
          className="relative w-full"
          style={{ backgroundColor: "#0F1419" }}
          onMouseMove={handleMouseMove}
        >
          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-32">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="h-8 w-8 rounded-full border-2 border-teal-400/30 border-t-teal-400 animate-spin"
                />
                <p className="text-sm text-gray-400">Loading map...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex items-center justify-center py-32">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* SVG Map */}
          {!loading && !error && (
            <svg
              ref={svgRef}
              viewBox="0 0 960 600"
              className="w-full h-auto"
              role="img"
              aria-label="Interactive map of the United States showing tracked congressional races by state"
            >
              {/* Subtle background glow behind active states */}
              <defs>
                <filter id="state-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="hover-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {stateFeatures.map((feat) => {
                const entry = stateDataMap.get(feat.abbr);
                const hasData = entry?.has_data ?? false;
                const isHovered = hoveredState === feat.abbr;

                let fill: string;
                if (hasData && isHovered) {
                  fill = "#2DD4BF"; // bright teal on hover
                } else if (hasData) {
                  fill = "#0D9488"; // teal
                } else if (isHovered) {
                  fill = "#3A3D45"; // lighter gray on hover
                } else {
                  fill = "#22252D"; // dark gray inactive
                }

                return (
                  <path
                    key={feat.abbr}
                    d={feat.pathD}
                    fill={fill}
                    stroke="#0F1419"
                    strokeWidth={0.75}
                    style={{
                      cursor: hasData ? "pointer" : "default",
                      transition: "fill 0.15s ease",
                      filter:
                        hasData && isHovered
                          ? "url(#hover-glow)"
                          : hasData
                          ? "url(#state-glow)"
                          : undefined,
                    }}
                    onMouseEnter={() => setHoveredState(feat.abbr)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => handleStateClick(feat.abbr)}
                    onKeyDown={(e) => handleStateKeyDown(e, feat.abbr)}
                    tabIndex={hasData ? 0 : -1}
                    role={hasData ? "button" : undefined}
                    aria-label={
                      hasData && entry
                        ? `${feat.name} \u2014 ${entry.race_count} tracked race${entry.race_count === 1 ? "" : "s"}`
                        : `${feat.name} \u2014 coming soon`
                    }
                  />
                );
              })}
            </svg>
          )}

          {/* Tooltip */}
          {hoveredState && (
            <div
              className="fixed z-50 pointer-events-none rounded-lg px-3 py-2 shadow-lg"
              style={{
                left: tooltipPos.x + 14,
                top: tooltipPos.y - 48,
                backgroundColor: "#1E2028",
                border: "1px solid #2A2D35",
              }}
            >
              <p className="text-sm font-semibold text-white">
                {hoveredStateName}
              </p>
              <p className="text-xs text-gray-400">
                {hoveredStateData
                  ? hoveredStateData.race_count > 0
                    ? `${hoveredStateData.race_count} tracked race${hoveredStateData.race_count === 1 ? "" : "s"}`
                    : "No tracked races"
                  : "Coming soon"}
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div
          className="flex items-center justify-center gap-8 py-4"
          style={{ backgroundColor: "#0F1419" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: "#0D9488" }}
            />
            <span className="text-xs text-gray-400">Tracked races</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: "#22252D" }}
            />
            <span className="text-xs text-gray-400">Coming soon</span>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="grid grid-cols-3 gap-px"
          style={{ backgroundColor: "#1A1D24" }}
        >
          <StatBox label="States Tracked" value={totalStatesWithData} />
          <StatBox label="Races" value={totalRaces} />
          <StatBox
            label="Candidates"
            value={"\u2014"}
            sublabel="Across all races"
          />
        </div>
      </div>

      {/* Mobile: searchable state cards */}
      <div className="md:hidden">
        <MobileStateList states={sortedStates} />
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: number | string;
  sublabel?: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center py-6 px-4"
      style={{ backgroundColor: "#131720" }}
    >
      <span className="text-3xl font-bold text-teal-400 font-mono tabular-nums">
        {value}
      </span>
      <span className="text-sm text-gray-300 mt-1">{label}</span>
      {sublabel && (
        <span className="text-xs text-gray-500 mt-0.5">{sublabel}</span>
      )}
    </div>
  );
}

function MobileStateList({ states }: { states: StateMapEntry[] }) {
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? states.filter((s) =>
        s.name.toLowerCase().includes(filter.toLowerCase())
      )
    : states;

  const withData = filtered.filter((s) => s.has_data);
  const withoutData = filtered.filter((s) => !s.has_data);

  return (
    <div className="pb-6">
      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            placeholder="Search states..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full rounded-xl border border-border bg-bg-surface pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
            aria-label="Search states"
          />
        </div>
      </div>

      {/* State cards grid */}
      <div className="px-4 grid grid-cols-2 gap-2">
        {withData.map((state) => (
          <Link
            key={state.abbreviation}
            href={`/state/${state.slug}`}
            className="flex flex-col rounded-xl border border-border bg-bg-surface p-3 hover:border-accent-primary transition-colors"
          >
            <span className="text-sm font-semibold text-text-primary">
              {state.name}
            </span>
            <span className="text-xs text-accent-primary mt-1 font-medium">
              {state.race_count} race{state.race_count === 1 ? "" : "s"}
            </span>
          </Link>
        ))}
        {withoutData.map((state) => (
          <div
            key={state.abbreviation}
            className="flex flex-col rounded-xl border border-border/50 bg-bg-elevated/50 p-3 opacity-60"
          >
            <span className="text-sm font-medium text-text-secondary">
              {state.name}
            </span>
            <span className="text-xs text-text-muted mt-1">Coming soon</span>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="px-4 py-8 text-center text-sm text-text-muted">
          No states match your search.
        </p>
      )}
    </div>
  );
}
