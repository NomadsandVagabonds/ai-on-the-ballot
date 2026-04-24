import Link from "next/link";
import { getAllStatesForMap } from "@/lib/queries/states";
import { getAllIssuesWithCounts } from "@/lib/queries/issues";
import { AnimatedCounter } from "@/components/home/AnimatedCounter";

export const revalidate = 1800;

const FEATURED_STATE_ABBRS = ["CA", "TX", "OH", "PA", "NC"] as const;

export default async function Home() {
  const [states, issues] = await Promise.all([
    getAllStatesForMap(),
    getAllIssuesWithCounts(),
  ]);

  const totalRaces = states.reduce((sum, s) => sum + s.race_count, 0);
  const statesWithData = states.filter((s) => s.has_data).length;

  const featuredRaces = FEATURED_STATE_ABBRS.map((abbr) =>
    states.find((s) => s.abbreviation === abbr)
  ).filter((s): s is NonNullable<typeof s> => Boolean(s && s.has_data));

  return (
    <div>
      {/* ============================================================
          Hero — navy landing with amber CTAs + animated stats
         ============================================================ */}
      <section className="hero-navy">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 md:pt-28 md:pb-20">
          <p className="hero-eyebrow mb-5">2026 U.S. Congressional Elections</p>

          <h1 className="hero-h1 mb-6" style={{ maxWidth: "16ch" }}>
            Where do your candidates stand on AI?
          </h1>

          <p className="hero-sub mb-10">
            Nonpartisan research tracking where U.S. candidates running for Congress in the midterm elections stand on artificial intelligence policy.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-14">
            <Link href="/map" className="btn-amber">
              Explore the Map
            </Link>
            <Link href="/about#methodology" className="btn-ghost-light">
              How We Code Positions
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">
                <AnimatedCounter value={totalRaces} />
              </span>
              <span className="hero-stat-label">Races tracked</span>
            </div>
            <div className="hero-stat-divider" aria-hidden="true" />
            <div className="hero-stat">
              <span className="hero-stat-num">
                <AnimatedCounter value={statesWithData} />
              </span>
              <span className="hero-stat-label">States with data</span>
            </div>
            <div className="hero-stat-divider" aria-hidden="true" />
            <div className="hero-stat">
              <span className="hero-stat-num">
                <AnimatedCounter value={issues.length} />
              </span>
              <span className="hero-stat-label">Tracked topics</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          Topics — "Issues on the Ballot"
          No roman numerals. No polarizing subtitle.
         ============================================================ */}
      {issues.length > 0 && (
        <section
          id="issues"
          className="px-4 py-16 md:py-24 bg-bg-primary scroll-mt-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-10">
              <p className="kicker mb-3">Coverage</p>
              <h2 className="font-display text-display-md font-bold text-text-primary">
                Issues on the Ballot
              </h2>
            </div>

            <ol
              className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
              aria-label="AI policy issues tracked in this edition"
            >
              {issues.map((entry) => (
                <li key={entry.issue.id}>
                  <Link
                    href={`/issue/${entry.issue.slug}`}
                    className="group block h-full rounded-lg border border-border bg-bg-surface p-6 md:p-7 transition-all duration-200 hover:border-navy hover:shadow-md hover:-translate-y-0.5"
                  >
                    <h3 className="font-display text-[20px] md:text-[22px] font-semibold leading-[1.25] text-text-primary group-hover:text-accent-primary transition-colors tracking-[-0.01em] mb-2">
                      {entry.issue.display_name}
                    </h3>
                    <p className="text-[14px] leading-[1.6] text-text-secondary mb-4">
                      {entry.issue.description}
                    </p>
                    <p className="text-[13px] text-text-muted">
                      {entry.position_count}{" "}
                      {entry.position_count === 1 ? "candidate" : "candidates"}{" "}
                      on record
                      <span
                        aria-hidden="true"
                        className="ml-2 text-amber transition-transform duration-200 group-hover:translate-x-0.5 inline-block"
                        style={{ color: "var(--amber)" }}
                      >
                        →
                      </span>
                    </p>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ============================================================
          Key Congressional Races — featured state cards
         ============================================================ */}
      {featuredRaces.length > 0 && (
        <section className="px-4 py-16 md:py-24 bg-bg-elevated">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="kicker mb-3">Featured Races</p>
                <h2 className="font-display text-display-md font-bold text-text-primary">
                  Key Congressional Races
                </h2>
                <p className="mt-3 text-base text-text-secondary max-w-xl">
                  States with current candidate data. Data is being collected on an ongoing basis.
                </p>
              </div>
              <Link href="/map" className="btn-ghost-dark self-start md:self-auto">
                See all states on the map →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {featuredRaces.map((state) => (
                <Link
                  key={state.abbreviation}
                  href={`/state/${state.slug}`}
                  className="race-card"
                >
                  <div className="race-card-abbr">{state.abbreviation}</div>
                  <div className="race-card-name">{state.name}</div>
                  <div className="race-card-meta">
                    {state.race_count}{" "}
                    {state.race_count === 1 ? "race" : "races"}
                  </div>
                  <div className="race-card-arrow" aria-hidden="true">
                    →
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
