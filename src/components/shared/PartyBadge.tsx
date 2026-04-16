import type { Party } from "@/types/database";
import { partyLabel } from "@/lib/utils/stance";

interface PartyBadgeProps {
  party: Party;
  size?: "sm" | "md";
}

const PARTY_STYLES: Record<Party, { bg: string; text: string }> = {
  D: { bg: "bg-party-dem", text: "text-white" },
  R: { bg: "bg-party-rep", text: "text-white" },
  I: { bg: "bg-party-ind", text: "text-white" },
  L: { bg: "bg-gray-500", text: "text-white" },
  G: { bg: "bg-green-600", text: "text-white" },
};

const SIZE_STYLES = {
  sm: "px-1.5 py-0.5 text-[10px]",
  md: "px-2 py-0.5 text-xs",
} as const;

export function PartyBadge({ party, size = "md" }: PartyBadgeProps) {
  const style = PARTY_STYLES[party] ?? { bg: "bg-gray-400", text: "text-white" };
  const label = partyLabel(party);

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold leading-none ${style.bg} ${style.text} ${SIZE_STYLES[size]}`}
      title={label}
      aria-label={label}
    >
      {party}
    </span>
  );
}
