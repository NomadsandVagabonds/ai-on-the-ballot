import Link from "next/link";
import type { CandidateSummary } from "@/types/domain";
import { PartyBadge } from "@/components/shared/PartyBadge";

interface CandidateCardProps {
  candidate: CandidateSummary;
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
      className={`h-14 w-14 rounded-xl ${getPartyColor(party)} flex items-center justify-center shrink-0`}
      aria-hidden="true"
    >
      <span className="font-display text-base font-bold text-white/90">
        {initials}
      </span>
    </div>
  );
}

function CoverageBar({ percentage }: { percentage: number }) {
  return (
    <div className="w-full mt-1">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-[0.1em] text-text-muted font-medium">
          Issue coverage
        </span>
        <span className="text-xs font-mono font-semibold text-text-primary tabular-nums">
          {percentage}%
        </span>
      </div>
      <div className="coverage-bar-track">
        <div
          className="coverage-bar-fill"
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
      className="group card-elevated p-5 block"
    >
      <div className="flex items-start gap-3 mb-4">
        {/* Photo or avatar */}
        {candidate.photo_url ? (
          <img
            src={candidate.photo_url}
            alt={`${candidate.name}`}
            className="h-14 w-14 rounded-xl object-cover shrink-0 shadow-[var(--shadow-sm)]"
          />
        ) : (
          <InitialAvatar name={candidate.name} party={candidate.party} />
        )}

        <div className="min-w-0 flex-1">
          {/* Name */}
          <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors duration-200 truncate">
            {candidate.name}
          </h3>

          {/* Party + incumbent */}
          <div className="flex items-center gap-1.5 mt-1.5">
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
