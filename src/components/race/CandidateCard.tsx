import Link from "next/link";
import type { CandidateSummary } from "@/types/domain";
import { PartyBadge } from "@/components/shared/PartyBadge";

interface CandidateCardProps {
  candidate: CandidateSummary;
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
      className="h-16 w-16 rounded-full bg-bg-elevated flex items-center justify-center shrink-0"
      aria-hidden="true"
    >
      <span className="font-display text-lg font-bold text-text-secondary">
        {initials}
      </span>
    </div>
  );
}

function CoverageBar({ percentage }: { percentage: number }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] uppercase tracking-wider text-text-muted">
          Issue coverage
        </span>
        <span className="text-xs font-mono font-semibold text-text-primary">
          {percentage}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-primary rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  return (
    <Link
      href={`/candidate/${candidate.slug}`}
      className="group block bg-bg-surface border border-border rounded-lg p-4 transition-shadow hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex items-start gap-3 mb-3">
        {/* Photo or avatar */}
        {candidate.photo_url ? (
          <img
            src={candidate.photo_url}
            alt={`${candidate.name}`}
            className="h-16 w-16 rounded-full object-cover shrink-0"
          />
        ) : (
          <InitialAvatar name={candidate.name} party={candidate.party} />
        )}

        <div className="min-w-0 flex-1">
          {/* Name */}
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors truncate">
            {candidate.name}
          </h3>

          {/* Party + incumbent */}
          <div className="flex items-center gap-1.5 mt-1">
            <PartyBadge party={candidate.party} size="sm" />
            {candidate.is_incumbent && (
              <span className="inline-flex items-center rounded-full bg-accent-gold/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent-gold leading-none">
                Incumbent
              </span>
            )}
          </div>

          {/* Office */}
          <p className="mt-1 text-xs text-text-muted truncate">
            {candidate.office_sought}
          </p>
        </div>
      </div>

      {/* Coverage bar */}
      <CoverageBar percentage={candidate.coverage_percentage} />
    </Link>
  );
}
