export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight mb-4">
        AI on the Ballot
      </h1>
      <p className="text-text-secondary text-lg md:text-xl max-w-2xl mb-8">
        A nonpartisan transparency resource documenting the public AI governance
        positions of U.S. congressional candidates.
      </p>
      <p className="text-text-muted text-sm">
        Launching soon — tracking candidates across all 50 states for the 2026
        elections.
      </p>
    </div>
  );
}
