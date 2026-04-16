"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/stores/appStore";
import { ZipCodeInput } from "@/components/shared/ZipCodeInput";

const NAV_LINKS = [
  { href: "/map", label: "Explore Map" },
  { href: "/about", label: "Methodology" },
  { href: "/corrections", label: "Corrections" },
] as const;

export function MobileNav() {
  const isMobileNavOpen = useAppStore((s) => s.isMobileNavOpen);
  const closeMobileNav = useAppStore((s) => s.closeMobileNav);
  const pathname = usePathname();

  // Close nav when route changes
  useEffect(() => {
    closeMobileNav();
  }, [pathname, closeMobileNav]);

  // Prevent body scroll when nav is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  return (
    <>
      {/* Overlay */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={closeMobileNav}
          aria-hidden="true"
        />
      )}

      {/* Slide-out panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 max-w-[80vw] bg-bg-surface shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileNavOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col h-full">
          {/* Close button */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-border">
            <span className="font-display text-lg font-bold text-text-primary">
              Menu
            </span>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
              onClick={closeMobileNav}
              aria-label="Close navigation menu"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 px-4 py-6 space-y-1" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-lg px-3 py-3 text-base font-medium text-text-secondary hover:bg-bg-elevated hover:text-accent-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Zip code input */}
          <div className="px-4 pb-6 border-t border-border pt-6">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
              Find your representatives
            </p>
            <ZipCodeInput
              onSubmit={(zip) => {
                closeMobileNav();
                window.location.href = `/lookup?zip=${zip}`;
              }}
              variant="compact"
            />
          </div>
        </div>
      </div>
    </>
  );
}
