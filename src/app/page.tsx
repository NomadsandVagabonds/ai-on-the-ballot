import Link from "next/link";
import { getAllStatesForMap } from "@/lib/queries/states";
import { getAllIssuesWithCounts } from "@/lib/queries/issues";
import { AnimatedCounter } from "@/components/home/AnimatedCounter";
import { HeroZipInput } from "./HeroZipInput";

export const revalidate = 1800;

/** Number of states to feature on the homepage. */
const FEATURED_COUNT = 5;

export default async function Home() {
  const [states, issues] = await Promise.all([
    getAllStatesForMap(),
    getAllIssuesWithCounts(),
  ]);

  const totalRaces = states.reduce((sum, s) => sum + s.race_count, 0);
  const statesWithData = states.filter((s) => s.has_data).length;

  // Auto-select the top states by tracked race count. Keeps the grid
  // full + self-updates as new state coverage lands in the dataset.
  const featuredRaces = [...states]
    .filter((s) => s.has_data)
    .sort((a, b) => b.race_count - a.race_count || a.name.localeCompare(b.name))
    .slice(0, FEATURED_COUNT);

  return (
    <div>
      {/* ============================================================
          Hero — navy landing with amber CTAs + animated stats
         ============================================================ */}
      <section className="hero-navy">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 pb-16 md:pt-20 md:pb-20">
          {/* Top kicker band — spans full width so both columns share a
              single top datum line. Thin amber hairline below establishes
              the print-magazine "masthead" feel. */}
          <div className="mb-10 md:mb-14">
            <p className="hero-eyebrow mb-3">
              2026 U.S. Congressional Elections
            </p>
            <div className="h-px bg-amber/30" aria-hidden="true" />
          </div>

          {/* Hero grid — 3 rows on lg+ so the card can span the sub + CTA
              rows, bottom-aligning precisely with the CTA baseline while the
              headline lives alone above. Two strong anchor lines:
                • Top:    h1 top-cap  aligns with row 1 start
                • Bottom: card bottom aligns with CTA baseline (row 3 end) */}
          <div
            className="grid gap-y-6 lg:gap-x-16 lg:gap-y-0 lg:grid-cols-[1fr_minmax(0,360px)] lg:grid-rows-[auto_auto_auto] items-start"
          >
            <h1 className="hero-h1 lg:col-start-1 lg:row-start-1">
              Where do your candidates
              <br />
              stand on AI?
            </h1>

            <p className="hero-sub lg:col-start-1 lg:row-start-2 lg:mt-6">
              Nonpartisan research tracking where U.S. candidates running for Congress in the midterm elections stand on artificial intelligence policy.
            </p>

            <div className="flex flex-wrap items-center gap-3 lg:col-start-1 lg:row-start-3 lg:mt-8">
              <Link href="/map" className="btn-amber">
                Explore the Map
              </Link>
              <Link href="/about#methodology" className="btn-ghost-light">
                How We Code Positions
              </Link>
            </div>

            {/* Zip card — spans the sub + CTA rows. Top aligns with sub, bottom aligns with CTAs. */}
            <aside className="zip-card w-full lg:col-start-2 lg:row-start-2 lg:row-end-4 lg:justify-self-end lg:self-stretch lg:flex lg:flex-col">
              <p className="zip-card-kicker">Find Your Candidates</p>
              <h2 className="zip-card-title">Who&rsquo;s on your ballot?</h2>
              <p className="zip-card-sub">
                Enter your zip code to see candidates in your district.
              </p>
              <div className="mt-4 lg:mt-auto lg:pt-5">
                <HeroZipInput variant="card-dark" />
              </div>
            </aside>
          </div>

          {/* Stats row — full width below the hero columns */}
          <div className="hero-stats mt-14">
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
                  States with current candidate data. Data is being collected on an ongoing basis in accordance with the state primaries calendar.
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
