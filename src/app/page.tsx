import Link from "next/link";
import { getAllStatesForMap } from "@/lib/queries/states";
import { USMap } from "@/components/map/USMap";
import { HeroZipInput } from "./HeroZipInput";

export const revalidate = 1800;

export default async function Home() {
  const states = await getAllStatesForMap();

  const totalRaces = states.reduce((sum, s) => sum + s.race_count, 0);
  const statesWithData = states.filter((s) => s.has_data).length;

  return (
    <div>
      {/* Hero: title + zip code + map as one integrated dark section */}
      <section
        className="relative"
        style={{ backgroundColor: "#0F1419" }}
      >
        {/* Title + zip code */}
        <div className="relative z-10 pt-12 md:pt-16 pb-6 md:pb-8 px-4">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-teal-400/80 mb-4">
              Nonpartisan Research &middot; 2026 Elections
            </p>
            <h1 className="font-display text-display-xl font-bold text-white mb-4">
              AI on the Ballot
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
              Where do your representatives stand on the most consequential
              technology of our time?
            </p>

            {/* Prominent zip code input */}
            <div className="flex justify-center mb-2">
              <HeroZipInput />
            </div>
            <p className="text-xs text-gray-500">
              Enter your zip code to find your candidates &mdash; or click a
              state below
            </p>
          </div>
        </div>

        {/* Map integrated directly below */}
        <div className="relative z-10">
          <USMap states={states} />
        </div>
      </section>

      {/* Featured states — below the dark map section */}
      {statesWithData > 0 && (
        <section className="px-4 py-16 md:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-border" />
              <h2 className="font-display text-display-md font-bold text-text-primary text-center shrink-0">
                Launch States
              </h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <p className="text-center text-text-muted text-sm mb-10">
              {statesWithData} states tracked &middot; {totalRaces} races
              &middot; 5 AI policy issues
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {states
                .filter((s) => s.has_data)
                .sort((a, b) => b.race_count - a.race_count)
                .slice(0, 6)
                .map((state) => (
                  <Link
                    key={state.abbreviation}
                    href={`/state/${state.slug}`}
                    className="group card-elevated p-6 block"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display text-xl font-bold text-text-primary group-hover:text-accent-primary transition-colors duration-200">
                        {state.name}
                      </h3>
                      <svg
                        className="h-4 w-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 mt-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-2xl font-bold text-accent-primary tabular-nums">
                        {state.race_count}
                      </span>
                      <span className="text-xs text-text-muted uppercase tracking-wider">
                        tracked race{state.race_count === 1 ? "" : "s"}
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
