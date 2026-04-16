interface QuoteCardProps {
  quote: string;
  source: string | null;
  sourceUrl: string | null;
  date: string | null;
}

export function QuoteCard({ quote, source, sourceUrl, date }: QuoteCardProps) {
  return (
    <blockquote className="border-l-4 border-accent-primary pl-4 py-2">
      <p className="text-text-secondary italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
      <footer className="mt-2 flex items-center gap-2 text-xs text-text-muted">
        {sourceUrl ? (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-accent-primary transition-colors"
          >
            {source ?? "Source"}
          </a>
        ) : source ? (
          <span>{source}</span>
        ) : null}
        {date && (
          <>
            {(source || sourceUrl) && <span aria-hidden="true">&middot;</span>}
            <time className="font-mono" dateTime={date}>
              {new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
          </>
        )}
      </footer>
    </blockquote>
  );
}
