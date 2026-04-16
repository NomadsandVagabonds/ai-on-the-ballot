import Link from "next/link";
import type { CandidateSummary } from "@/types/domain";
import type { Stance } from "@/types/database";
import { partyLabel } from "@/lib/utils/stance";
import { STANCE_DISPLAY } from "@/lib/utils/stance";

interface CandidateCardProps {
  candidate: CandidateSummary;
}

function getPartyBorderColor(party: string): string {
  switch (party.toLowerCase()) {
    case "d":
      return "border-l-party-dem";
    case "r":
      return "border-l-party-rep";
    default:
      return "border-l-party-ind";
  }
}

function getPartyHoverBorderColor(party: string): string {
  switch (party.toLowerCase()) {
    case "d":
      return "group-hover:border-l-party-dem";
    case "r":
      return "group-hover:border-l-party-rep";
    default:
      return "group-hover:border-l-party-ind";
  }
}

/** Tiny heatmap row: 5 colored blocks showing stance at a glance */
function StanceMinibar({ stances }: { stances: Stance[] }) {
  return (
    <div className="flex gap-0.5" aria-label="Stance overview across all issues">
      {stances.map((stance, i) => {
        const display = STANCE_DISPLAY[stance];
        return (
          <div
            key={i}
            className="h-2 w-6 first:rounded-l-sm last:rounded-r-sm"
            style={{ backgroundColor: display.color }}
            title={`${display.label}`}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const partyName = partyLabel(candidate.party);

  return (
    <Link
      href={`/candidate/${candidate.slug}`}
      className={`group block bg-bg-surface border border-border border-l-[4px] ${getPartyBorderColor(candidate.party)} transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:translate-y-[-1px] hover:border-l-[5px] ${getPartyHoverBorderColor(candidate.party)} focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2`}
    >
      <div className="px-5 py-4">
        {/* Name as hero */}
        <div className="flex items-start gap-3">
          {/* Optional headshot */}
          {candidate.photo_url && (
            <img
              src={candidate.photo_url}
              alt=""
              className="h-10 w-10 rounded-full object-cover shrink-0 mt-0.5"
            />
          )}

          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-bold text-text-primary leading-tight tracking-tight group-hover:text-accent-primary transition-colors duration-200">
              {candidate.name}
            </h3>

            {/* Party + incumbent as inline text */}
            <p className="text-xs font-mono uppercase tracking-[0.08em] text-text-muted mt-1">
              {partyName}
              {candidate.is_incumbent && (
                <span className="text-accent-gold"> &middot; Incumbent</span>
              )}
            </p>
          </div>
        </div>

        {/* Office as context line */}
        <p className="text-sm text-text-secondary mt-2">
          {candidate.office_sought}
        </p>

        {/* Stance minibar */}
        {candidate.stances && candidate.stances.length > 0 && (
          <div className="mt-3">
            <StanceMinibar stances={candidate.stances} />
          </div>
        )}
      </div>
    </Link>
  );
}
