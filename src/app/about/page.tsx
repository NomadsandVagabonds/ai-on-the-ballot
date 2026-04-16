import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About & Methodology",
  description:
    "How AI on the Ballot sources, codes, and maintains its nonpartisan dataset of U.S. congressional candidates' AI governance positions.",
};

const ISSUE_CATEGORIES = [
  {
    name: "Export Control & Compute Governance",
    description:
      "Positions on restricting chip exports, controlling access to advanced compute, and semiconductor policy.",
  },
  {
    name: "Military & National Security AI",
    description:
      "Positions on AI use in defense, autonomous weapons, intelligence applications, and national security frameworks.",
  },
  {
    name: "AI Regulation Philosophy",
    description:
      "Positions on how (or whether) to regulate AI — covering licensing, liability, open-source, and federal agency roles.",
  },
  {
    name: "Data Centers",
    description:
      "Positions on data center permitting, energy consumption, federal support, and environmental impact.",
  },
  {
    name: "Children's Online Safety",
    description:
      "Positions on AI-driven content moderation for minors, age verification, and algorithmic protections for children.",
  },
] as const;

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Hero */}
      <header className="mb-16">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent-primary mb-4">
          About & Methodology
        </p>
        <h1 className="font-display text-display-lg font-bold tracking-tight mb-6">
          How We Track AI Policy Positions
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary leading-relaxed">
          AI on the Ballot is a nonpartisan transparency resource that documents
          the publicly available AI governance positions of U.S. congressional
          candidates. We exist to make this information accessible, structured,
          and comparable.
        </p>
      </header>

      {/* Section 1 — What This Is */}
      <section className="mb-16">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-4">
          What This Is
        </h2>
        <div className="h-px bg-gradient-to-r from-accent-primary/40 to-transparent mb-6" />
        <div className="space-y-4 text-text-secondary text-lg leading-relaxed">
          <p>
            AI on the Ballot documents the publicly available AI governance
            positions of U.S. congressional candidates. We track what candidates
            have said, how they have voted, and what legislation they have
            sponsored or cosponsored on key AI policy issues.
          </p>
          <div className="pull-quote">
            This is a nonpartisan transparency resource. We do not evaluate,
            endorse, score, or make recommendations about candidates or electoral
            outcomes.
          </div>
        </div>
      </section>

      {/* Section 2 — Methodology */}
      <section className="mb-16" id="methodology">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-4">
          Methodology
        </h2>
        <div className="h-px bg-gradient-to-r from-accent-primary/40 to-transparent mb-6" />

        {/* Source Categories */}
        <h3 className="font-display text-xl font-semibold mb-3">
          How Positions Are Sourced
        </h3>
        <p className="text-text-secondary text-lg leading-relaxed mb-4">
          We collect public statements and records from four source categories:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {[
            {
              title: "Campaign websites",
              desc: "Official policy pages, press releases, and issue statements",
            },
            {
              title: "Social media",
              desc: "Public posts on major platforms where candidates discuss AI policy",
            },
            {
              title: "Web search",
              desc: "News interviews, op-eds, debate transcripts, and public remarks",
            },
            {
              title: "Congressional record",
              desc: "Sponsored/cosponsored bills, committee hearing statements, floor votes",
            },
          ].map((source) => (
            <div
              key={source.title}
              className="callout-box"
            >
              <p className="text-sm font-semibold text-text-primary mb-1">
                {source.title}
              </p>
              <p className="text-sm text-text-secondary leading-relaxed !text-sm">
                {source.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Stance Coding */}
        <h3 className="font-display text-xl font-semibold mb-3">
          How Stances Are Coded
        </h3>
        <p className="text-text-secondary text-lg leading-relaxed mb-4">
          Each candidate&rsquo;s position on each tracked issue is coded into
          one of five categories:
        </p>
        <dl className="space-y-3 mb-10">
          {[
            {
              term: "Support",
              definition:
                "Candidate has clearly expressed support for the policy area or approach.",
            },
            {
              term: "Oppose",
              definition:
                "Candidate has clearly expressed opposition to the policy area or approach.",
            },
            {
              term: "Mixed",
              definition:
                "Candidate has expressed both supportive and opposing views, or supports some aspects while opposing others.",
            },
            {
              term: "Unclear",
              definition:
                "Candidate has addressed the topic but their position cannot be confidently categorized.",
            },
            {
              term: "No Mention",
              definition:
                "No public record of the candidate addressing this topic was found in our research.",
            },
          ].map((item) => (
            <div key={item.term} className="flex gap-4 py-2 border-b border-border/60 last:border-0">
              <dt className="font-mono text-sm font-semibold text-text-primary min-w-[7rem] shrink-0">
                {item.term}
              </dt>
              <dd className="text-text-secondary leading-relaxed">
                {item.definition}
              </dd>
            </div>
          ))}
        </dl>

        {/* Confidence */}
        <h3 className="font-display text-xl font-semibold mb-3">
          How Confidence Is Assigned
        </h3>
        <p className="text-text-secondary text-lg leading-relaxed mb-4">
          Each coded stance includes a confidence level reflecting the strength
          of the underlying evidence:
        </p>
        <dl className="space-y-3 mb-10">
          {[
            {
              term: "High",
              definition:
                "Based on direct, unambiguous statements or legislative actions — e.g., a sponsored bill, explicit policy page, or floor vote.",
            },
            {
              term: "Medium",
              definition:
                "Based on clear but indirect evidence — e.g., social media posts, interview remarks, or cosponsorship of a related bill.",
            },
            {
              term: "Low",
              definition:
                "Based on inferred or tangential evidence — e.g., a brief remark in a broader context, or a position extrapolated from related statements.",
            },
          ].map((item) => (
            <div key={item.term} className="flex gap-4 py-2 border-b border-border/60 last:border-0">
              <dt className="font-mono text-sm font-semibold text-text-primary min-w-[7rem] shrink-0">
                {item.term}
              </dt>
              <dd className="text-text-secondary leading-relaxed">
                {item.definition}
              </dd>
            </div>
          ))}
        </dl>

        {/* Issue Categories */}
        <h3 className="font-display text-xl font-semibold mb-4">
          Tracked Issue Categories
        </h3>
        <p className="text-text-secondary text-lg leading-relaxed mb-5">
          We track candidate positions across five AI governance issue areas:
        </p>
        <div className="grid grid-cols-1 gap-4 mb-4">
          {ISSUE_CATEGORIES.map((issue, i) => (
            <div key={issue.name} className="card-elevated p-5">
              <div className="flex items-start gap-4">
                <span className="font-mono text-2xl font-bold text-accent-primary/30 tabular-nums leading-none mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="font-semibold text-text-primary mb-1">
                    {issue.name}
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {issue.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3 — Candidate Inclusion Criteria */}
      <section className="mb-16">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-4">
          Candidate Inclusion Criteria
        </h2>
        <div className="h-px bg-gradient-to-r from-accent-primary/40 to-transparent mb-6" />
        <div className="space-y-4 text-text-secondary text-lg leading-relaxed">
          <p>
            Candidates must meet FEC filing and fundraising thresholds to be
            included:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="callout-box">
              <p className="text-sm font-semibold text-text-primary mb-1">Senate</p>
              <p className="text-sm text-text-secondary leading-relaxed !text-sm">
                FEC Form 1 (Statement of Candidacy) filed + $100,000 or more raised
              </p>
            </div>
            <div className="callout-box">
              <p className="text-sm font-semibold text-text-primary mb-1">House</p>
              <p className="text-sm text-text-secondary leading-relaxed !text-sm">
                FEC Form 1 filed + $15,000 raised (initial), $50,000 raised (ongoing)
              </p>
            </div>
          </div>
          <p>
            Thresholds are re-evaluated at each FEC quarterly filing deadline.
            Candidates who fall below the ongoing threshold may be removed from
            active tracking.
          </p>
        </div>
      </section>

      {/* Section 4 — Updates & Corrections */}
      <section className="mb-16">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-4">
          Updates & Corrections
        </h2>
        <div className="h-px bg-gradient-to-r from-accent-primary/40 to-transparent mb-6" />
        <div className="space-y-4 text-text-secondary text-lg leading-relaxed">
          <p>
            The candidate dataset is updated on the FEC quarterly schedule:
            April&nbsp;15, July&nbsp;15, and October&nbsp;15. Position coding is
            reviewed monthly between quarterly updates.
          </p>
          <div className="pull-quote">
            We take corrections seriously. If you believe any information on this
            site is inaccurate, incomplete, or outdated, please let us know.
          </div>
          <p>
            <Link
              href="/corrections"
              className="group inline-flex items-center gap-1.5 text-accent-primary hover:text-accent-primary-hover font-medium transition-colors"
            >
              Submit a correction
              <span className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">&rarr;</span>
            </Link>
          </p>
        </div>
      </section>

      {/* Section 5 — Team */}
      <section>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-4">
          Team
        </h2>
        <div className="h-px bg-gradient-to-r from-accent-primary/40 to-transparent mb-6" />
        <div className="space-y-4 text-text-secondary text-lg leading-relaxed">
          <p>
            AI on the Ballot is an independent research project. Team credits
            will be published here as the project develops.
          </p>
          <p>
            For press inquiries, partnership questions, or general feedback,
            contact us at{" "}
            <a
              href="mailto:contact@aiontheballot.com"
              className="link-editorial font-medium"
            >
              contact@aiontheballot.com
            </a>
            .
          </p>
        </div>
      </section>
    </article>
  );
}
