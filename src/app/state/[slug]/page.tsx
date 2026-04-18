import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getStateData } from "@/lib/queries/states";
import { stateSlugToName } from "@/lib/utils/states";
import { chamberLabel } from "@/lib/utils/stance";
import { capByFundraising } from "@/lib/utils/ranking";
import { CandidateCard } from "@/components/race/CandidateCard";

export const revalidate = 1800;

interface StatePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: StatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const name = stateSlugToName(slug);
  if (!name) return { title: "State Not Found" };

  return {
    title: name,
    description: `Track where ${name} congressional candidates stand on AI policy issues for the 2026 elections.`,
  };
}

/** Pre-build the 5 launch state pages */
export function generateStaticParams() {
  const launchStates = ["texas", "california", "new-york", "virginia", "colorado"];
  return launchStates.map((slug) => ({ slug }));
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export default async function StatePage({ params }: StatePageProps) {
  const { slug } = await params;
  const stateData = await getStateData(slug);

  if (!stateData) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 pb-20 md:pt-14 md:pb-28">
      {/* ============================================================
          State header — editorial masthead
         ============================================================ */}
      <header className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6 mb-8">
        <div className="md:col-span-8">
          <p className="kicker mb-4">{stateData.abbreviation}</p>
          <h1 className="font-display text-display-xl font-bold text-text-primary leading-[0.98]">
            {stateData.name}
          </h1>
          <p className="dek mt-4">
            {stateData.races.length === 0
              ? `No tracked races in ${stateData.name} yet.`
              : `${stateData.races.length} tracked race${stateData.races.length === 1 ? "" : "s"}, ${stateData.candidate_count} candidate${stateData.candidate_count === 1 ? "" : "s"}, six AI issues on the record.`}
          </p>
        </div>

        {/* Tally rail */}
        <aside className="md:col-span-4 md:pl-8 md:border-l md:border-border self-end">
          <div className="rule-hair" aria-hidden="true" />
          <dl className="grid grid-cols-2 gap-4 py-4">
            <div>
              <dt className="marginalia-label">Races</dt>
              <dd className="font-mono text-2xl font-bold text-text-primary tabular-nums">
                {stateData.races.length}
              </dd>
            </div>
            <div>
              <dt className="marginalia-label">Candidates</dt>
              <dd className="font-mono text-2xl font-bold text-text-primary tabular-nums">
                {stateData.candidate_count}
              </dd>
            </div>
          </dl>
          <div className="rule-hair" aria-hidden="true" />
        </aside>
      </header>

      {/* Ornament */}
      <div className="rule-ornament" aria-hidden="true">
        <span>&#10086;</span>
      </div>

      {/* ============================================================
          Races
         ============================================================ */}
      {stateData.races.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display italic text-xl text-text-secondary">
            No tracked races in {stateData.name} yet.
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {stateData.races.map((race, i) => {
            const { shown: visibleCandidates, hidden: hiddenCount } =
              capByFundraising(race.candidates);

            return (
              <section key={race.id}>
                {/* Race opener — folio + title + meta */}
                <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
                  <div className="flex items-baseline gap-4 min-w-0">
                    <span
                      className="font-display text-[26px] leading-none font-normal text-text-muted shrink-0"
                      aria-hidden="true"
                    >
                      {ROMAN[i] ?? String(i + 1)}
                    </span>
                    <div>
                      <p className="kicker-muted mb-1.5">
                        Race {ROMAN[i] ?? String(i + 1)}
                      </p>
                      <h2 className="font-display text-display-md font-bold text-text-primary leading-tight">
                        {chamberLabel(race.chamber)}
                        {race.district ? ` — District ${race.district}` : ""}
                      </h2>
                    </div>
                  </div>

                  {race.race_type === "special" && (
                    <span className="byline text-accent-gold shrink-0" style={{ margin: 0 }}>
                      Special Election
                    </span>
                  )}
                </div>

                {/* Rule under the opener */}
                <div className="rule-hair mb-6" aria-hidden="true" />

                {/* Candidate cards */}
                {race.candidates.length === 0 ? (
                  <p className="marginalia italic">
                    No candidates tracked for this race yet.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {visibleCandidates.map((candidate) => (
                        <CandidateCard key={candidate.id} candidate={candidate} />
                      ))}
                    </div>

                    {/* Compare CTA — the standout feature, not a ghost link */}
                    {race.candidates.length >= 2 && (
                      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <Link
                          href={`/race/${race.slug}`}
                          className="group inline-flex items-center justify-center gap-2.5 bg-accent-primary text-white px-6 py-3.5 rounded-sm border border-accent-primary hover:bg-accent-primary-hover hover:border-accent-primary-hover focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2 transition-colors shadow-[var(--shadow-sm)]"
                        >
                          <span className="font-display text-[17px] font-semibold tracking-[-0.005em]">
                            Compare the {visibleCandidates.length}{" "}
                            {visibleCandidates.length === 1 ? "candidate" : "candidates"}
                          </span>
                          <span
                            aria-hidden="true"
                            className="font-mono text-lg leading-none transition-transform duration-200 group-hover:translate-x-0.5"
                          >
                            →
                          </span>
                        </Link>
                        {hiddenCount > 0 && (
                          <p
                            className="marginalia text-right sm:text-right"
                            style={{ margin: 0 }}
                          >
                            {hiddenCount} more{" "}
                            {hiddenCount === 1 ? "candidate" : "candidates"} not shown.
                            <br className="hidden sm:inline" />
                            Top five ranked by reported fundraising.
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Closing ornament + return */}
      <div className="rule-ornament mt-16" aria-hidden="true">
        <span>&#10086;</span>
      </div>
      <div className="text-center">
        <Link
          href="/"
          className="byline inline-flex items-center gap-2 text-text-secondary hover:text-accent-primary transition-colors"
          style={{ margin: 0 }}
        >
          <span aria-hidden="true">&larr;</span>
          All states
        </Link>
      </div>
    </div>
  );
}
