import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/about#methodology", label: "Methodology" },
  { href: "/corrections", label: "Corrections" },
  { href: "/contact", label: "Contact" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-surface">
      {/* Decorative top line */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Site identity */}
          <div>
            <p className="font-display text-lg font-bold text-text-primary tracking-[-0.02em]">
              AI on the Ballot
            </p>
            <p className="mt-2 text-sm text-text-muted leading-relaxed max-w-xs">
              Tracking where U.S. candidates stand on artificial intelligence policy for the 2026 elections.
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2.5" aria-label="Footer navigation">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-text-muted mb-1">
              Navigate
            </p>
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-text-secondary hover:text-accent-primary transition-colors w-fit"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Disclaimer */}
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-text-muted mb-3">
              About
            </p>
            <p className="text-sm text-text-muted leading-relaxed">
              A nonpartisan transparency resource. We do not endorse, score, or recommend candidates.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-text-muted">
              &copy; {new Date().getFullYear()} AI on the Ballot
            </p>
            <p className="text-xs font-mono text-text-muted tracking-wide">
              Independent Research
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
