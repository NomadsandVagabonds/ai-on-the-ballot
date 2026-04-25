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
  const chamber = parsed.chamber === "sen" ? "Senate" : parsed.chamber === "house" ? "House" : "Governor";
  const district = parsed.district ? ` District ${parsed.district}` : "";

  return {
    title: `${stateName} ${chamber}${district} — ${parsed.year}`,
    description: `Compare AI policy positions of candidates in the ${stateName} ${chamber}${district} race for ${parsed.year}.`,
  };
}

function buildRaceDek(candidateCount: number, issueCount: number, chamber: string) {
  const chamberPhrase =
    chamber === "senate" ? "Senate seat" : chamber === "house" ? "House seat" : "governorship";
  if (candidateCount === 0) {
    return `A contested ${chamberPhrase}. Record being built in public.`;
  }
  return `${candidateCount} candidate${candidateCount === 1 ? "" : "s"}, ${issueCount} AI issue${issueCount === 1 ? "" : "s"}. Where each stands, in their own words.`;
}

export default async function RacePage({ params }: RacePageProps) {
  const { slug } = await params;
  const race = await getRaceBySlug(slug);

  if (!race) {
    notFound();
  }

  // Cap the visible field at the top 5 by reported fundraising so the
  // comparison stays legible — dozens of fringe filers otherwise bury
  // the serious contenders. Both the candidate list and the position
  // matrix are filtered, so the grid columns and stance cells stay in
  // sync.
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

  // Compute a sourced-percentage tally across the visible comparison matrix.
  const totalCells = comparisonData.reduce(
    (n, row) => n + row.positions.length,
    0
  );
  const sourcedCells = comparisonData.reduce(
    (n, row) => n + row.positions.filter((p) => !!p.source_url).length,
    0
  );
  const sourcedPct =
    totalCells === 0 ? 0 : Math.round((sourcedCells / totalCells) * 100);

  const chamber = chamberLabel(race.chamber);
  const districtLabel = race.district ? ` — District ${race.district}` : "";
  const kickerLocation =
    race.state +
    (race.district ? `-${String(race.district).padStart(2, "0")}` : "");

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 md:pt-14 md:pb-24">
      {/* ============================================================
          Editorial header — kicker · headline · dek · byline | tally
         ============================================================ */}
      <header className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6 mb-10 md:mb-14">
        <div className="md:col-span-8">
          <p className="kicker mb-4">
            Race &middot; {kickerLocation} &middot; {race.election_year}
          </p>
          <h1 className="font-display text-display-lg font-bold text-text-primary">
            {chamber}
            {districtLabel}
          </h1>
          <p className="dek mt-4">
            {buildRaceDek(displayedCandidates.length, comparisonData.length, race.chamber)}
          </p>
          <p className="byline mt-5">
            {stateName}
            {race.race_type === "special" && (
              <>
                {" "}
                &middot;{" "}
                <span className="text-accent-gold">Special Election</span>
              </>
            )}
            {hiddenCandidateCount > 0 && (
              <>
                {" "}
                &middot;{" "}
                <span className="text-text-secondary normal-case tracking-normal">
                  Top five shown, ranked by reported fundraising
                </span>
              </>
            )}
          </p>
        </div>

        {/* Tally block — mono numerals, hairline rules top/bottom */}
        <aside className="md:col-span-4 md:pl-8 md:border-l md:border-border self-end">
          <div className="rule-hair" aria-hidden="true" />
          <dl className="grid grid-cols-3 gap-4 py-4">
            <div>
              <dt className="marginalia-label">Cands.</dt>
              <dd className="font-mono text-2xl font-bold text-text-primary tabular-nums">
                {displayedCandidates.length}
                {hiddenCandidateCount > 0 && (
                  <span className="text-base text-text-muted">
                    /{race.candidates.length}
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="marginalia-label">Issues</dt>
              <dd className="font-mono text-2xl font-bold text-text-primary tabular-nums">
                {comparisonData.length}
              </dd>
            </div>
            <div>
              <dt className="marginalia-label">Sourced</dt>
              <dd className="font-mono text-2xl font-bold text-text-primary tabular-nums">
                {sourcedPct}
                <span className="text-base text-text-muted">%</span>
              </dd>
            </div>
          </dl>
          <div className="rule-hair" aria-hidden="true" />
        </aside>
      </header>

      {/* Rule ornament between header and instrument */}
      <div className="rule-ornament" aria-hidden="true">
        <span>&#10086;</span>
      </div>

      {/* ============================================================
          Comparison instrument
         ============================================================ */}
      {displayedCandidates.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-display text-2xl text-text-secondary">
            No candidates tracked in this race yet.
          </p>
        </div>
      ) : (
        <ComparisonGrid
          candidates={displayedCandidates}
          comparisonData={comparisonData}
        />
      )}

      {/* Methodology callout */}
      <aside className="callout-box mt-14 md:mt-20 max-w-3xl">
        <p className="kicker mb-2">Methodology</p>
        <p>
          Positions drawn from public statements, votes, bills, and interviews.
          Every stance cited. All candidates treated identically regardless of
          party.{" "}
          <Link href="/about" className="link-editorial">
            Read the full methodology
          </Link>
          .
        </p>
      </aside>

      {/* Closing ornament + return link */}
      <div className="rule-ornament mt-10" aria-hidden="true">
        <span>&#10086;</span>
      </div>
      <div className="text-center">
        <Link
          href={`/state/${stateSlug}`}
          className="byline inline-flex items-center gap-2 text-text-secondary hover:text-accent-primary transition-colors"
        >
          <span aria-hidden="true">&larr;</span>
          Return to {stateName}
        </Link>
      </div>
    </div>
  );
}
