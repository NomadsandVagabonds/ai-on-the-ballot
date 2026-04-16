import type { Confidence } from "@/types/database";
import { CONFIDENCE_DISPLAY } from "@/lib/utils/stance";

interface ConfidenceBadgeProps {
  confidence: Confidence;
}

const CONFIDENCE_STYLES: Record<Confidence, string> = {
  high: "bg-accent-primary/10 text-accent-primary",
  medium: "bg-accent-gold/10 text-accent-gold",
  low: "bg-gray-200 text-text-muted",
};

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const display = CONFIDENCE_DISPLAY[confidence];
  const styles = CONFIDENCE_STYLES[confidence];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium leading-none ${styles}`}
      title={display.label}
    >
      {display.label}
    </span>
  );
}
