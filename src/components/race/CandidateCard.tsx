import Link from "next/link";
import type { CandidateSummary } from "@/types/domain";
import type { Stance } from "@/types/database";
import { partyLabel, STANCE_DISPLAY } from "@/lib/utils/stance";
import { PartyBadge } from "@/components/shared/PartyBadge";
import { resolveCandidatePhoto } from "@/lib/utils/portrait";

interface CandidateCardProps {
  candidate: CandidateSummary;
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

/** Tiny heatmap row: colored blocks showing stance at a glance */
function StanceMinibar({ stances }: { stances: Stance[] }) {
  return (
    <div
      className="flex gap-px mt-4"
      aria-label="Stance overview across all issues"
    >
      {stances.map((stance, i) => {
        const display = STANCE_DISPLAY[stance];
        return (
          <div
            key={i}
            className="h-1 flex-1"
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
  const portraitSrc = resolveCandidatePhoto(candidate);

  return (
    <Link
      href={`/candidate/${candidate.slug}`}
      className="group block bg-bg-surface border border-border rounded-sm p-5 transition-all duration-200 hover:border-border-strong hover:shadow-[var(--shadow-md)] focus-visible:outline-2 focus-visible:outline-accent-primary focus-visible:outline-offset-2"
    >
      <div className="flex items-start gap-4">
        <div className="portrait-frame w-14 h-14 shrink-0">
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
            <PartyBadge party={candidate.party} size="sm" />
            <span
              className="marginalia-label"
              style={{ margin: 0 }}
              aria-label={partyName}
            >
              {candidate.is_incumbent ? "Incumbent" : "Challenger"}
            </span>
          </div>

          <h3 className="font-display text-lg font-semibold leading-tight text-text-primary group-hover:text-accent-primary transition-colors">
            {candidate.name}
          </h3>

          <p className="mt-1 text-[13px] leading-snug text-text-secondary">
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

      {/* Stance minibar — along the bottom edge */}
      {candidate.stances && candidate.stances.length > 0 && (
        <StanceMinibar stances={candidate.stances} />
      )}
    </Link>
  );
}
