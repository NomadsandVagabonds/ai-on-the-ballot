import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCandidateBySlug } from "@/lib/queries/candidates";
import { STATE_MAP, stateAbbrToSlug } from "@/lib/utils/states";
import {
  PositionGrid,
  PositionOverview,
} from "@/components/candidate/PositionGrid";
import { LegislativeActivity } from "@/components/candidate/LegislativeActivity";
import { PartyBadge } from "@/components/shared/PartyBadge";

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
    description: `${candidate.name}'s positions on AI policy issues for the ${candidate.office_sought}.`,
  };
}

function officeLabel(office: string): string {
  const lower = office.toLowerCase();
  if (lower.includes("senate")) return "U.S. Senate";
  if (lower.includes("house") || lower.includes("representative"))
    return "U.S. House";
  if (lower.includes("governor")) return "Governor";
  return office;
}

export default async function CandidatePage({ params }: CandidatePageProps) {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(slug);

  if (!candidate) {
    notFound();
  }

  const stateName = STATE_MAP[candidate.state] ?? candidate.state;
  const office = officeLabel(candidate.office_sought);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 pb-20 md:pt-12 md:pb-24">
      {/* Back link */}
      <Link
        href={`/state/${stateAbbrToSlug(candidate.state)}`}
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-primary transition-colors mb-6"
      >
        <span aria-hidden="true">←</span>
        Back to {stateName}
      </Link>

      {/* ============================================================
          Compact header — party + incumbent · name · meta
         ============================================================ */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <PartyBadge party={candidate.party} size="md" />
          {candidate.is_incumbent && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold text-accent-gold border border-accent-gold/60 bg-amber-50/40">
              Incumbent
            </span>
          )}
        </div>

        <h1 className="font-display text-[2.5rem] md:text-[3.25rem] font-bold text-text-primary leading-[1.05] tracking-[-0.015em]">
          {candidate.name}
        </h1>

        <p className="cand-meta mt-3">
          {office} · {stateName}
        </p>
      </header>

      {/* ============================================================
          Overview bar — all topics + stance at a glance
         ============================================================ */}
      {candidate.positions.length > 0 && (
        <section className="mb-10">
          <PositionOverview positions={candidate.positions} />
        </section>
      )}

      {/* ============================================================
          Positions — compact cards, color-coded by stance
         ============================================================ */}
      <section>
        <PositionGrid positions={candidate.positions} />
      </section>

      {/* ============================================================
          Legislative activity — only when data exists
         ============================================================ */}
      {candidate.legislative_activity.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary mb-4">
            Legislative Activity
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Bills, votes, hearings, and public statements.
          </p>
          <LegislativeActivity activities={candidate.legislative_activity} />
        </section>
      )}

      {/* ============================================================
          See-an-error CTA box — correction + clarification shortcuts
         ============================================================ */}
      <aside className="mt-16 rounded-lg bg-bg-elevated border border-border px-6 py-6 md:px-8 md:py-7">
        <p className="text-[15px] leading-[1.6] text-text-primary mb-5">
          <strong className="font-semibold">See an error?</strong>{" "}
          <span className="text-text-secondary">
            If candidate information is out of date or incorrectly coded, you can submit a correction for review.
          </span>
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/corrections#correction"
            className="inline-flex items-center justify-center rounded-lg bg-navy text-white font-medium px-5 py-2.5 text-sm transition-colors hover:bg-[var(--navy-hover)]"
          >
            Submit a correction
          </Link>
          <Link
            href="/corrections#clarification"
            className="inline-flex items-center justify-center rounded-lg bg-transparent text-text-primary font-medium px-5 py-2.5 text-sm border border-border-strong transition-colors hover:border-navy hover:bg-bg-surface"
          >
            Candidate clarification form
          </Link>
        </div>
      </aside>

      {/* Footer links */}
      <div className="mt-10 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-3 text-sm text-text-muted">
        <p>
          Last updated{" "}
          {new Date(candidate.updated_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
        <Link
          href="/about#methodology"
          className="hover:text-accent-primary transition-colors"
        >
          Methodology
        </Link>
      </div>
    </div>
  );
}
