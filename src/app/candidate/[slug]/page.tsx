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

function getPartyColor(party: string): string {
  switch (party.toLowerCase()) {
    case "democrat":
    case "democratic":
      return "bg-party-dem";
    case "republican":
      return "bg-party-rep";
    default:
      return "bg-party-ind";
  }
}

function InitialAvatar({ name, party }: { name: string; party: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`h-28 w-28 md:h-36 md:w-36 rounded-2xl ${getPartyColor(party)} flex items-center justify-center shrink-0`}
      aria-hidden="true"
    >
      <span className="font-display text-3xl md:text-4xl font-bold text-white/90">
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
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">
      {/* Layer 1: Identity Card */}
      <section className="card-elevated p-6 md:p-8 mb-10">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Photo */}
          {candidate.photo_url ? (
            <img
              src={candidate.photo_url}
              alt={candidate.name}
              className="h-28 w-28 md:h-36 md:w-36 rounded-2xl object-cover shrink-0 shadow-[var(--shadow-sm)]"
            />
          ) : (
            <InitialAvatar name={candidate.name} party={candidate.party} />
          )}

          <div className="flex-1 min-w-0">
            {/* Name + party */}
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                {candidate.name}
              </h1>
              <PartyBadge party={candidate.party} />
              {candidate.is_incumbent && (
                <span className="inline-flex items-center rounded-full bg-accent-gold/10 px-2.5 py-0.5 text-xs font-semibold text-accent-gold border border-accent-gold/20">
                  Incumbent
                </span>
              )}
            </div>

            {/* Office */}
            <p className="text-text-secondary text-lg">
              {candidate.office_sought}
            </p>

            {/* Committees */}
            {candidate.committee_assignments.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-mono text-text-muted uppercase tracking-[0.15em] mb-2">
                  Committee Assignments
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {aiCommittees.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center rounded-full bg-accent-primary/10 border border-accent-primary/20 px-3 py-1 text-xs font-medium text-accent-primary"
                      title="AI-relevant committee"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-primary mr-1.5" aria-hidden="true" />
                      {c}
                    </span>
                  ))}
                  {otherCommittees.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center rounded-full bg-bg-elevated px-3 py-1 text-xs text-text-secondary"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Last updated */}
            <p className="mt-4 text-[10px] font-mono text-text-muted uppercase tracking-wider">
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
      <section className="mb-10">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary shrink-0">
            AI Policy Positions
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        <PositionGrid positions={candidate.positions} />
      </section>

      {/* Layer 3: Legislative Activity */}
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
