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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Site name + tagline */}
          <div>
            <p className="font-display text-lg font-bold text-text-primary">
              AI on the Ballot
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Tracking where U.S. candidates stand on artificial intelligence
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer navigation">
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

          {/* Disclaimer + copyright */}
          <div className="space-y-2 text-xs text-text-muted">
            <p>A nonpartisan transparency resource.</p>
            <p>&copy; {new Date().getFullYear()} AI on the Ballot. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
