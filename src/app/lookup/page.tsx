"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ZipCodeInput } from "@/components/shared/ZipCodeInput";
import { parseRaceSlug } from "@/lib/utils/slugs";
import { STATE_MAP } from "@/lib/utils/states";
import type { LookupResult } from "@/types/domain";

interface LookupApiResponse extends LookupResult {
  provider?: "geocodio" | "zippopotam" | null;
}

function chamberLabel(abbr: string): string {
  if (abbr === "sen") return "U.S. Senate";
  if (abbr === "gov") return "Governor";
  if (abbr === "house") return "U.S. House";
  return abbr;
}

function LookupContent() {
  const searchParams = useSearchParams();
  const initialZip = searchParams.get("zip");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupApiResponse | null>(null);

  useEffect(() => {
    if (initialZip && /^\d{5}$/.test(initialZip)) {
      handleLookup(initialZip);
    }
    // Only run on mount with the initial zip
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLookup(zip: string) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/lookup?zip=${zip}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setResult(data as LookupApiResponse);
      setLoading(false);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  const stateName = result ? STATE_MAP[result.state] ?? result.state : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 md:py-20">
      {/* ==========================================================
          Header
         ========================================================== */}
      <header className="text-center mb-10">
        <p className="kicker mb-3">Find Your Races</p>
        <h1 className="font-display text-display-lg font-bold text-text-primary leading-[1.02]">
          Your zip, your ballot
        </h1>
        <p className="dek mx-auto mt-4">
          Enter your zip code to surface the AI policy record for the
          congressional races you can vote in.
        </p>
      </header>

      {/* ==========================================================
          Input
         ========================================================== */}
      <div className="flex justify-center mb-10">
        <ZipCodeInput
          onSubmit={(zip) => {
            window.history.replaceState(null, "", `/lookup?zip=${zip}`);
            handleLookup(zip);
          }}
          variant="hero"
        />
      </div>

      {/* ==========================================================
          States
         ========================================================== */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-text-muted py-8">
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span className="marginalia-label" style={{ margin: 0 }}>
            Looking up your district...
          </span>
        </div>
      )}

      {error && (
        <div className="border border-border-strong rounded-sm px-5 py-4 bg-bg-surface">
          <p className="font-display text-lg text-text-primary">{error}</p>
          <p className="marginalia mt-3" style={{ margin: "0.75rem 0 0" }}>
            <Link
              href="/#issues"
              className="hover:text-accent-primary transition-colors"
            >
              Browse by issue
            </Link>{" "}
            or{" "}
            <Link
              href="/"
              className="hover:text-accent-primary transition-colors"
            >
              return to the homepage
            </Link>
            .
          </p>
        </div>
      )}

      {result && !loading && !error && (
        <section>
          {/* Resolved summary */}
          <div className="rule-hair" aria-hidden="true" />
          <div className="flex items-baseline justify-between gap-3 py-4">
            <div>
              <p className="kicker-muted">Zip {result.zip}</p>
              <p className="font-display text-[22px] font-semibold text-text-primary leading-tight mt-1">
                {stateName}
                {result.districts.length > 0 && (
                  <>
                    {" "}
                    &middot;{" "}
                    <span className="text-text-secondary font-normal">
                      {result.districts.length === 1
                        ? `Congressional District ${parseInt(result.districts[0], 10)}`
                        : `Districts ${result.districts.map((d) => parseInt(d, 10)).join(", ")}`}
                    </span>
                  </>
                )}
              </p>
            </div>
            <Link
              href={`/state/${result.state_slug}`}
              className="byline shrink-0 hover:text-accent-primary transition-colors"
              style={{ margin: 0 }}
            >
              All {stateName} races &rarr;
            </Link>
          </div>
          <div className="rule-hair" aria-hidden="true" />

          {result.provider === "zippopotam" && (
            <p
              className="marginalia mt-4"
              style={{ margin: "1rem 0 0" }}
            >
              District lookup is currently limited — we resolved state only.
              Senate and statewide races are listed; your House race isn&rsquo;t
              auto-matched.
            </p>
          )}

          {/* Tracked races for this zip */}
          {result.race_slugs.length > 0 ? (
            <div className="mt-8">
              <p className="kicker mb-4">Races on your ballot</p>
              <ul className="border-t border-border">
                {result.race_slugs.map((slug) => {
                  const parsed = parseRaceSlug(slug);
                  if (!parsed) return null;
                  const chamber = chamberLabel(parsed.chamber);
                  const district = parsed.district
                    ? ` — District ${parseInt(parsed.district, 10)}`
                    : "";
                  return (
                    <li
                      key={slug}
                      className="border-b border-border"
                    >
                      <Link
                        href={`/race/${slug}`}
                        className="group flex items-center justify-between gap-4 py-5"
                      >
                        <div className="min-w-0">
                          <p className="kicker-muted mb-1">
                            {parsed.stateAbbr} &middot; {parsed.year}
                          </p>
                          <h3 className="font-display text-[20px] font-semibold leading-tight text-text-primary group-hover:text-accent-primary transition-colors">
                            {chamber}
                            {district}
                          </h3>
                        </div>
                        <span
                          aria-hidden="true"
                          className="font-mono text-lg text-text-muted group-hover:text-accent-primary group-hover:translate-x-0.5 transition-all"
                        >
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="mt-8 border border-border rounded-sm px-6 py-8 text-center bg-bg-surface">
              <p className="font-display italic text-lg text-text-secondary">
                No races tracked in {stateName} yet.
              </p>
              <p className="marginalia mt-3" style={{ margin: "0.75rem 0 0" }}>
                Coverage is rolling out state-by-state.{" "}
                <Link
                  href="/"
                  className="hover:text-accent-primary transition-colors"
                >
                  See all covered states →
                </Link>
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default function LookupPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-14 md:py-20 text-center">
          <p className="kicker mb-3">Find Your Races</p>
          <h1 className="font-display text-display-lg font-bold text-text-primary leading-[1.02]">
            Your zip, your ballot
          </h1>
          <p className="dek mx-auto mt-4">Loading…</p>
        </div>
      }
    >
      <LookupContent />
    </Suspense>
  );
}
