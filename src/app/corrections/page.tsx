import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PublicCorrection } from "@/types/domain";
import { CorrectionForm } from "./CorrectionForm";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Corrections",
  description:
    "View the corrections log and submit corrections to AI on the Ballot's candidate data.",
};

export default async function CorrectionsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: rawCorrections } = await supabase
    .from("corrections_log")
    .select(
      "id, candidate_name, issue, nature_of_change, previous_value, new_value, created_at"
    )
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  const corrections = (rawCorrections ?? []) as unknown as PublicCorrection[];

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Page header */}
      <header className="mb-16">
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Corrections
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed">
          Accuracy matters. This page logs all published corrections to the
          dataset and provides a form to submit new ones.
        </p>
      </header>

      {/* Section 1 — Corrections Log */}
      <section className="mb-16">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-4">
          Corrections Log
        </h2>
        <div className="h-px bg-border mb-6" />

        {corrections.length === 0 ? (
          <p className="text-text-muted text-lg leading-relaxed">
            No corrections have been published yet. The corrections log will be
            updated as corrections are reviewed.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-strong">
                  <th className="pb-3 pr-4 text-sm font-semibold text-text-primary">
                    Date
                  </th>
                  <th className="pb-3 pr-4 text-sm font-semibold text-text-primary">
                    Candidate
                  </th>
                  <th className="pb-3 pr-4 text-sm font-semibold text-text-primary">
                    Issue
                  </th>
                  <th className="pb-3 pr-4 text-sm font-semibold text-text-primary">
                    Change
                  </th>
                  <th className="pb-3 text-sm font-semibold text-text-primary">
                    Previous &rarr; New
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {corrections.map((correction) => (
                  <tr key={correction.id} className="align-top">
                    <td className="py-3 pr-4 font-mono text-sm text-text-muted whitespace-nowrap">
                      {new Date(correction.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </td>
                    <td className="py-3 pr-4 text-sm text-text-primary">
                      {correction.candidate_name}
                    </td>
                    <td className="py-3 pr-4 text-sm text-text-secondary">
                      {correction.issue}
                    </td>
                    <td className="py-3 pr-4 text-sm text-text-secondary">
                      {correction.nature_of_change ?? "—"}
                    </td>
                    <td className="py-3 text-sm text-text-secondary">
                      {correction.previous_value || correction.new_value ? (
                        <>
                          <span className="text-text-muted">
                            {correction.previous_value ?? "—"}
                          </span>
                          <span className="mx-1.5">&rarr;</span>
                          <span className="text-text-primary font-medium">
                            {correction.new_value ?? "—"}
                          </span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section 2 — Submit a Correction */}
      <section>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-4">
          Submit a Correction
        </h2>
        <div className="h-px bg-border mb-6" />
        <p className="text-text-secondary text-lg leading-relaxed mb-6">
          If you believe any candidate position, stance coding, or factual
          detail on this site is inaccurate, please let us know. All submissions
          are reviewed before any changes are made.
        </p>
        <CorrectionForm />
      </section>
    </div>
  );
}
