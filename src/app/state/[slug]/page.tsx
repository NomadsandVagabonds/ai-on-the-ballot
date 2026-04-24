import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getStateData } from "@/lib/queries/states";
import { stateSlugToName } from "@/lib/utils/states";
import { chamberLabel } from "@/lib/utils/stance";
import { capByFundraising } from "@/lib/utils/ranking";
import { CandidateCard } from "@/components/race/CandidateCard";
import { StateOutline } from "@/components/state/StateOutline";

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
  // Pre-build state pages for every state covered in the v3 tracker.
  const launchStates = [
    "arkansas",
    "illinois",
    "mississippi",
    "north-carolina",
    "texas",
  ];
  return launchStates.map((slug) => ({ slug }));
}

export default async function StatePage({ params }: StatePageProps) {
  const { slug } = await params;
  const stateData = await getStateData(slug);

  if (!stateData) {
    notFound();
  }

  const [firstRace, ...restRaces] = stateData.races;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 pb-20 md:pt-10 md:pb-24">
      {/* ============================================================
          State header
            Left column:  state name (top) ⇢ first race title (bottom)
            Right column: silhouette ⇢ tally boxes
          items-stretch + flex-1 spacer makes the first race's title
          bottom-align with the tally boxes, so the hairline rule below
          slots in just under both columns with no dead space.
         ============================================================ */}
      <header className="grid grid-cols-[1fr_auto] items-stretch gap-x-6 md:gap-x-8 mb-4">
        <div className="min-w-0 flex flex-col">
          <h1 className="font-display text-[2.75rem] md:text-[3.75rem] font-bold text-text-primary leading-[0.98] tracking-[-0.015em]">
            {stateData.name}
          </h1>

          <dl className="mt-4 flex items-start gap-8">
            <div>
              <dt className="text-[11px] font-medium tracking-[0.08em] uppercase text-text-muted mb-1.5">
                Races
              </dt>
              <dd className="font-display text-2xl md:text-3xl font-bold text-text-primary tabular-nums leading-none">
                {stateData.races.length}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium tracking-[0.08em] uppercase text-text-muted mb-1.5">
                Candidates
              </dt>
              <dd className="font-display text-2xl md:text-3xl font-bold text-text-primary tabular-nums leading-none">
                {stateData.candidate_count}
              </dd>
            </div>
          </dl>

          {/* Delineator between tally and the first race title */}
          <div className="h-0.5 bg-border-strong mt-5" aria-hidden="true" />

          {/* Pushes the first race title to the bottom of the left column */}
          <div className="flex-1 min-h-4" aria-hidden="true" />

          {firstRace && (
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl md:text-[1.75rem] font-bold text-text-primary leading-tight">
                {chamberLabel(firstRace.chamber)}
                {firstRace.district ? ` — District ${firstRace.district}` : ""}
              </h2>

              {firstRace.race_type === "special" && (
                <span className="text-xs font-semibold tracking-[0.08em] uppercase text-accent-gold">
                  Special Election
                </span>
              )}
            </div>
          )}
        </div>

        {/* State silhouette — right column */}
        <div className="shrink-0 flex items-start justify-end">
          <div className="w-20 sm:w-24 md:w-[130px] aspect-square">
            <StateOutline
              abbr={stateData.abbreviation}
              label={stateData.name}
              size={130}
              fill="#5B7B6A"
            />
          </div>
        </div>
      </header>

      {/* Full-width hairline under both columns */}
      {firstRace && <div className="h-px bg-border mb-5" />}

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
        <div className="space-y-10">
          {/* First race — title already rendered in the header above.
              This section just shows its cards. */}
          {firstRace && (
            <FirstRaceCards race={firstRace} />
          )}

          {restRaces.map((race) => {
            const { shown: visibleCandidates, hidden: hiddenCount } =
              capByFundraising(race.candidates);

            return (
              <section key={race.id}>
                {/* Race title — chamber + (district) */}
                <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
                  <h2 className="font-display text-2xl md:text-[1.75rem] font-bold text-text-primary leading-tight">
                    {chamberLabel(race.chamber)}
                    {race.district ? ` — District ${race.district}` : ""}
                  </h2>

                  {race.race_type === "special" && (
                    <span className="text-xs font-semibold tracking-[0.08em] uppercase text-accent-gold">
                      Special Election
                    </span>
                  )}
                </div>

                <div className="h-px bg-border mb-5" />

                {/* Candidate cards */}
                {race.candidates.length === 0 ? (
                  <p className="italic text-text-muted">
                    No candidates tracked for this race yet.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {visibleCandidates.map((candidate) => (
                        <CandidateCard
                          key={candidate.id}
                          candidate={candidate}
                        />
                      ))}
                    </div>

                    {race.candidates.length >= 2 && (
                      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <Link
                          href={`/race/${race.slug}`}
                          className="group inline-flex items-center justify-center gap-2.5 bg-accent-primary text-white px-6 py-3 rounded-sm border border-accent-primary hover:bg-accent-primary-hover hover:border-accent-primary-hover transition-colors shadow-[var(--shadow-sm)]"
                        >
                          <span className="font-display text-[17px] font-semibold tracking-[-0.005em]">
                            Compare the {visibleCandidates.length}{" "}
                            {visibleCandidates.length === 1
                              ? "candidate"
                              : "candidates"}
                          </span>
                          <span
                            aria-hidden="true"
                            className="font-mono text-lg leading-none transition-transform duration-200 group-hover:translate-x-0.5"
                          >
                            →
                          </span>
                        </Link>
                        {hiddenCount > 0 && (
                          <p className="text-sm text-text-muted sm:text-right">
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

      {/* Back link */}
      <div className="mt-16 pt-6 border-t border-border">
        <Link
          href="/map"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent-primary transition-colors"
        >
          <span aria-hidden="true">←</span>
          All states
        </Link>
      </div>
    </div>
  );
}

/** Renders the first race's card grid (title is already in the header). */
function FirstRaceCards({
  race,
}: {
  race: Awaited<ReturnType<typeof getStateData>> extends infer T
    ? T extends { races: Array<infer R> }
      ? R
      : never
    : never;
}) {
  if (!race) return null;
  const { shown: visibleCandidates, hidden: hiddenCount } = capByFundraising(
    race.candidates
  );

  if (race.candidates.length === 0) {
    return (
      <p className="italic text-text-muted">
        No candidates tracked for this race yet.
      </p>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visibleCandidates.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>

      {race.candidates.length >= 2 && (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href={`/race/${race.slug}`}
            className="group inline-flex items-center justify-center gap-2.5 bg-accent-primary text-white px-6 py-3 rounded-sm border border-accent-primary hover:bg-accent-primary-hover hover:border-accent-primary-hover transition-colors shadow-[var(--shadow-sm)]"
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
            <p className="text-sm text-text-muted sm:text-right">
              {hiddenCount} more{" "}
              {hiddenCount === 1 ? "candidate" : "candidates"} not shown.
              <br className="hidden sm:inline" />
              Top five ranked by reported fundraising.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
