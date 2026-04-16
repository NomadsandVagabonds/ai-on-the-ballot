import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCandidateBySlug } from "@/lib/queries/candidates";
import { PartyBadge } from "@/components/shared/PartyBadge";
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

function InitialAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-bg-elevated flex items-center justify-center shrink-0"
      aria-hidden="true"
    >
      <span className="font-display text-3xl md:text-4xl font-bold text-text-secondary">
        {initials}
      </span>
    </div>
  );
}

export default async function CandidatePage({ params }: CandidatePageProps) {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(slug);

  if (!candidate) {
    notFound();
  }

  const aiCommittees = candidate.committee_assignments.filter(
    isAIRelevantCommittee
  );
  const otherCommittees = candidate.committee_assignments.filter(
    (c) => !isAIRelevantCommittee(c)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Layer 1: Identity Card */}
      <section className="bg-bg-surface border border-border rounded-lg p-6 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Photo */}
          {candidate.photo_url ? (
            <img
              src={candidate.photo_url}
              alt={candidate.name}
              className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover shrink-0"
            />
          ) : (
            <InitialAvatar name={candidate.name} />
          )}

          <div className="flex-1 min-w-0">
            {/* Name + party */}
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary">
                {candidate.name}
              </h1>
              <PartyBadge party={candidate.party} />
              {candidate.is_incumbent && (
                <span className="inline-flex items-center rounded-full bg-accent-gold/10 px-2.5 py-0.5 text-xs font-semibold text-accent-gold">
                  Incumbent
                </span>
              )}
            </div>

            {/* Office */}
            <p className="text-text-secondary">
              {candidate.office_sought}
            </p>

            {/* Committees */}
            {candidate.committee_assignments.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1.5">
                  Committee Assignments
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {aiCommittees.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center rounded-full bg-accent-primary/10 px-2.5 py-1 text-xs font-medium text-accent-primary"
                      title="AI-relevant committee"
                    >
                      {c}
                    </span>
                  ))}
                  {otherCommittees.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center rounded-full bg-bg-elevated px-2.5 py-1 text-xs text-text-secondary"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Last updated */}
            <p className="mt-3 text-xs font-mono text-text-muted">
              Last updated{" "}
              {new Date(candidate.updated_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Layer 2: Position Grid */}
      <section className="mb-8">
        <PositionGrid positions={candidate.positions} />
      </section>

      {/* Layer 3: Legislative Activity */}
      <section>
        <h3 className="font-display text-lg font-semibold text-text-primary mb-4">
          Legislative Activity
        </h3>
        <LegislativeActivity activities={candidate.legislative_activity} />
      </section>
    </div>
  );
}
