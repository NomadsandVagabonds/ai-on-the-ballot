'use client';

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl md:text-5xl font-bold text-text-primary mb-4">
        Something went wrong
      </h1>
      <p className="text-text-secondary text-lg mb-10 max-w-md mx-auto">
        An unexpected error occurred. Please try again or return to the
        homepage.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary hover:bg-bg-elevated transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
