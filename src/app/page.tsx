import Link from "next/link";
import { getAllStatesForMap } from "@/lib/queries/states";
import { getAllIssuesWithCounts } from "@/lib/queries/issues";
import { USMap } from "@/components/map/USMap";
import { HeroZipInput } from "./HeroZipInput";

export const revalidate = 1800;

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export default async function Home() {
  const [states, issues] = await Promise.all([
    getAllStatesForMap(),
    getAllIssuesWithCounts(),
  ]);

  const totalRaces = states.reduce((sum, s) => sum + s.race_count, 0);
  const statesWithData = states.filter((s) => s.has_data).length;

  const launchStates = states
    .filter((s) => s.has_data)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      {/* ============================================================
          Nameplate masthead — full-bleed top strip
         ============================================================ */}
      <section className="border-t border-b border-border-strong bg-bg-primary">
        <div className="mx-auto max-w-6xl px-4 py-6 md:py-7 text-center">
          <p className="kicker-muted mb-2" style={{ fontSize: "0.625rem" }}>
            An Independent, Nonpartisan Research Project
          </p>
          <h1 className="nameplate text-display-xl leading-[0.95] -tracking-[0.02em]">
            A.I. on the Ballot
          </h1>
          <p
            className="mt-2 smallcaps text-text-muted"
            style={{ fontSize: "0.75rem", letterSpacing: "0.2em" }}
          >
            Supported by{" "}
            <a
              href="https://evitable.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-primary transition-colors"
            >
              Evitable
            </a>
          </p>
        </div>
      </section>

      {/* ============================================================
          Hero — zip + map
         ============================================================ */}
      <section className="relative bg-bg-elevated">
        <div className="relative z-10 pt-10 md:pt-14 pb-6 md:pb-8 px-4">
          <div className="mx-auto max-w-3xl text-center">
            {/* Zip input */}
            <div className="flex justify-center mb-2">
              <HeroZipInput />
            </div>
            <p className="marginalia mt-3">
              Enter a zip code, or click a state below.
            </p>
          </div>
        </div>

        {/* Map caption */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 pb-8">
          <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-border">
            <p className="figcaption">States in Coverage. Click to enter.</p>
            <p className="figcaption text-text-muted">
              {statesWithData} / 50
            </p>
          </div>
          <USMap states={states} />
        </div>

        {/* Subtle bottom border */}
        <div className="h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
      </section>

      {/* ============================================================
          Issue index — the "contents of this issue" block
         ============================================================ */}
      {issues.length > 0 && (
        <section
          id="issues"
          className="px-4 py-16 md:py-20 bg-bg-primary scroll-mt-20"
        >
          <div className="mx-auto max-w-5xl">
            <div className="section-opener">
              <p className="kicker">In This Issue</p>
              <h2 className="font-display text-display-md font-bold text-text-primary">
                {issues.length === 5
                  ? "Five Issues on the Ballot"
                  : issues.length === 6
                    ? "Six Issues on the Ballot"
                    : `${issues.length} Issues on the Ballot`}
              </h2>
              <p className="dek">
                The AI policy questions shaping the 2026 cycle.
              </p>
              <div className="rule-hair mt-2" aria-hidden="true" />
            </div>

            <ol
              className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-y-2 md:gap-x-10"
              aria-label="AI policy issues tracked in this edition"
            >
              {issues.map((entry, i) => (
                <li
                  key={entry.issue.id}
                  className="border-b border-border last:border-b-0 md:[&:nth-last-child(2)]:border-b-0"
                >
                  <Link
                    href={`/issue/${entry.issue.slug}`}
                    className="group block py-6 md:py-7"
                  >
                    <div className="flex items-start gap-5">
                      {/* Icon slot — roman numeral now, bespoke icons later */}
                      <div
                        aria-hidden="true"
                        className="shrink-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center border border-border-strong rounded-sm text-accent-primary font-display text-[22px] md:text-[26px] leading-none font-bold bg-bg-surface group-hover:bg-accent-primary group-hover:text-white group-hover:border-accent-primary transition-colors"
                      >
                        {ROMAN[i] ?? String(i + 1)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="kicker-muted mb-1.5">
                          Issue {ROMAN[i] ?? String(i + 1)}
                          <span className="mx-1.5" aria-hidden="true">&middot;</span>
                          {entry.position_count}{" "}
                          {entry.position_count === 1
                            ? "candidate"
                            : "candidates"}{" "}
                          on record
                        </p>
                        <h3 className="font-display text-[20px] md:text-[22px] font-semibold leading-[1.2] text-text-primary group-hover:text-accent-primary transition-colors tracking-[-0.01em]">
                          {entry.issue.display_name}
                        </h3>
                        <p
                          className="mt-2 text-[14px] leading-[1.55] text-text-secondary"
                          style={{ maxWidth: "46ch" }}
                        >
                          {entry.issue.description}
                        </p>
                        <p className="mt-3 inline-flex items-center gap-1.5 marginalia-label group-hover:text-accent-primary transition-colors" style={{ margin: "0.75rem 0 0" }}>
                          Read the record
                          <span
                            aria-hidden="true"
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                          >
                            →
                          </span>
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ============================================================
          Launch-states index — typographic TOC with leader dots
         ============================================================ */}
      {statesWithData > 0 && (
        <section className="px-4 pt-4 pb-20 bg-bg-primary">
          <div className="mx-auto max-w-4xl">
            <div className="rule-ornament" aria-hidden="true">
              <span>&#10086;</span>
            </div>

            <div className="section-opener">
              <p className="kicker">Index of States</p>
              <h2 className="font-display text-display-md font-bold text-text-primary">
                Launch States
              </h2>
              <p className="dek">
                {statesWithData} states tracked. {totalRaces} races on record.
              </p>
              <div className="rule-hair mt-2" aria-hidden="true" />
            </div>

            <ol className="mt-6">
              {launchStates.map((state, i) => (
                <li
                  key={state.abbreviation}
                  className="border-b border-border last:border-b-0"
                >
                  <Link
                    href={`/state/${state.slug}`}
                    className="group block py-4 md:py-5"
                  >
                    <div className="leader-dots items-baseline gap-4">
                      <span className="folio text-xs shrink-0 w-6">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-xl md:text-2xl font-semibold text-text-primary group-hover:text-accent-primary transition-colors tracking-[-0.01em] shrink-0">
                        {state.name}
                      </span>
                      <span className="leader-fill" aria-hidden="true" />
                      <span className="font-mono text-sm text-text-secondary tabular-nums shrink-0">
                        {state.race_count}{" "}
                        <span className="marginalia-label" style={{ display: "inline", margin: 0 }}>
                          {state.race_count === 1 ? "race" : "races"}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="font-mono text-sm text-text-muted shrink-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent-primary"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>

            {/* Rule ornament */}
            <div className="rule-ornament" aria-hidden="true">
              <span>&#10086;</span>
            </div>

            {/* Footer links */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 marginalia-label" style={{ margin: 0 }}>
              <Link
                href="/about"
                className="hover:text-accent-primary transition-colors"
              >
                Methodology
              </Link>
              <span aria-hidden="true">·</span>
              <Link
                href="/corrections"
                className="hover:text-accent-primary transition-colors"
              >
                Corrections
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
