import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRaceBySlug } from "@/lib/queries/races";
import { getComparisonData } from "@/lib/queries/positions";
import { chamberLabel } from "@/lib/utils/stance";
import { parseRaceSlug } from "@/lib/utils/slugs";
import { STATE_MAP } from "@/lib/utils/states";
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

export default async function RacePage({ params }: RacePageProps) {
  const { slug } = await params;
  const race = await getRaceBySlug(slug);

  if (!race) {
    notFound();
  }

  const candidateIds = race.candidates.map((c) => c.id);
  const comparisonData = await getComparisonData(candidateIds);

  const stateName = STATE_MAP[race.state] ?? race.state;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      {/* Race header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary">
          {chamberLabel(race.chamber)}
          {race.district ? ` — District ${race.district}` : ""}
        </h1>
        <p className="mt-1 text-text-secondary">
          {stateName} &middot; {race.election_year}
          {race.race_type === "special" && (
            <span className="ml-2 inline-flex items-center rounded-full bg-accent-gold/10 px-2 py-0.5 text-xs font-semibold text-accent-gold">
              Special Election
            </span>
          )}
        </p>
      </div>

      {/* Comparison grid */}
      {race.candidates.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-muted text-lg">
            No candidates tracked for this race yet.
          </p>
        </div>
      ) : (
        <ComparisonGrid
          candidates={race.candidates}
          comparisonData={comparisonData}
        />
      )}
    </div>
  );
}
