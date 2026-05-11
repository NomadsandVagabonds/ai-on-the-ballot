import type { Metadata } from "next";
import { getPublishedCorrections } from "@/lib/queries/corrections";
import type { PublicCorrection } from "@/types/domain";
import { FeedbackTabs } from "./CorrectionForm";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Corrections & Feedback",
  description:
    "Submit corrections, candidate clarifications, or questions about AI on the Ballot's data and methodology.",
};

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default async function CorrectionsPage() {
  // Sourced from the published_corrections table in Supabase (fed by the
  // sheet's "Corrections Log" tab via /api/publish), falling back to the
  // JSON snapshot when DATA_SOURCE=json.
  const corrections: PublicCorrection[] = await getPublishedCorrections();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      {/* Page header */}
      <header className="mb-10">
        <p className="kicker mb-3">Participate</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-text-primary">
          Corrections &amp; Feedback
        </h1>
      </header>

      {/* Tabbed feedback forms */}
      <section className="mb-20">
        <FeedbackTabs />
      </section>

      {/* Public corrections log */}
      <section>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-text-primary mb-4">
          Corrections Log
        </h2>
        <div className="h-px bg-border mb-6" />

        {corrections.length === 0 ? (
          <p className="text-text-muted leading-relaxed">
            No corrections have been published yet. The corrections log will be
            updated as corrections are reviewed.
          </p>
        ) : (
          <ol className="divide-y divide-border">
            {corrections.map((entry) => (
              <li key={entry.id} className="py-5 first:pt-0">
                <p className="text-sm font-semibold text-text-primary mb-1.5">
                  {formatDate(entry.date)}
                </p>
                <p className="text-[15px] leading-relaxed text-text-secondary whitespace-pre-wrap">
                  {entry.description}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
