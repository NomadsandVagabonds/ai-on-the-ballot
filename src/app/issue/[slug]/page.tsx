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

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

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
  const numeral = index >= 0 ? ROMAN[index] ?? String(index + 1) : "·";

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

  const sourced = onRecordRecords.filter((r) => !!r.source_url).length;
  const sourcedPct = onRecord === 0 ? 0 : Math.round((sourced / onRecord) * 100);

  // Prev / next navigation within the issue set
  const prev = index > 0 ? allIssues[index - 1] : null;
  const next =
    index >= 0 && index < allIssues.length - 1 ? allIssues[index + 1] : null;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-20 md:pt-8 md:pb-24">
      {/* ============================================================
          Issue hero — compact editorial masthead
          Desktop: [numeral][headline + kicker + dek] | [tally rail]
          Mobile: stacks
         ============================================================ */}
      <header className="mb-6 md:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-5 items-start">
          <div className="md:col-span-8 min-w-0">
            <div className="flex items-start gap-4 md:gap-5">
              <div
                aria-hidden="true"
                className="shrink-0 w-14 h-14 md:w-16 md:h-16 flex items-center justify-center border border-border-strong rounded-sm bg-bg-surface"
              >
                <span className="font-display font-bold text-accent-primary text-[30px] md:text-[34px] leading-none">
                  {numeral}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-display-md font-bold text-text-primary leading-[1.02] tracking-[-0.015em]">
                  {data.issue.display_name}
                </h1>
              </div>
            </div>
            <p className="dek mt-3">{data.issue.description}</p>
          </div>

          {/* Tally rail — inline on desktop, under on mobile */}
          <aside className="md:col-span-4 md:pl-6 md:border-l md:border-border md:self-stretch md:flex md:flex-col md:justify-center">
            <dl className="grid grid-cols-3 gap-3">
              <div>
                <dt className="marginalia-label">On Record</dt>
                <dd className="font-mono text-xl md:text-[22px] font-bold text-text-primary tabular-nums leading-none mt-1">
                  {onRecord}
                </dd>
              </div>
              <div>
                <dt className="marginalia-label">Coverage</dt>
                <dd className="font-mono text-xl md:text-[22px] font-bold text-text-primary tabular-nums leading-none mt-1">
                  {coveragePct}
                  <span className="text-sm text-text-muted">%</span>
                </dd>
              </div>
              <div>
                <dt className="marginalia-label">Sourced</dt>
                <dd className="font-mono text-xl md:text-[22px] font-bold text-text-primary tabular-nums leading-none mt-1">
                  {sourcedPct}
                  <span className="text-sm text-text-muted">%</span>
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </header>

      {/* Issue switcher — dropdown between two hairlines so users can
          jump between the ten tracked issues without bouncing back to
          the index. */}
      <div className="rule-hair" aria-hidden="true" />
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
      <div className="rule-ornament mt-16" aria-hidden="true">
        <span>&#10086;</span>
      </div>
      <nav
        aria-label="Adjacent issues"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="md:pr-6 md:border-r md:border-border">
          {prev ? (
            <Link
              href={`/issue/${prev.issue.slug}`}
              className="group block"
            >
              <p className="marginalia-label mb-1">
                ← Previous Issue
              </p>
              <p className="font-display text-[19px] font-semibold leading-tight text-text-primary group-hover:text-accent-primary transition-colors">
                {prev.issue.display_name}
              </p>
            </Link>
          ) : (
            <Link href="/" className="group block">
              <p className="marginalia-label mb-1">← Return to Index</p>
              <p className="font-display text-[19px] font-semibold leading-tight text-text-primary group-hover:text-accent-primary transition-colors">
                A.I. on the Ballot
              </p>
            </Link>
          )}
        </div>
        <div className="md:pl-6 md:text-right">
          {next ? (
            <Link
              href={`/issue/${next.issue.slug}`}
              className="group block"
            >
              <p className="marginalia-label mb-1">
                Next Issue →
              </p>
              <p className="font-display text-[19px] font-semibold leading-tight text-text-primary group-hover:text-accent-primary transition-colors">
                {next.issue.display_name}
              </p>
            </Link>
          ) : (
            <Link href="/" className="group block">
              <p className="marginalia-label mb-1">Return to Index →</p>
              <p className="font-display text-[19px] font-semibold leading-tight text-text-primary group-hover:text-accent-primary transition-colors">
                A.I. on the Ballot
              </p>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
