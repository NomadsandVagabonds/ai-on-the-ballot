import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/about#methodology", label: "Methodology" },
  { href: "/corrections", label: "Corrections" },
  { href: "/corrections#question", label: "Contact" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-surface">
      {/* Decorative top line */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Site identity */}
          <div className="max-w-md">
            <p className="font-display text-lg font-bold text-text-primary tracking-[-0.02em]">
              AI on the Ballot
            </p>
            <p className="mt-2 text-sm text-text-muted leading-relaxed">
              Nonpartisan research tracking where U.S. Congressional candidates in the 2026 midterm elections stand on artificial intelligence policy.
            </p>
          </div>

          {/* Navigation — right aligned */}
          <nav
            className="flex flex-col md:items-end gap-2.5"
            aria-label="Footer navigation"
          >
            <p className="text-xs font-medium tracking-[0.08em] uppercase text-text-muted mb-1">
              Navigate
            </p>
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-text-secondary hover:text-accent-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-text-muted">
            A project of{" "}
            <a
              href="https://evitable.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-primary transition-colors underline underline-offset-2"
            >
              Evitable
            </a>
          </p>
          <a
            href="https://x.com/v1naya"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow on X"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-primary transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-3.5 w-3.5 fill-current"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>@v1naya</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
