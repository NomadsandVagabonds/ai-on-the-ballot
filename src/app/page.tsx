import Link from "next/link";
import { getAllStatesForMap } from "@/lib/queries/states";
import { StatsBar } from "@/components/shared/StatsBar";
import { HeroZipInput } from "./HeroZipInput";

export const revalidate = 1800;

export default async function Home() {
  const states = await getAllStatesForMap();

  const totalRaces = states.reduce((sum, s) => sum + s.race_count, 0);
  const statesWithData = states.filter((s) => s.has_data).length;

  const stats = [
    { label: "Races Tracked", value: totalRaces || "0" },
    { label: "States", value: statesWithData || "0" },
    { label: "AI Issues", value: 5 },
  ];

  return (
    <div>
      {/* Hero section */}
      <section className="relative hero-pattern px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="hero-grid" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent-primary mb-6">
            Nonpartisan Research &middot; 2026 Elections
          </p>
          <h1 className="font-display text-display-xl font-bold text-text-primary mb-6">
            AI on the Ballot
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Where do your representatives stand on the most consequential
            technology of our time? Track the AI governance positions of every
            major congressional candidate.
          </p>

          <div className="flex justify-center mb-8">
            <HeroZipInput />
          </div>

          <p className="text-xs text-text-muted">
            Enter your zip code to find your district&apos;s candidates
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 scroll-indicator" aria-hidden="true">
          <svg className="h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-bg-surface py-8">
        <div className="mx-auto max-w-5xl px-4">
          <StatsBar stats={stats} />
        </div>
      </section>

      {/* Map preview */}
      <section className="px-4 py-16 md:py-20 grain-overlay">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-accent-primary mb-3">
            Interactive
          </p>
          <h2 className="font-display text-display-md font-bold text-text-primary mb-3">
            Explore by State
          </h2>
          <p className="text-text-secondary mb-10 max-w-xl mx-auto leading-relaxed">
            Click a state to see tracked races and where candidates stand on key
            AI policy issues.
          </p>

          <Link
            href="/map"
            className="group inline-flex items-center gap-2 rounded-lg bg-accent-primary px-6 py-3 text-base font-semibold text-white hover:bg-accent-primary-hover transition-all duration-200 hover:shadow-[var(--shadow-md)] focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
          >
            Explore the Map
            <svg
              className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Featured states */}
      {statesWithData > 0 && (
        <section className="px-4 pb-20 pt-4">
          <div className="mx-auto max-w-5xl">
            {/* Section header with decorative lines */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-border" />
              <h2 className="font-display text-display-md font-bold text-text-primary text-center shrink-0">
                Launch States
              </h2>
              <div className="h-px flex-1 bg-border" />
            </div>
            <p className="text-center text-text-muted text-sm mb-10">
              Our initial coverage. More states coming soon.
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
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
