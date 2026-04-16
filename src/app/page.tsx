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
      <section className="px-4 pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-text-primary mb-4">
            AI on the Ballot
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            A nonpartisan transparency resource documenting the public AI
            governance positions of U.S. congressional candidates for the 2026
            elections.
          </p>

          <div className="flex justify-center">
            <HeroZipInput />
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-bg-surface py-6">
        <div className="mx-auto max-w-5xl px-4">
          <StatsBar stats={stats} />
        </div>
      </section>

      {/* Map preview */}
      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-text-primary mb-3">
            Explore by State
          </h2>
          <p className="text-text-secondary mb-8 max-w-xl mx-auto">
            Click a state to see tracked races and where candidates stand on key
            AI policy issues.
          </p>

          <Link
            href="/map"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-primary px-6 py-3 text-base font-semibold text-white hover:bg-accent-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
          >
            Explore the Map
            <svg
              className="h-5 w-5"
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
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-text-primary mb-6 text-center">
              Launch States
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {states
                .filter((s) => s.has_data)
                .sort((a, b) => b.race_count - a.race_count)
                .slice(0, 6)
                .map((state) => (
                  <Link
                    key={state.abbreviation}
                    href={`/state/${state.slug}`}
                    className="group block bg-bg-surface border border-border rounded-lg p-5 transition-shadow hover:shadow-[var(--shadow-md)]"
                  >
                    <h3 className="font-display text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                      {state.name}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {state.race_count} tracked race
                      {state.race_count === 1 ? "" : "s"}
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
