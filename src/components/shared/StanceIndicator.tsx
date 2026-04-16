import type { Stance } from "@/types/database";
import { STANCE_DISPLAY } from "@/lib/utils/stance";

interface StanceIndicatorProps {
  stance: Stance;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  /** "icon" renders shape + text (default). "inline" renders colored text only, for use in position rows. */
  variant?: "icon" | "inline";
}

const SIZE_MAP = {
  sm: { icon: 12, text: "text-xs", gap: "gap-1" },
  md: { icon: 14, text: "text-sm", gap: "gap-1.5" },
  lg: { icon: 16, text: "text-base", gap: "gap-2" },
} as const;

function StanceShape({ stance, size }: { stance: Stance; size: number }) {
  const display = STANCE_DISPLAY[stance];
  const color = display.color;

  switch (display.shape) {
    case "circle":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="shrink-0"
        >
          <circle cx="8" cy="8" r="7" fill={color} />
        </svg>
      );

    case "square":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="shrink-0"
        >
          <rect x="1" y="1" width="14" height="14" rx="1.5" fill={color} />
        </svg>
      );

    case "diamond":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="shrink-0"
        >
          <rect
            x="8"
            y="1"
            width="10"
            height="10"
            rx="1.5"
            fill={color}
            transform="rotate(45 8 8)"
          />
        </svg>
      );

    case "circle-outline":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="shrink-0"
        >
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
        </svg>
      );

    case "dashed":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="shrink-0"
        >
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="3 2"
          />
        </svg>
      );
  }
}

export function StanceIndicator({
  stance,
  size = "md",
  showLabel = true,
  variant = "icon",
}: StanceIndicatorProps) {
  const display = STANCE_DISPLAY[stance];
  const sizeConfig = SIZE_MAP[size];

  if (variant === "inline") {
    return (
      <span
        className={`${sizeConfig.text} font-bold`}
        style={{ color: display.color }}
        role="img"
        aria-label={display.label}
      >
        {display.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center ${sizeConfig.gap}`}
      role="img"
      aria-label={display.label}
    >
      <StanceShape stance={stance} size={sizeConfig.icon} />
      {showLabel && (
        <span className={`${sizeConfig.text} font-medium`} style={{ color: display.color }}>
          {display.label}
        </span>
      )}
    </span>
  );
}
