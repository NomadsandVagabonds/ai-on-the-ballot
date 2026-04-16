"use client";

import Link from "next/link";
import { useAppStore } from "@/stores/appStore";
import { ZipCodeInput } from "@/components/shared/ZipCodeInput";

const NAV_LINKS = [
  { href: "/map", label: "Explore Map" },
  { href: "/about", label: "Methodology" },
  { href: "/corrections", label: "Corrections" },
] as const;

export function Header() {
  const isMobileNavOpen = useAppStore((s) => s.isMobileNavOpen);
  const toggleMobileNav = useAppStore((s) => s.toggleMobileNav);

  return (
    <>
      {/* Thin accent bar at the very top */}
      <div className="h-[2px] bg-accent-primary" aria-hidden="true" />

      <header className="sticky top-0 z-40 bg-bg-surface/95 backdrop-blur-sm border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Masthead / Site name */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0 group"
            >
              <span className="font-display text-xl font-bold text-text-primary tracking-[-0.02em] group-hover:text-accent-primary transition-colors">
                AI on the Ballot
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-[0.15em] text-text-muted border border-border rounded px-1.5 py-0.5 leading-none">
                2026
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-text-secondary hover:text-accent-primary px-3 py-2 rounded-md hover:bg-bg-elevated/60 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop zip code input */}
            <div className="hidden md:block">
              <ZipCodeInput
                onSubmit={(zip) => {
                  window.location.href = `/lookup?zip=${zip}`;
                }}
                variant="compact"
              />
            </div>

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
    </>
  );
}
