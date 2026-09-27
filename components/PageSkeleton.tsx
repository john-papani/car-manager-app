export default function PageSkeleton() {
  return (
    <main className="mx-auto min-h-screen max-w-md animate-pulse px-3 py-4 pb-32 min-[360px]:px-4 min-[360px]:py-5">
      <div className="h-52 rounded-3xl bg-[var(--line)]" />
      <div className="mt-5 h-36 rounded-2xl bg-[var(--line)]" />
    </main>
  );
}
