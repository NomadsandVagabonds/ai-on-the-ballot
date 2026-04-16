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
  const toggleMobileNav = useAppStore((s) => s.toggleMobileNav);

  return (
    <header className="sticky top-0 z-40 bg-bg-surface border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Site name */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
          >
            <span className="font-display text-xl font-bold text-text-primary tracking-tight">
              AI on the Ballot
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-secondary hover:text-accent-primary transition-colors"
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
