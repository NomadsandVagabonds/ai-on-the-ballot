import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      {/* Large faded 404 behind heading */}
      <div className="relative inline-block mb-4">
        <span className="absolute inset-0 flex items-center justify-center font-display text-[8rem] md:text-[12rem] font-bold text-text-primary/[0.04] select-none pointer-events-none leading-none" aria-hidden="true">
          404
        </span>
        <h1 className="relative font-display text-4xl md:text-5xl font-bold text-text-primary py-8 md:py-12">
          Page not found
        </h1>
      </div>
      <p className="text-text-secondary text-lg mb-10 max-w-md mx-auto">
        This page doesn&apos;t seem to exist. It may have been moved during a site update.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
        >
          Go home
        </Link>
        <Link
          href="/map"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary hover:bg-bg-elevated transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
        >
          Explore the map
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary hover:bg-bg-elevated transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
        >
          Search for a candidate
        </Link>
      </div>
    </div>
  );
}
