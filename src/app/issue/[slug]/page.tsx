import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getAllIssuesWithCounts,
  getIssueBySlug,
} from "@/lib/queries/issues";
import { IssueRoster } from "@/components/issue/IssueRoster";
import { IssueSwitcher } from "@/components/issue/IssueSwitcher";

export const revalidate = 1800;

interface IssuePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: IssuePageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getIssueBySlug(slug);
  if (!data) return { title: "Issue Not Found" };

  return {
    title: data.issue.display_name,
    description: `Every tracked candidate's position on ${data.issue.display_name}. ${data.issue.description}`,
  };
}

export async function generateStaticParams() {
  const issues = await getAllIssuesWithCounts();
  return issues.map((i) => ({ slug: i.issue.slug }));
}

export default async function IssuePage({ params }: IssuePageProps) {
  const { slug } = await params;
  const [data, allIssues] = await Promise.all([
    getIssueBySlug(slug),
    getAllIssuesWithCounts(),
  ]);

  if (!data) notFound();

  const index = allIssues.findIndex((i) => i.issue.slug === slug);

  // "On record" = definite stance (support/oppose/mixed).
  // Unclear and no_mention do not count.
  const ON_RECORD_STANCES = new Set(["support", "oppose", "mixed"]);
  const onRecordRecords = data.records.filter((r) =>
    ON_RECORD_STANCES.has(r.stance)
  );
  const onRecord = onRecordRecords.length;
  const coveragePct =
    data.total_candidates === 0
      ? 0
      : Math.round((onRecord / data.total_candidates) * 100);

  // Prev / next navigation within the issue set
  const prev = index > 0 ? allIssues[index - 1] : null;
  const next =
    index >= 0 && index < allIssues.length - 1 ? allIssues[index + 1] : null;

  const issueOrdinal = index >= 0 ? index + 1 : null;
  const totalIssues = allIssues.length;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 pb-20 md:pt-12 md:pb-24">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent-primary transition-colors mb-6"
      >
        <span aria-hidden="true">←</span>
        Home
      </Link>

      {/* ============================================================
          Header — small kicker · headline · meta · description
         ============================================================ */}
      <header className="mb-8">
        {issueOrdinal !== null && (
          <p className="text-xs font-medium tracking-[0.08em] uppercase text-text-muted mb-3">
            Issue {issueOrdinal} of {totalIssues}
          </p>
        )}

        <h1 className="font-display text-[2.5rem] md:text-[3.25rem] font-bold text-text-primary leading-[1.05] tracking-[-0.015em]">
          {data.issue.display_name}
        </h1>

        <p className="cand-meta mt-3">
          <span className="font-mono tabular-nums text-text-primary">
            {data.total_candidates}
          </span>{" "}
          candidate{data.total_candidates === 1 ? "" : "s"} ·{" "}
          <span className="font-mono tabular-nums text-text-primary">
            {onRecord}
          </span>{" "}
          on record ·{" "}
          <span className="font-mono tabular-nums text-text-primary">
            {coveragePct}%
          </span>{" "}
          coverage
        </p>

        {data.issue.description && (
          <p className="mt-5 text-base leading-relaxed text-text-secondary max-w-2xl">
            {data.issue.description}
          </p>
        )}
      </header>

      {/* Issue switcher — dropdown so users can jump between tracked issues */}
      <IssueSwitcher
        issues={allIssues.map((i) => ({
          slug: i.issue.slug,
          display_name: i.issue.display_name,
          description: i.issue.description,
        }))}
        currentSlug={slug}
      />

      <IssueRoster data={data} />

      {/* ============================================================
          Prev / next issue nav
         ============================================================ */}
      {(prev || next) && (
        <nav
          aria-label="Adjacent issues"
          className="mt-16 pt-8 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            {prev && (
              <Link
                href={`/issue/${prev.issue.slug}`}
                className="group block"
              >
                <p className="text-xs uppercase tracking-[0.08em] text-text-muted mb-1">
                  ← Previous
                </p>
                <p className="font-display text-lg font-semibold leading-tight text-text-primary group-hover:text-accent-primary transition-colors">
                  {prev.issue.display_name}
                </p>
              </Link>
            )}
          </div>
          <div className="md:text-right">
            {next && (
              <Link
                href={`/issue/${next.issue.slug}`}
                className="group block"
              >
                <p className="text-xs uppercase tracking-[0.08em] text-text-muted mb-1">
                  Next →
                </p>
                <p className="font-display text-lg font-semibold leading-tight text-text-primary group-hover:text-accent-primary transition-colors">
                  {next.issue.display_name}
                </p>
              </Link>
            )}
          </div>
        </nav>
      )}

      {/* Footer — matches candidate / race pages */}
      <div className="mt-12 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-3 text-sm text-text-muted">
        <p>{data.issue.display_name}</p>
        <Link
          href="/about#methodology"
          className="hover:text-accent-primary transition-colors"
        >
          Methodology
        </Link>
      </div>
    </div>
  );
}
