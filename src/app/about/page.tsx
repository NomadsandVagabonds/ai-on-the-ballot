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
  {
    date: "April 17",
    lines: [
      "Initial website launched, tested by friends, family, and close colleagues",
      "Primaries go live: AR, IL (Senate), MS, NC (Senate), TX (Senate)",
    ],
  },
  {
    date: "April 21",
    lines: [
      "Marketing and press campaigns go live",
      "Public launch",
    ],
  },
  { date: "May 2", lines: ["Primaries go live: IN, OH (Governor + Senate)"] },
  { date: "May 9", lines: ["Primaries go live: NC, NE, WV"] },
  { date: "May 13", lines: ["Primaries go live: LA (Senate)"] },
  {
    date: "May 14",
    lines: [
      "Primaries go live: AL (Governor + Senate), GA (Governor + Senate), ID, KY (Senate), OR, PA (Governor)",
    ],
  },
  { date: "May 23", lines: ["Primaries go live: TX"] },
  {
    date: "May 30",
    lines: [
      "Primaries go live: CA (Governor), IA (Governor + Senate), MT (Senate), NJ, NM (Governor), SD",
    ],
  },
  {
    date: "June 6",
    lines: [
      "Primaries go live: ME (Governor + Senate), ND, NV (Governor), SC (Governor)",
    ],
  },
  { date: "June 14", lines: ["Primaries go live: AL, GA, OK (Governor)"] },
  { date: "June 20", lines: ["Primaries go live: MD, NY (Governor), SC, UT"] },
  { date: "June 24", lines: ["Primaries go live: LA"] },
  { date: "June 27", lines: ["Primaries go live: CO (Governor + Senate)"] },
  { date: "July 18", lines: ["Primaries go live: AZ (Governor)"] },
  { date: "July 25", lines: ["Primaries go live: SD"] },
  {
    date: "August 1",
    lines: [
      "Primaries go live: KS (Governor), MI (Governor + Senate), MO, VA, WA",
    ],
  },
  { date: "August 3", lines: ["Primaries go live: TN (Governor)"] },
  { date: "August 5", lines: ["Primaries go live: HI"] },
  {
    date: "August 8",
    lines: [
      "Primaries go live: CT, MN (Governor + Senate), VT, WI (Governor)",
    ],
  },
  {
    date: "August 15",
    lines: [
      "Primaries go live: AK (Governor + Senate), FL (Governor + Senate), WY (Senate)",
    ],
  },
  { date: "August 22", lines: ["Primaries go live: OK"] },
  { date: "August 29", lines: ["Primaries go live: MA (Senate)"] },
  { date: "September 5", lines: ["Primaries go live: NH (Governor + Senate), RI"] },
  { date: "September 12", lines: ["Primaries go live: DE"] },
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
            <strong>High.</strong> Based on direct, unambiguous statements or legislative actions, e.g.a sponsored bill, explicit policy page, or floor vote.
          </li>
          <li>
            <strong>Medium.</strong> Based on clear but indirect evidence, e.g.social media posts, interview remarks, or cosponsorship of a related bill.
          </li>
          <li>
            <strong>Low.</strong> Based on inferred or tangential evidence, e.g.a brief remark in a broader context, or a position extrapolated from related statements.
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
            <strong>House.</strong> FEC Form 1 filed, plus $15,000 raised initially and $50,000 raised on an ongoing basis.
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
          The outreach is intended to flag any mischaracterization before or shortly after publication, and to invite the candidate or their campaign to clarify their stance — either by pointing us to additional public sources or by submitting a formal clarification through our{" "}
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
          Candidate data is published on a rolling state-by-state schedule, aligned with each state&rsquo;s primary calendar. Key races (Senate, Governor) are noted in parentheses.
        </p>
        <ol className="space-y-5 border-l border-border pl-6 ml-1">
          {COVERAGE_TIMELINE.map((entry) => (
            <li key={entry.date} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[29px] top-2 h-2 w-2 rounded-full bg-accent-primary"
              />
              <div className="font-display text-base font-semibold text-text-primary">
                {entry.date}
              </div>
              <ul className="mt-1 space-y-1">
                {entry.lines.map((line, i) => (
                  <li
                    key={i}
                    className="text-sm leading-relaxed text-text-secondary"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
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
          Funding Independence
        </h2>
        <p className="text-base leading-relaxed text-text-secondary mb-3">
          AI on the Ballot is an independent research project tracking congressional candidates&rsquo; public positions on AI governance issues.
        </p>
        <p className="text-base leading-relaxed text-text-secondary mb-3">
          This project originated within MATS Research and is now independently operated under Evitable. AI on the Ballot retains full editorial independence from MATS Research and all affiliated organizations. Evitable had no role in candidate selection, data collection, coding decisions, or any editorial content. Evitable does not review or influence how candidates are coded or what is published. In any instance where we report on our funders or their affiliated work, we will disclose that relationship.
        </p>
        <p className="text-base leading-relaxed text-text-secondary">
          AI on the Ballot&rsquo;s findings and methodology are solely the work of its researchers and do not reflect the views of any funding or affiliated organization.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl sm:text-2xl font-semibold text-text-primary mb-3">
          Team
        </h2>
        <p className="text-base leading-relaxed text-text-secondary">
          For press inquiries, partnership questions, or general feedback, contact us at{" "}
          <a
            href="mailto:vinayasivakumar@berkeley.edu"
            className="text-accent-primary hover:text-accent-primary-hover font-medium underline underline-offset-2"
          >
            vinayasivakumar@berkeley.edu
          </a>{" "}
          or follow on X at{" "}
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
