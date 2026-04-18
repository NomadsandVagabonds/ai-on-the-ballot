import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCandidateBySlug } from "@/lib/queries/candidates";
import { chamberLabel } from "@/lib/utils/stance";
import { STATE_MAP } from "@/lib/utils/states";
import { PositionGrid } from "@/components/candidate/PositionGrid";
import { LegislativeActivity } from "@/components/candidate/LegislativeActivity";
import { PartyBadge } from "@/components/shared/PartyBadge";
import { resolveCandidatePhoto } from "@/lib/utils/portrait";

export const revalidate = 1800;

interface CandidatePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CandidatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(slug);
  if (!candidate) return { title: "Candidate Not Found" };

  return {
    title: candidate.name,
    description: `${candidate.name}'s positions on AI policy issues — ${candidate.office_sought}.`,
  };
}

const AI_COMMITTEE_KEYWORDS = [
  "artificial intelligence",
  "science",
  "technology",
  "commerce",
  "judiciary",
  "intelligence",
  "homeland security",
];

function isAIRelevantCommittee(name: string): boolean {
  const lower = name.toLowerCase();
  return AI_COMMITTEE_KEYWORDS.some((kw) => lower.includes(kw));
}

function initials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function officeRoleLabel(office: string, isIncumbent: boolean): string {
  const lower = office.toLowerCase();
  if (lower.includes("senate")) {
    return isIncumbent ? "U.S. Senator" : "U.S. Senate candidate";
  }
  if (lower.includes("house") || lower.includes("representative")) {
    return isIncumbent ? "U.S. Representative" : "U.S. House candidate";
  }
  if (lower.includes("governor")) {
    return isIncumbent ? "Governor" : "candidate for Governor";
  }
  return isIncumbent ? `incumbent ${office}` : `candidate for ${office}`;
}

function buildBiographicalLede(params: {
  name: string;
  office: string;
  state: string;
  isIncumbent: boolean;
  positionCount: number;
  aiCommitteeCount: number;
  totalCommittees: number;
}): string {
  const {
    name,
    office,
    state,
    isIncumbent,
    positionCount,
    aiCommitteeCount,
    totalCommittees,
  } = params;
  const role = officeRoleLabel(office, isIncumbent);
  const parts: string[] = [];
  parts.push(`${name} is ${isIncumbent ? "the" : "a"} ${role} from ${state}.`);
  if (totalCommittees > 0) {
    const committeeClause =
      aiCommitteeCount > 0
        ? `sits on ${totalCommittees} committee${totalCommittees === 1 ? "" : "s"}, ${aiCommitteeCount} of them AI-adjacent`
        : `sits on ${totalCommittees} committee${totalCommittees === 1 ? "" : "s"}`;
    parts.push(
      `${isIncumbent ? "Currently" : "Previously"} ${committeeClause}.`
    );
  }
  if (positionCount > 0) {
    parts.push(
      `${positionCount} recorded position${positionCount === 1 ? "" : "s"} on AI policy, each cited.`
    );
  } else {
    parts.push("No public AI positions on the record.");
  }
  return parts.join(" ");
}

export default async function CandidatePage({ params }: CandidatePageProps) {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(slug);

  if (!candidate) {
    notFound();
  }

  const stateName = STATE_MAP[candidate.state] ?? candidate.state;
  const aiCommittees = candidate.committee_assignments.filter(
    isAIRelevantCommittee
  );
  const otherCommittees = candidate.committee_assignments.filter(
    (c) => !isAIRelevantCommittee(c)
  );

  const chamberRef =
    candidate.office_sought.toLowerCase().includes("senate")
      ? "SENATE"
      : candidate.office_sought.toLowerCase().includes("governor")
        ? "GOVERNOR"
        : "HOUSE";

  const kickerLocation =
    candidate.state +
    (candidate.district
      ? `-${String(candidate.district).padStart(2, "0")}`
      : "");

  const lede = buildBiographicalLede({
    name: candidate.name,
    office: candidate.office_sought,
    state: stateName,
    isIncumbent: candidate.is_incumbent,
    positionCount: candidate.positions.filter((p) => p.stance !== "no_mention").length,
    aiCommitteeCount: aiCommittees.length,
    totalCommittees: candidate.committee_assignments.length,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 pb-20 md:pt-14 md:pb-28">
      {/* ============================================================
          Profile hero — 12-col; portrait right, identity left
         ============================================================ */}
      <header className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-6 mb-8">
        <div className="md:col-span-7 order-2 md:order-1">
          <p className="kicker mb-4">
            {kickerLocation} &middot; {chamberRef}
          </p>
          <h1 className="font-display text-display-xl font-bold text-text-primary leading-[0.98]">
            {candidate.name}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <PartyBadge party={candidate.party} size="md" />
            <span className="byline text-text-secondary" style={{ letterSpacing: "0.15em" }}>
              {candidate.office_sought}
            </span>
            {candidate.is_incumbent && (
              <span className="tag-incumbent">
                <span aria-hidden="true">✦</span>
                Incumbent
              </span>
            )}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1">
            <p className="byline" style={{ margin: 0 }}>
              Last updated{" "}
              {new Date(candidate.updated_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
            {candidate.total_raised != null && candidate.total_raised > 0 && (
              <>
                <span
                  aria-hidden="true"
                  className="text-border-strong"
                  style={{ fontSize: "0.75rem" }}
                >
                  ·
                </span>
                <p className="byline" style={{ margin: 0 }}>
                  <span className="text-text-muted">Raised</span>{" "}
                  <span className="font-mono tabular-nums text-text-primary">
                    ${candidate.total_raised.toLocaleString("en-US")}
                  </span>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Portrait — square frame, 220×260 on desktop */}
        <div className="md:col-span-5 order-1 md:order-2 flex md:justify-end">
          <div
            className="portrait-frame w-40 md:w-[220px]"
            style={{ aspectRatio: "11 / 13" }}
          >
            {(() => {
              const src = resolveCandidatePhoto(candidate);
              return src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={candidate.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className="monogram"
                  style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
                >
                  {initials(candidate.first_name, candidate.last_name)}
                </span>
              );
            })()}
          </div>
        </div>
      </header>

      {/* Hair rule below hero */}
      <div className="rule-hair" aria-hidden="true" />

      {/* ============================================================
          Lede + committee marginalia — 12-col
         ============================================================ */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-8 mt-10">
        <div className="md:col-span-8">
          <p className="kicker-muted mb-4">The Record</p>
          <p
            className="drop-cap font-body text-[17px] md:text-[18px] leading-[1.65] text-text-primary"
            style={{ maxWidth: "64ch" }}
          >
            {lede}
          </p>
        </div>

        {/* Committee marginalia rail */}
        {candidate.committee_assignments.length > 0 && (
          <aside className="md:col-span-4 md:pl-6 md:border-l md:border-border">
            <p className="marginalia-label mb-3">Committees</p>
            <ul className="space-y-2">
              {aiCommittees.map((c) => (
                <li
                  key={c}
                  className="flex items-baseline gap-2 smallcaps text-sm text-text-primary"
                >
                  <span
                    className="text-accent-gold text-xs shrink-0"
                    aria-hidden="true"
                  >
                    ◆
                  </span>
                  <span>{c}</span>
                </li>
              ))}
              {otherCommittees.map((c) => (
                <li
                  key={c}
                  className="flex items-baseline gap-2 smallcaps text-sm text-text-secondary"
                >
                  <span
                    className="text-border-strong text-xs shrink-0"
                    aria-hidden="true"
                  >
                    ◇
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            {aiCommittees.length > 0 && (
              <p className="marginalia mt-4" style={{ letterSpacing: "0.05em" }}>
                <span className="text-accent-gold" aria-hidden="true">◆</span>{" "}
                AI-adjacent body
              </p>
            )}
          </aside>
        )}
      </section>

      {/* Rule ornament */}
      <div className="rule-ornament" aria-hidden="true">
        <span>&#10086;</span>
      </div>

      {/* ============================================================
          Positions section
         ============================================================ */}
      <section className="mb-4">
        <div className="section-opener">
          <p className="kicker">Part I</p>
          <h2 className="font-display text-display-md font-bold text-text-primary">
            AI Policy Positions
          </h2>
          <p className="dek">
            {candidate.positions.length > 0
              ? `${candidate.positions.length} issues surveyed. Every stance cited.`
              : "No positions on the record yet."}
          </p>
          <div className="rule-hair mt-2" aria-hidden="true" />
        </div>
        <PositionGrid positions={candidate.positions} />
      </section>

      {/* ============================================================
          Further Citations — general sources not attached to a specific
          position. Renders only when present.
         ============================================================ */}
      {candidate.general_sources.length > 0 && (
        <>
          <div className="rule-ornament" aria-hidden="true">
            <span>&#10086;</span>
          </div>
          <section className="mb-4">
            <div className="section-opener">
              <p className="kicker">
                Part {candidate.legislative_activity.length > 0 ? "II" : "II"}
              </p>
              <h2 className="font-display text-display-md font-bold text-text-primary">
                Further Citations
              </h2>
              <p className="dek">
                Public statements and legislation not yet tied to a specific
                topic above.
              </p>
              <div className="rule-hair mt-2" aria-hidden="true" />
            </div>
            <ul className="mt-6 divide-y divide-border">
              {candidate.general_sources.map((s, i) => {
                const host = s.url
                  ? (() => {
                      try {
                        return new URL(s.url).hostname
                          .replace(/^www\./, "")
                          .toUpperCase();
                      } catch {
                        return null;
                      }
                    })()
                  : null;
                const SOURCE_TYPE_LABEL: Record<string, string> = {
                  statement: "Statement",
                  legislation: "Legislation",
                  survey: "Survey",
                  social_media: "Social Media",
                  news: "News",
                };
                const typeLabel = SOURCE_TYPE_LABEL[s.type] ?? s.type;
                return (
                  <li
                    key={`${s.url ?? "src"}-${i}`}
                    className="py-4 first:pt-4"
                  >
                    <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
                      <span
                        className="marginalia-label shrink-0"
                        style={{ margin: 0 }}
                      >
                        {typeLabel}
                      </span>
                      {s.title && (
                        <h3 className="font-display text-[17px] font-semibold leading-snug text-text-primary">
                          {s.title}
                        </h3>
                      )}
                    </div>
                    {s.url && host && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 marginalia-label hover:text-accent-primary transition-colors"
                        style={{ margin: "0.25rem 0 0" }}
                      >
                        {host}
                        <span aria-hidden="true">→</span>
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}

      {/* ============================================================
          Legislative activity — only rendered when data exists
         ============================================================ */}
      {candidate.legislative_activity.length > 0 && (
        <>
          <div className="rule-ornament" aria-hidden="true">
            <span>&#10086;</span>
          </div>
          <section>
            <div className="section-opener">
              <p className="kicker">
                Part {candidate.general_sources.length > 0 ? "III" : "II"}
              </p>
              <h2 className="font-display text-display-md font-bold text-text-primary">
                Legislative Activity
              </h2>
              <p className="dek">
                Bills, votes, hearings, and public statements.
              </p>
              <div className="rule-hair mt-2" aria-hidden="true" />
            </div>
            <LegislativeActivity activities={candidate.legislative_activity} />
          </section>
        </>
      )}

      {/* Footer mini-masthead */}
      <div className="rule-ornament mt-14" aria-hidden="true">
        <span>&#10086;</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 marginalia-label" style={{ margin: 0 }}>
        <Link href="/corrections" className="hover:text-accent-primary transition-colors">
          Corrections
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/about" className="hover:text-accent-primary transition-colors">
          Methodology
        </Link>
        <span aria-hidden="true">·</span>
        <span>
          {chamberLabel(
            chamberRef === "SENATE"
              ? "senate"
              : chamberRef === "GOVERNOR"
                ? "governor"
                : "house"
          )}
        </span>
      </div>
    </div>
  );
}
