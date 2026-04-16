import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCandidateBySlug } from "@/lib/queries/candidates";
import { partyLabel } from "@/lib/utils/stance";
import { PositionGrid } from "@/components/candidate/PositionGrid";
import { LegislativeActivity } from "@/components/candidate/LegislativeActivity";

export const revalidate = 1800;

interface CandidatePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CandidatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(slug);
  if (!candidate) return { title: "Candidate Not Found" };

  return {
    title: candidate.name,
    description: `${candidate.name}'s positions on AI policy issues — ${candidate.office_sought}.`,
  };
}

const AI_COMMITTEE_KEYWORDS = [
  "artificial intelligence",
  "science",
  "technology",
  "commerce",
  "judiciary",
  "intelligence",
  "homeland security",
];

function isAIRelevantCommittee(name: string): boolean {
  const lower = name.toLowerCase();
  return AI_COMMITTEE_KEYWORDS.some((kw) => lower.includes(kw));
}

export default async function CandidatePage({ params }: CandidatePageProps) {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(slug);

  if (!candidate) {
    notFound();
  }

  const party = partyLabel(candidate.party);
  const aiCommittees = candidate.committee_assignments.filter(
    isAIRelevantCommittee
  );
  const otherCommittees = candidate.committee_assignments.filter(
    (c) => !isAIRelevantCommittee(c)
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      {/* Identity Section — no containing box, typography-driven */}
      <header className="mb-12">
        {/* Photo (small, circular, optional) */}
        <div className="flex items-start gap-5 mb-1">
          {candidate.photo_url && (
            <img
              src={candidate.photo_url}
              alt=""
              className="h-16 w-16 rounded-full object-cover shrink-0 mt-1"
            />
          )}
          <div className="min-w-0 flex-1">
            {/* Name: the dominant element */}
            <h1 className="font-display text-display-lg font-bold text-text-primary tracking-tight">
              {candidate.name}
            </h1>

            {/* Party + office + incumbent as single styled line */}
            <p className="text-base text-text-secondary mt-2">
              {party}
              <span className="text-text-muted"> &middot; </span>
              {candidate.office_sought}
              {candidate.is_incumbent && (
                <>
                  <span className="text-text-muted"> &middot; </span>
                  <span className="text-accent-gold font-medium">Incumbent</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Committees */}
        {candidate.committee_assignments.length > 0 && (
          <div className="mt-6">
            <p className="text-xs text-text-muted mb-2">Committees</p>
            <ul className="space-y-1">
              {aiCommittees.map((c) => (
                <li key={c} className="text-sm text-text-primary flex items-center gap-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-accent-secondary shrink-0"
                    aria-hidden="true"
                    title="AI-relevant committee"
                  />
                  {c}
                </li>
              ))}
              {otherCommittees.map((c) => (
                <li key={c} className="text-sm text-text-secondary">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Last updated */}
        <p className="mt-5 text-[10px] font-mono text-text-muted uppercase tracking-wider">
          Last updated{" "}
          {new Date(candidate.updated_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>

        <div className="h-px bg-border mt-6" />
      </header>

      {/* Positions Section */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary shrink-0">
            AI Policy Positions
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        <PositionGrid positions={candidate.positions} />
      </section>

      {/* Legislative Activity Section */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary shrink-0">
            Legislative Activity
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        <LegislativeActivity activities={candidate.legislative_activity} />
      </section>
    </div>
  );
}
