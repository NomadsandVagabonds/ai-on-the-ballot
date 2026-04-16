interface StatsBarProps {
  stats: { label: string; value: string | number }[];
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-0 md:divide-x md:divide-border">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="flex flex-col items-center px-8 py-3 md:py-0 stat-animate"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <span className="font-mono text-3xl md:text-4xl font-bold text-text-primary tabular-nums tracking-tight">
            {typeof stat.value === "number"
              ? stat.value.toLocaleString()
              : stat.value}
          </span>
          <span className="mt-1.5 text-[10px] text-text-muted uppercase tracking-[0.15em] font-medium">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
