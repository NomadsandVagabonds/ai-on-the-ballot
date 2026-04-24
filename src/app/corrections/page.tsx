import type { Metadata } from "next";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { PublicCorrection } from "@/types/domain";
import { FeedbackTabs } from "./CorrectionForm";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Corrections & Feedback",
  description:
    "Submit corrections, candidate clarifications, or questions about AI on the Ballot's data and methodology.",
};

export default async function CorrectionsPage() {
  let corrections: PublicCorrection[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const { data: rawCorrections } = await supabase
      .from("corrections_log")
      .select(
        "id, candidate_name, issue, nature_of_change, previous_value, new_value, created_at"
      )
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    corrections = (rawCorrections ?? []) as unknown as PublicCorrection[];
  }

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
    </div>
  );
}
