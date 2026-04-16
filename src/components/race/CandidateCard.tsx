import Link from "next/link";
import type { CandidateSummary } from "@/types/domain";
import type { Stance } from "@/types/database";
import { partyLabel, STANCE_DISPLAY } from "@/lib/utils/stance";

interface CandidateCardProps {
  candidate: CandidateSummary;
}

function getPartyColor(party: string): string {
  switch (party.toLowerCase()) {
    case "d": return "var(--party-dem)";
    case "r": return "var(--party-rep)";
    default: return "var(--party-ind)";
  }
}

/** Tiny heatmap row: 5 colored blocks showing stance at a glance */
function StanceMinibar({ stances }: { stances: Stance[] }) {
  return (
    <div className="flex gap-px" aria-label="Stance overview across all issues">
      {stances.map((stance, i) => {
        const display = STANCE_DISPLAY[stance];
        return (
          <div
            key={i}
            className="h-1.5 flex-1"
            style={{ backgroundColor: display.color }}
            title={display.label}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const partyName = partyLabel(candidate.party);
  const partyColor = getPartyColor(candidate.party);

  return (
    <Link
      href={`/candidate/${candidate.slug}`}
      className="group block bg-bg-surface border border-border overflow-hidden transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:translate-y-[-1px] focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2"
    >
      {/* Top accent bar in party color */}
      <div className="h-1" style={{ backgroundColor: partyColor }} />

      <div className="px-5 py-4">
        {/* Name + optional headshot */}
        <div className="flex items-start gap-3">
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

            <p className="text-xs font-mono uppercase tracking-[0.08em] text-text-muted mt-1">
              {partyName}
              {candidate.is_incumbent && (
                <span className="text-accent-gold"> &middot; Incumbent</span>
              )}
            </p>
          </div>
        </div>

        <p className="text-sm text-text-secondary mt-2">
          {candidate.office_sought}
        </p>
      </div>

      {/* Stance minibar — full-width along bottom edge */}
      {candidate.stances && candidate.stances.length > 0 && (
        <StanceMinibar stances={candidate.stances} />
      )}
    </Link>
  );
}
