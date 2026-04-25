"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface IssueLink {
  slug: string;
  display_name: string;
  description: string | null;
}

interface IssueSwitcherProps {
  issues: IssueLink[];
  currentSlug: string;
}

export function IssueSwitcher({ issues, currentSlug }: IssueSwitcherProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const current = issues.find((i) => i.slug === currentSlug) ?? issues[0];

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative py-3" ref={wrapperRef}>
      <div className="flex items-center justify-between gap-4">
        <p
          className="marginalia-label shrink-0"
          style={{ margin: 0, minWidth: "5.5rem" }}
        >
          The Issue
        </p>

        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="group inline-flex items-center justify-between gap-3 min-w-0 flex-1 max-w-md text-left px-3.5 py-2 border border-border rounded-sm bg-bg-surface hover:border-border-strong transition-colors"
        >
          <span className="font-display text-[15px] font-semibold text-text-primary truncate">
            {current?.display_name ?? "Select issue"}
          </span>
          <span
            aria-hidden="true"
            className={`font-mono text-sm text-text-muted transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </button>
      </div>

      {open && (
        <div
          role="listbox"
          aria-label="Tracked issues"
          className="absolute left-0 right-0 top-full mt-2 z-30 border border-border-strong rounded-sm bg-bg-surface shadow-[var(--shadow-md)] overflow-hidden"
        >
          <ul className="max-h-[24rem] overflow-y-auto divide-y divide-border">
            {issues.map((i) => {
              const isActive = i.slug === currentSlug;
              return (
                <li key={i.slug}>
                  <Link
                    href={`/issue/${i.slug}`}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => setOpen(false)}
                    className={`block px-4 py-3 transition-colors ${
                      isActive
                        ? "bg-accent-primary"
                        : "hover:bg-bg-elevated"
                    }`}
                    style={isActive ? { color: "#FFFFFF" } : undefined}
                  >
                    <p
                      className={`font-display text-[15px] font-semibold leading-tight ${
                        isActive ? "" : "text-text-primary"
                      }`}
                    >
                      {i.display_name}
                    </p>
                    {i.description && (
                      <p
                        className={`text-[13px] leading-snug mt-1 ${
                          isActive ? "opacity-90" : "text-text-secondary"
                        }`}
                      >
                        {i.description}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
