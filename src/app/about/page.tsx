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
            href="mailto:contact@ontheballot.ai"
            className="text-accent-primary hover:text-accent-primary-hover font-medium underline underline-offset-2"
          >
            contact@ontheballot.ai
          </a>
          .
        </p>
      </section>
    </article>
  );
}
