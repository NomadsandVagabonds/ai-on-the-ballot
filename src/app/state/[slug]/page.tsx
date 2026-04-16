import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getStateData } from "@/lib/queries/states";
import { stateSlugToName } from "@/lib/utils/states";
import { chamberLabel } from "@/lib/utils/stance";
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

export default async function StatePage({ params }: StatePageProps) {
  const { slug } = await params;
  const stateData = await getStateData(slug);

  if (!stateData) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      {/* State header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
          {stateData.name}
        </h1>
        <p className="mt-1 text-text-secondary">
          {stateData.races.length} tracked race
          {stateData.races.length === 1 ? "" : "s"} &middot;{" "}
          {stateData.candidate_count} candidate
          {stateData.candidate_count === 1 ? "" : "s"}
        </p>
      </div>

      {/* Races */}
      {stateData.races.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-muted text-lg">
            No tracked races in {stateData.name} yet.
          </p>
          <p className="text-text-muted text-sm mt-2">
            Check back soon — we are expanding coverage.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {stateData.races.map((race) => (
            <section key={race.id}>
              {/* Race heading */}
              <div className="flex flex-wrap items-baseline gap-3 mb-4">
                <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary">
                  {chamberLabel(race.chamber)}
                  {race.district
                    ? ` — District ${race.district}`
                    : ""}
                </h2>
                {race.race_type === "special" && (
                  <span className="inline-flex items-center rounded-full bg-accent-gold/10 px-2.5 py-0.5 text-xs font-semibold text-accent-gold">
                    Special Election
                  </span>
                )}
              </div>

              {/* Candidate cards */}
              {race.candidates.length === 0 ? (
                <p className="text-text-muted text-sm">
                  No candidates tracked for this race yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {race.candidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                    />
                  ))}
                </div>
              )}

              {/* Compare link */}
              {race.candidates.length >= 2 && (
                <div className="mt-4">
                  <Link
                    href={`/race/${race.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-accent-primary hover:underline"
                  >
                    Compare Candidates
                    <svg
                      className="h-4 w-4"
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
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
