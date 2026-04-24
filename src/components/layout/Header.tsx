"use client";

import Link from "next/link";
import { useAppStore } from "@/stores/appStore";

const NAV_LINKS = [
  { href: "/map", label: "Map" },
  { href: "/about", label: "About" },
] as const;

export function Header() {
  const isMobileNavOpen = useAppStore((s) => s.isMobileNavOpen);
  const toggleMobileNav = useAppStore((s) => s.toggleMobileNav);

  return (
    <header className="sticky top-0 z-40 bg-bg-surface/95 backdrop-blur-sm border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Masthead / Site name */}
          <Link href="/" className="flex flex-col shrink-0 group leading-none">
            <span className="font-display text-xl md:text-[1.35rem] font-bold text-text-primary tracking-[-0.01em] group-hover:text-accent-primary transition-colors">
              AI on the Ballot
            </span>
            <span className="hidden sm:inline-block text-[0.625rem] font-medium tracking-[0.14em] uppercase text-text-muted mt-1">
              2026 Congressional AI Tracker
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav
            className="hidden md:flex items-center gap-7"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-text-secondary hover:text-accent-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/corrections" className="btn-amber" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
              Submit Correction
            </Link>
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
            onClick={toggleMobileNav}
            aria-label="Open navigation menu"
            aria-expanded={isMobileNavOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
