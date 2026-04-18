import type { Confidence } from "@/types/database";
import { CONFIDENCE_DISPLAY } from "@/lib/utils/stance";

interface ConfidenceBadgeProps {
  confidence: Confidence;
}

/**
 * ConfidenceBadge — editorial 3-bar glyph + mono label.
 * Replaces pill-with-tinted-bg. Works well alongside marginalia.
 */
export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const display = CONFIDENCE_DISPLAY[confidence];
  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={display.label}
    >
      <span
        className="confidence-bars"
        data-level={confidence}
        aria-hidden="true"
      >
        <span />
        <span />
        <span />
      </span>
      <span
        className="font-mono text-[10px] text-text-muted"
        style={{ letterSpacing: "0.15em", textTransform: "uppercase" }}
      >
        {confidence}
      </span>
      <span className="sr-only">{display.label}</span>
    </span>
  );
}
