"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  durationMs?: number;
  suffix?: string;
  prefix?: string;
}

/**
 * Counts up from 0 to `value` on mount, once the element enters the viewport.
 * Respects prefers-reduced-motion by rendering the final value directly.
 */
export function AnimatedCounter({
  value,
  durationMs = 1400,
  suffix = "",
  prefix = "",
}: AnimatedCounterProps) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const [display, setDisplay] = useState(prefersReduced ? value : 0);
  const elRef = useRef<HTMLSpanElement>(null);
  const hasAnimatedRef = useRef(prefersReduced);

  useEffect(() => {
    if (hasAnimatedRef.current) return;

    const el = elRef.current;
    if (!el) return;

    const startAnimation = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;

      const start = performance.now();
      const from = 0;
      const to = value;

      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(1, elapsed / durationMs);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(from + (to - from) * eased);
        setDisplay(current);
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAnimation();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, durationMs]);

  return (
    <span ref={elRef}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
