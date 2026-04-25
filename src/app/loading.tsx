export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-5">
        {/* Subtle animated bar chart silhouette */}
        <div className="flex items-end gap-1.5 h-8">
          <div className="w-2 bg-accent-primary/20 rounded-sm animate-pulse" style={{ height: '60%', animationDelay: '0s' }} />
          <div className="w-2 bg-accent-primary/20 rounded-sm animate-pulse" style={{ height: '100%', animationDelay: '0.15s' }} />
          <div className="w-2 bg-accent-primary/20 rounded-sm animate-pulse" style={{ height: '40%', animationDelay: '0.3s' }} />
          <div className="w-2 bg-accent-primary/20 rounded-sm animate-pulse" style={{ height: '80%', animationDelay: '0.45s' }} />
          <div className="w-2 bg-accent-primary/20 rounded-sm animate-pulse" style={{ height: '55%', animationDelay: '0.6s' }} />
        </div>
        <p className="text-sm text-text-muted tracking-wide">
          Loading policy data...
        </p>
      </div>
    </div>
  );
}
