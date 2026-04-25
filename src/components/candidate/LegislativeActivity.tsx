import type {
  LegislativeActivityRow,
  LegislativeActivityType,
} from "@/types/database";

interface LegislativeActivityProps {
  activities: LegislativeActivityRow[];
}

const ACTIVITY_TYPE_LABELS: Record<LegislativeActivityType, string> = {
  bill_sponsored: "Bill Sponsored",
  bill_cosponsored: "Bill Cosponsored",
  vote: "Vote",
  hearing: "Hearing",
  letter: "Letter",
  statement: "Statement",
};

const ACTIVITY_GLYPHS: Record<LegislativeActivityType, string> = {
  bill_sponsored: "◆",
  bill_cosponsored: "◇",
  vote: "●",
  hearing: "▲",
  letter: "❧",
  statement: "—",
};

const INITIAL_VISIBLE = 5;

function hostnameOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "").toUpperCase();
  } catch {
    return null;
  }
}

function formatActivityDate(date: string | null): {
  year: string | null;
  line: string | null;
} {
  if (!date) return { year: null, line: null };
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return { year: null, line: null };
  return {
    year: String(d.getFullYear()),
    line: d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  };
}

function ActivityNode({ activity }: { activity: LegislativeActivityRow }) {
  const { line: dateLine } = formatActivityDate(activity.date);
  const host = hostnameOf(activity.source_url);
  const typeLabel = ACTIVITY_TYPE_LABELS[activity.activity_type] ?? activity.activity_type;
  const glyph = ACTIVITY_GLYPHS[activity.activity_type] ?? "·";

  return (
    <li className="relative pl-10 pb-8 last:pb-0">
      {/* Glyph node sitting on the timeline rule */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 flex items-center justify-center w-6 h-6 -translate-x-[11px] rounded-full bg-bg-primary text-accent-primary text-[13px] leading-none"
      >
        {glyph}
      </span>

      <div className="flex items-baseline gap-3 mb-1">
        {dateLine && (
          <time
            dateTime={activity.date ?? undefined}
            className="font-mono text-sm font-semibold text-text-primary tabular-nums shrink-0"
          >
            {dateLine}
          </time>
        )}
        <span
          className="text-[11px] font-semibold uppercase text-text-muted"
          style={{ letterSpacing: "0.08em" }}
        >
          {typeLabel}
        </span>
      </div>

      <h4 className="font-display text-[17px] leading-[1.35] font-semibold text-text-primary">
        {activity.title}
      </h4>

      {activity.description && (
        <p
          className="mt-1.5 text-[14px] leading-[1.6] text-text-secondary"
          style={{ maxWidth: "62ch" }}
        >
          {activity.description}
        </p>
      )}

      {activity.source_url && host && (
        <a
          href={activity.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 marginalia-label hover:text-accent-primary transition-colors"
          style={{ margin: "0.5rem 0 0" }}
        >
          Source: {host}
          <span aria-hidden="true">→</span>
        </a>
      )}
    </li>
  );
}

function ActivityList({
  activities,
}: {
  activities: LegislativeActivityRow[];
}) {
  // Group by year, preserving input order (activities assumed pre-sorted desc).
  const byYear: Array<{ year: string | null; items: LegislativeActivityRow[] }> = [];
  for (const a of activities) {
    const { year } = formatActivityDate(a.date);
    const last = byYear[byYear.length - 1];
    if (last && last.year === year) {
      last.items.push(a);
    } else {
      byYear.push({ year, items: [a] });
    }
  }

  return (
    <div className="relative">
      {/* Vertical rule down the timeline */}
      <div
        aria-hidden="true"
        className="absolute left-[11px] top-2 bottom-0 w-px bg-border-strong"
      />
      {byYear.map((group, gi) => (
        <div key={gi} className="relative">
          {group.year && (
            <h3
              className="relative font-display text-[22px] font-bold text-text-muted mb-4 pl-10 tabular-nums"
              style={{ letterSpacing: "-0.01em" }}
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-1 flex items-center justify-center w-6 h-6 -translate-x-[11px] rounded-full bg-bg-primary text-text-muted text-[11px] leading-none border border-border-strong"
              >
                §
              </span>
              {group.year}
            </h3>
          )}
          <ul className="m-0 p-0 list-none">
            {group.items.map((activity) => (
              <ActivityNode key={activity.id} activity={activity} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function LegislativeActivity({ activities }: LegislativeActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="py-14 text-center">
        <p className="font-display text-lg text-text-secondary">
          No legislative activity tracked yet.
        </p>
      </div>
    );
  }

  const initial = activities.slice(0, INITIAL_VISIBLE);
  const rest = activities.slice(INITIAL_VISIBLE);
  const hasMore = rest.length > 0;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-6">
        <p className="kicker-muted">
          {activities.length} entr{activities.length === 1 ? "y" : "ies"}
        </p>
      </div>

      <ActivityList activities={initial} />

      {hasMore && (
        <details className="group mt-4">
          <summary className="cursor-pointer list-none inline-flex items-center gap-2 marginalia-label hover:text-accent-primary transition-colors" style={{ margin: 0 }}>
            <span className="group-open:hidden">
              Show all {activities.length} entries
              <span aria-hidden="true"> ↓</span>
            </span>
            <span className="hidden group-open:inline">
              Show fewer
              <span aria-hidden="true"> ↑</span>
            </span>
          </summary>
          <div className="mt-6">
            <ActivityList activities={rest} />
          </div>
        </details>
      )}
    </div>
  );
}
