export default function PageSkeleton() {
  return (
    <main className="mx-auto min-h-screen max-w-md animate-pulse px-4 py-5 pb-32">
      <div className="h-36 rounded-[2rem] bg-[var(--line)]" />

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="h-20 rounded-[1.6rem] bg-[var(--line)]" />
        <div className="h-20 rounded-[1.6rem] bg-[var(--line)]" />
      </div>

      <div className="mt-5 space-y-3">
        <div className="h-40 rounded-[1.9rem] bg-[var(--line)]" />
        <div className="h-40 rounded-[1.9rem] bg-[var(--line)]" />
      </div>
    </main>
  );
}
