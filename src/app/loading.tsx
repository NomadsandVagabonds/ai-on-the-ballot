export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-8 w-48 bg-bg-elevated rounded" />
        <div className="h-4 w-64 bg-bg-elevated rounded" />
      </div>
    </div>
  );
}
