interface StatsBarProps {
  stats: { label: string; value: string | number }[];
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-0 md:divide-x md:divide-border">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center px-6 py-3 md:py-0"
        >
          <span className="font-mono text-2xl font-bold text-text-primary tabular-nums">
            {typeof stat.value === "number"
              ? stat.value.toLocaleString()
              : stat.value}
          </span>
          <span className="mt-1 text-xs text-text-muted uppercase tracking-wider">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
