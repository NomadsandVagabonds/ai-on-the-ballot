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
    name: "Military & National Security Uses of AI",
    description:
      "Positions on AI use in defense, autonomous weapons, intelligence applications, and national security frameworks.",
  },
  {
    name: "AI Regulation Philosophy",
    description:
      "Positions on how (or whether) to regulate AI: licensing, liability, open-source, and federal agency roles.",
  },
  {
    name: "AI Companion Chatbots",
    description:
      "Positions on AI companions, romantic or emotional companion chatbots, and their psychological effects on users.",
  },
  {
    name: "Children's Online Safety",
    description:
      "Positions on AI-driven content moderation for minors, age verification, and algorithmic protections for children.",
  },
  {
    name: "Data Centers",
    description:
      "Positions on data center permitting, energy consumption, federal support, and environmental impact.",
  },
  {
    name: "Jobs and Workforce Disruption",
    description:
      "Positions on labor market effects of AI: automation, displacement, retraining, and workforce policy.",
  },
  {
    name: "Deepfakes and AI Fraud",
    description:
      "Positions on AI-generated impersonation, synthetic media, election deepfakes, and related fraud enforcement.",
  },
  {
    name: "AI Preemption",
    description:
      "Positions on whether federal AI law should preempt state and local AI regulation.",
  },
  {
    name: "Intellectual Property and AI",
    description:
      "Positions on copyright, training-data licensing, and author/artist protections against generative AI use.",
  },
] as const;

const COVERAGE_TIMELINE = [
  { date: "May 2", lines: ["Data released: IN, OH (Senate)"] },
  { date: "May 9", lines: ["Data released: NC, NE, WV"] },
  { date: "May 13", lines: ["Data released: LA (Senate)"] },
  {
    date: "May 14",
    lines: [
      "Data released: AL (Senate), GA (Senate), ID, KY (Senate), OR, PA",
    ],
  },
  { date: "May 23", lines: ["Data released: TX"] },
  {
    date: "May 30",
    lines: ["Data released: CA, IA (Senate), MT (Senate), NJ, NM, SD"],
  },
  { date: "June 6", lines: ["Data released: ME (Senate), ND, NV, SC"] },
  { date: "June 14", lines: ["Data released: AL, GA, OK"] },
  { date: "June 20", lines: ["Data released: MD, NY, SC, UT"] },
  { date: "June 24", lines: ["Data released: LA"] },
  { date: "June 27", lines: ["Data released: CO (Senate)"] },
  { date: "July 18", lines: ["Data released: AZ"] },
  { date: "July 25", lines: ["Data released: SD"] },
  {
    date: "August 1",
    lines: ["Data released: KS, MI (Senate), MO, VA, WA"],
  },
  { date: "August 3", lines: ["Data released: TN"] },
  { date: "August 5", lines: ["Data released: HI"] },
  { date: "August 8", lines: ["Data released: CT, MN (Senate), VT, WI"] },
  {
    date: "August 15",
    lines: ["Data released: AK (Senate), FL (Senate), WY (Senate)"],
  },
  { date: "August 22", lines: ["Data released: OK"] },
  { date: "August 29", lines: ["Data released: MA (Senate)"] },
  { date: "September 5", lines: ["Data released: NH (Senate), RI"] },
  { date: "September 12", lines: ["Data released: DE"] },
  { date: "November 3", lines: ["General Election"] },
] as const;

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 prose-body">
      <header className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary mb-4">
          About &amp; Methodology
        </h1>
        <p className="text-base leading-relaxed text-text-secondary">
          AI on the Ballot is a nonpartisan transparency resource that documents the publicly available AI governance positions of U.S. congressional candidates. It exists to make this information accessible, structured, and comparable.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-text-primary mb-3">
          What this is
        </h2>
        <p className="text-base leading-relaxed text-text-secondary mb-3">
          AI on the Ballot documents the publicly available AI governance positions of U.S. congressional candidates. We track what candidates have said, how they have voted, and what legislation they have sponsored or cosponsored on key AI policy issues.
        </p>
        <p className="text-base leading-relaxed text-text-secondary">
          This is a nonpartisan transparency resource. We do not evaluate, endorse, score, or make recommendations about candidates or electoral outcomes.
        </p>
      </section>

      <section className="mb-10" id="methodology">
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-text-primary mb-3">
          Methodology
        </h2>
        <p className="text-base leading-relaxed text-text-secondary mb-4">
          Every candidate is researched across four source categories:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed text-text-secondary mb-6">
          <li>
            <strong>Campaign websites.</strong> Official policy pages, press releases, and issue statements.
          </li>
          <li>
            <strong>Social media.</strong> Public posts on major platforms where candidates discuss AI policy.
          </li>
          <li>
            <strong>Web search.</strong> News interviews, op-eds, debate transcripts, and public remarks.
          </li>
          <li>
            <strong>Congressional record.</strong> Sponsored and cosponsored bills, committee hearing statements, and floor votes for incumbents.
          </li>
        </ul>

        <h3 className="font-display text-lg font-semibold text-text-primary mb-3 mt-8">
          How stances are coded
        </h3>
        <p className="text-base leading-relaxed text-text-secondary mb-3">
          Each candidate&rsquo;s position on each tracked issue is coded into one of five categories:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed text-text-secondary mb-6">
          <li>
            <strong>Support.</strong> Candidate has clearly expressed support for the policy area or approach.
          </li>
          <li>
            <strong>Oppose.</strong> Candidate has clearly expressed opposition to the policy area or approach.
          </li>
          <li>
            <strong>Mixed.</strong> Candidate has expressed both supportive and opposing views, or supports some aspects while opposing others.
          </li>
          <li>
            <strong>Unclear.</strong> Candidate has addressed the topic but their position cannot be confidently categorized.
          </li>
          <li>
            <strong>No mention.</strong> No public record of the candidate addressing this topic was found in our research.
          </li>
        </ul>

        <h3 className="font-display text-lg font-semibold text-text-primary mb-3 mt-8">
          How confidence is assigned
        </h3>
        <p className="text-base leading-relaxed text-text-secondary mb-3">
          Each coded stance carries a confidence level reflecting the strength of the underlying evidence:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed text-text-secondary mb-6">
          <li>
            <strong>High.</strong> Based on direct, unambiguous statements or legislative actions, e.g., a sponsored bill, explicit policy page, or floor vote.
          </li>
          <li>
            <strong>Medium.</strong> Based on clear but indirect evidence, e.g., social media posts, interview remarks, or cosponsorship of a related bill.
          </li>
          <li>
            <strong>Low.</strong> Based on inferred or tangential evidence, e.g., a brief remark in a broader context, or a position extrapolated from related statements.
          </li>
        </ul>

        <h3 className="font-display text-lg font-semibold text-text-primary mb-3 mt-8">
          Tracked issue categories
        </h3>
        <p className="text-base leading-relaxed text-text-secondary mb-3">
          We track candidate positions across the following AI governance issue areas:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed text-text-secondary">
          {ISSUE_CATEGORIES.map((issue) => (
            <li key={issue.name}>
              <strong>{issue.name}.</strong> {issue.description}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-text-primary mb-3">
          Candidate inclusion criteria
        </h2>
        <p className="text-base leading-relaxed text-text-secondary mb-3">
          Candidates must meet FEC filing and fundraising thresholds to be included:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-base leading-relaxed text-text-secondary mb-3">
          <li>
            <strong>Senate.</strong> FEC Form 1 (Statement of Candidacy) filed, plus $100,000 or more raised.
          </li>
          <li>
            <strong>House.</strong> FEC Form 1 filed, plus $15,000 raised.
          </li>
        </ul>
        <p className="text-base leading-relaxed text-text-secondary">
          Thresholds are re-evaluated at each FEC quarterly filing deadline. Candidates who fall below the ongoing threshold may be removed from active tracking.
        </p>
      </section>

      <section id="candidate-outreach" className="mb-10">
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-text-primary mb-3">
          Candidate outreach
        </h2>
        <p className="text-base leading-relaxed text-text-secondary mb-3">
          As part of our methodology, we are reaching out to each candidate appearing in this tracker to share how their AI governance positions are being characterized on this site, with citations for the public sources used in each coding decision. This outreach is rolling: candidates are contacted as their state&rsquo;s data comes online, so not every candidate listed will have been contacted at the time of publication.
        </p>
        <p className="text-base leading-relaxed text-text-secondary mb-3">
          The outreach is intended to flag any mischaracterization before or shortly after publication, and to invite the candidate or their campaign to clarify their stance, either by pointing us to additional public sources or by submitting a formal clarification through our{" "}
          <Link
            href="/corrections#clarification"
            className="text-accent-primary hover:text-accent-primary-hover font-medium underline underline-offset-2"
          >
            feedback form
          </Link>
          .
        </p>
        <p className="text-base leading-relaxed text-text-secondary">
          Where a candidate has not yet been reached or chooses not to respond, we publish based on the public record. A candidate&rsquo;s silence is not interpreted as agreement or disagreement with how a position is coded.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-text-primary mb-3">
          Coverage timeline
        </h2>
        <p className="text-base leading-relaxed text-text-secondary mb-5">
          Candidate data is released on a rolling state-by-state schedule, aligned with each state&rsquo;s primary calendar. At the latest, data for a given state is released three days ahead of that state&rsquo;s primary. Key Senate races are noted in parentheses.
        </p>
        <div className="rounded-md border border-border bg-bg-surface max-h-[22rem] overflow-y-auto px-5 py-5">
          <ol className="space-y-4 border-l border-border pl-5 ml-1">
            {COVERAGE_TIMELINE.map((entry) => (
              <li key={entry.date} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[26px] top-1.5 h-2 w-2 rounded-full bg-accent-primary"
                />
                <div className="font-display text-sm font-semibold text-text-primary">
                  {entry.date}
                </div>
                <ul className="mt-0.5 space-y-0.5">
                  {entry.lines.map((line, i) => (
                    <li
                      key={i}
                      className="text-[13px] leading-relaxed text-text-secondary"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-text-primary mb-3">
          Updates and corrections
        </h2>
        <p className="text-base leading-relaxed text-text-secondary mb-3">
          The candidate dataset is updated on the FEC quarterly schedule: April&nbsp;15, July&nbsp;15, and October&nbsp;15. Position coding is reviewed monthly between quarterly updates.
        </p>
        <p className="text-base leading-relaxed text-text-secondary">
          If you believe any information on this site is inaccurate, incomplete, or outdated,{" "}
          <Link
            href="/corrections"
            className="text-accent-primary hover:text-accent-primary-hover font-medium underline underline-offset-2"
          >
            submit a correction
          </Link>
          . All submissions are reviewed before any changes are made.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-text-primary mb-3">
          Editorial Policy
        </h2>
        <p className="text-base leading-relaxed text-text-secondary">
          AI on the Ballot is a nonpartisan research project tracking congressional candidates&rsquo; public positions on AI governance issues. This project originated within MATS Research and is now a project of Evitable. The AI on the Ballot research team operates with full autonomy over candidate selection, data collection, coding decisions, and research methodology. These decisions are made independently of Evitable&rsquo;s other activities.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-text-primary mb-3">
          Team
        </h2>
        <p className="text-base leading-relaxed text-text-secondary">
          For press inquiries, partnership questions, or general feedback, reach out{" "}
          <Link
            href="/corrections#question"
            className="text-accent-primary hover:text-accent-primary-hover font-medium underline underline-offset-2"
          >
            here
          </Link>{" "}
          or on X at{" "}
          <a
            href="https://x.com/v1naya"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-primary hover:text-accent-primary-hover font-medium underline underline-offset-2"
          >
            @v1naya
          </a>
          .
        </p>
      </section>
    </article>
  );
}
