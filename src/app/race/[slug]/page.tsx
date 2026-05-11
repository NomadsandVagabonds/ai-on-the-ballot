import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getRaceBySlug } from "@/lib/queries/races";
import { getComparisonData } from "@/lib/queries/positions";
import { chamberLabel } from "@/lib/utils/stance";
import { parseRaceSlug } from "@/lib/utils/slugs";
import { STATE_MAP, stateAbbrToSlug } from "@/lib/utils/states";
import { capByFundraising } from "@/lib/utils/ranking";
import { ComparisonGrid } from "@/components/race/ComparisonGrid";

export const revalidate = 1800;

interface RacePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: RacePageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseRaceSlug(slug);
  if (!parsed) return { title: "Race Not Found" };

  const stateName = STATE_MAP[parsed.stateAbbr] ?? parsed.stateAbbr;
  const chamber =
    parsed.chamber === "sen"
      ? "Senate"
      : parsed.chamber === "house"
        ? "House"
        : "Governor";
  const district = parsed.district ? ` District ${parsed.district}` : "";

  return {
    title: `${stateName} ${chamber}${district}, ${parsed.year}`,
    description: `${stateName} ${chamber}${district} candidates and their AI policy positions.`,
  };
}

export default async function RacePage({ params }: RacePageProps) {
  const { slug } = await params;
  const race = await getRaceBySlug(slug);

  if (!race) {
    notFound();
  }

  const { shown: displayedCandidates, hidden: hiddenCandidateCount } =
    capByFundraising(race.candidates);
  const displayedIds = new Set(displayedCandidates.map((c) => c.id));
  const candidateIds = displayedCandidates.map((c) => c.id);
  const fullComparisonData = await getComparisonData(candidateIds);
  const comparisonData = fullComparisonData.map((row) => ({
    ...row,
    positions: row.positions.filter((p) => displayedIds.has(p.candidate_id)),
  }));

  const stateName = STATE_MAP[race.state] ?? race.state;
  const stateSlug = stateAbbrToSlug(race.state);

  const chamber = chamberLabel(race.chamber);
  const districtLabel = race.district ? ` District ${race.district}` : "";
  const candCount = displayedCandidates.length;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 pb-20 md:pt-12 md:pb-24">
      {/* Back link — Lora treatment, state name as the anchor */}
      <Link
        href={`/state/${stateSlug}`}
        className="group inline-flex items-baseline gap-2 mb-8 text-text-secondary hover:text-accent-primary transition-colors"
      >
        <span aria-hidden="true" className="font-mono text-base">
          ←
        </span>
        <span className="font-display text-base">
          Back to{" "}
          <span className="font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
            {stateName}
          </span>
        </span>
      </Link>

      {/* ============================================================
          Compact header — special-election chip · headline · meta
         ============================================================ */}
      <header className="mb-8">
        {race.race_type === "special" && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold text-accent-gold border border-accent-gold/60 bg-amber-50/40">
              Special Election
            </span>
          </div>
        )}

        <h1 className="font-display text-[2.5rem] md:text-[3.25rem] font-bold text-text-primary leading-[1.05] tracking-[-0.015em]">
          {chamber}
          {districtLabel}
        </h1>

        <p className="cand-meta mt-3">
          {stateName} · {race.election_year}
          {candCount > 0 && (
            <>
              {" · "}
              <span className="font-mono tabular-nums text-text-primary">
                {candCount}
              </span>{" "}
              candidate{candCount === 1 ? "" : "s"}
              {hiddenCandidateCount > 0 && (
                <span className="text-text-muted">
                  {" "}of {race.candidates.length}
                </span>
              )}
            </>
          )}
        </p>

        {hiddenCandidateCount > 0 && (
          <p className="mt-2 text-sm text-text-muted">
            Top five shown, ranked by reported fundraising.
          </p>
        )}
      </header>

      {/* ============================================================
          Comparison instrument
         ============================================================ */}
      {candCount === 0 ? (
        <div className="py-14 text-center">
          <p className="font-display text-lg text-text-secondary">
            No candidates tracked in this race yet.
          </p>
        </div>
      ) : (
        <ComparisonGrid
          candidates={displayedCandidates}
          comparisonData={comparisonData}
        />
      )}

      {/* Methodology — full-width strip below the comparison instrument */}
      <aside className="mt-14 md:mt-16 rounded-md border border-border bg-bg-elevated px-6 py-5 md:px-7 md:py-6">
        <p className="text-xs font-medium tracking-[0.08em] uppercase text-text-muted mb-2">
          Methodology
        </p>
        <p className="text-sm leading-relaxed text-text-secondary">
          Each candidate&rsquo;s positions are drawn from public statements, votes, bills, and interviews. Every stance cited.{" "}
          <Link
            href="/about#methodology"
            className="text-accent-primary hover:text-accent-primary-hover font-medium underline underline-offset-2"
          >
            Read the full methodology
          </Link>
          .
        </p>
      </aside>

      {/* Return link — mirrors the top back link, centered for closure */}
      <div className="mt-12 text-center">
        <Link
          href={`/state/${stateSlug}`}
          className="group inline-flex items-baseline gap-2 text-text-secondary hover:text-accent-primary transition-colors"
        >
          <span aria-hidden="true" className="font-mono text-base">
            ←
          </span>
          <span className="font-display text-base">
            Return to{" "}
            <span className="font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
              {stateName}
            </span>
          </span>
        </Link>
      </div>

    </div>
  );
}
