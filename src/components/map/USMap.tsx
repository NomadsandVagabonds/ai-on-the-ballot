"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import type { StateMapEntry } from "@/types/domain";
import { STATE_MAP, stateAbbrToSlug } from "@/lib/utils/states";
import { useMapStore } from "@/stores/mapStore";
import Link from "next/link";

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

/**
 * FIPS code to state abbreviation mapping.
 * The us-atlas topology uses FIPS codes as feature IDs.
 */
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

interface USMapProps {
  states: StateMapEntry[];
}

export function USMap({ states }: USMapProps) {
  const router = useRouter();
  const hoveredState = useMapStore((s) => s.hoveredState);
  const setHoveredState = useMapStore((s) => s.setHoveredState);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const stateDataMap = useMemo(() => {
    const map = new Map<string, StateMapEntry>();
    for (const s of states) {
      map.set(s.abbreviation, s);
    }
    return map;
  }, [states]);

  const hoveredStateData = hoveredState
    ? stateDataMap.get(hoveredState)
    : null;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    },
    []
  );

  // Sorted for the mobile list view
  const sortedStates = useMemo(
    () => [...states].sort((a, b) => a.name.localeCompare(b.name)),
    [states]
  );

  return (
    <div>
      {/* Desktop/tablet: interactive map */}
      <div
        className="hidden md:block relative"
        onMouseMove={handleMouseMove}
      >
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{ scale: 1000 }}
          width={800}
          height={500}
          className="w-full h-auto"
          aria-label="Interactive map of the United States showing tracked congressional races by state"
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const fipsId = geo.id as string;
                const abbr = FIPS_TO_ABBR[fipsId];
                if (!abbr) return null;

                const stateEntry = stateDataMap.get(abbr);
                const hasData = stateEntry?.has_data ?? false;
                const isHovered = hoveredState === abbr;

                const stateName = stateEntry?.name ?? abbr;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => setHoveredState(abbr)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => {
                      if (stateEntry) {
                        router.push(`/state/${stateEntry.slug}`);
                      }
                    }}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if ((e.key === "Enter" || e.key === " ") && stateEntry) {
                        e.preventDefault();
                        router.push(`/state/${stateEntry.slug}`);
                      }
                    }}
                    tabIndex={hasData ? 0 : -1}
                    role={hasData ? "button" : undefined}
                    aria-label={
                      hasData
                        ? `${stateName} — ${stateEntry!.race_count} tracked race${stateEntry!.race_count === 1 ? "" : "s"}`
                        : `${stateName} — coming soon`
                    }
                    style={{
                      default: {
                        fill: hasData ? "#0D9488" : "#E5E0D8",
                        stroke: "#FAF6F0",
                        strokeWidth: 0.75,
                        cursor: hasData ? "pointer" : "default",
                        outline: "none",
                      },
                      hover: {
                        fill: hasData ? "#0F766E" : "#C9C2B6",
                        stroke: "#FAF6F0",
                        strokeWidth: 0.75,
                        cursor: hasData ? "pointer" : "default",
                        outline: "none",
                      },
                      pressed: {
                        fill: hasData ? "#115E59" : "#C9C2B6",
                        stroke: "#FAF6F0",
                        strokeWidth: 0.75,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Tooltip */}
        {hoveredStateData && (
          <div
            className="fixed z-50 pointer-events-none bg-bg-surface border border-border rounded-lg shadow-[var(--shadow-lg)] px-3 py-2"
            style={{
              left: tooltipPos.x + 12,
              top: tooltipPos.y - 40,
            }}
          >
            <p className="text-sm font-semibold text-text-primary">
              {hoveredStateData.name}
            </p>
            <p className="text-xs text-text-muted">
              {hoveredStateData.race_count > 0
                ? `${hoveredStateData.race_count} tracked race${
                    hoveredStateData.race_count === 1 ? "" : "s"
                  }`
                : "No tracked races"}
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm bg-accent-primary" />
            <span className="text-xs text-text-muted">Tracked races</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm bg-border" />
            <span className="text-xs text-text-muted">Coming soon</span>
          </div>
        </div>
      </div>

      {/* Mobile: searchable state list */}
      <div className="md:hidden">
        <MobileStateList states={sortedStates} />
      </div>
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

  return (
    <div>
      <div className="px-4 pb-3">
        <input
          type="search"
          placeholder="Filter states..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
          aria-label="Filter states"
        />
      </div>

      <ul className="divide-y divide-border">
        {filtered.map((state) => (
          <li key={state.abbreviation}>
            <Link
              href={`/state/${state.slug}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-bg-elevated/50 transition-colors"
            >
              <span className="text-sm font-medium text-text-primary">
                {state.name}
              </span>
              <span className="text-xs text-text-muted shrink-0 ml-2">
                {state.has_data
                  ? `${state.race_count} race${
                      state.race_count === 1 ? "" : "s"
                    }`
                  : "Coming soon"}
              </span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-text-muted">
            No states match your search.
          </li>
        )}
      </ul>
    </div>
  );
}
