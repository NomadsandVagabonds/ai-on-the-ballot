import Link from "next/link";
import type { CandidateSummary } from "@/types/domain";
import { partyLabel } from "@/lib/utils/stance";
import { PartyBadge } from "@/components/shared/PartyBadge";
import { resolveCandidatePhoto } from "@/lib/utils/portrait";

interface CandidateCardProps {
  /** May carry the roster annotation from selectRaceCandidates. */
  candidate: CandidateSummary & { lost_primary?: boolean };
  /** True when the race has primary losers and this candidate advanced to the November ballot. */
  advancing?: boolean;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CandidateCard({ candidate, advancing }: CandidateCardProps) {
  const partyName = partyLabel(candidate.party);
  const portraitSrc = resolveCandidatePhoto(candidate);
  const lost = candidate.lost_primary === true;

  return (
    <Link
      href={`/candidate/${candidate.slug}`}
      className={`group block border rounded-sm p-5 transition-all duration-200 hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2 ${
        lost
          ? "bg-bg-elevated/60 border-border hover:border-border-strong"
          : advancing
            ? "bg-advancing-bg border-advancing-border hover:border-accent-secondary"
            : "bg-bg-surface border-border hover:border-border-strong"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`portrait-frame w-14 h-14 shrink-0 ${
            lost ? "grayscale opacity-50" : ""
          }`}
        >
          {portraitSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={portraitSrc}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="monogram text-base">{initials(candidate.name)}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={lost ? "opacity-50 grayscale" : undefined}>
              <PartyBadge party={candidate.party} size="sm" />
            </span>
            {lost ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm border border-border-strong bg-bg-elevated text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                Lost primary
              </span>
            ) : (
              <span
                className="text-[11px] font-semibold tracking-[0.08em] uppercase text-text-muted"
                aria-label={partyName}
              >
                {candidate.is_incumbent ? "Incumbent" : "Challenger"}
              </span>
            )}
          </div>

          <h3
            className={`font-display text-lg font-semibold leading-tight transition-colors group-hover:text-accent-primary ${
              lost ? "text-text-muted" : "text-text-primary"
            }`}
          >
            {candidate.name}
          </h3>

          <p
            className={`mt-1 text-[13px] leading-snug ${
              lost ? "text-text-muted" : "text-text-secondary"
            }`}
          >
            {candidate.office_sought}
          </p>
        </div>

        <span
          aria-hidden="true"
          className="font-mono text-sm text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-accent-primary transition-all"
        >
          →
        </span>
      </div>
    </Link>
  );
}
