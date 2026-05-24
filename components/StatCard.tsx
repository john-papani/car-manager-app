type StatCardProps = {
  label: string;
  value: string;
  tone?: "default" | "accent";
};

export default function StatCard({
  label,
  value,
  tone = "default",
}: StatCardProps) {
  const toneClass =
    tone === "accent"
      ? "bg-[linear-gradient(160deg,#16313a_0%,#244752_100%)] text-white shadow-xl shadow-navy/10 border-white/10"
      : "bg-[var(--card)] text-[var(--foreground)] shadow-[var(--surface-shadow)] backdrop-blur-md border-white/40";

  return (
    <div
      className={`rounded-[2rem] border p-4.5 transition-transform active:scale-[0.98] shadow-[var(--inner-glow)] ${toneClass}`}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
          tone === "accent" ? "text-white/62" : "text-[var(--muted)]"
        }`}
      >
        {label}
      </p>
      <p className="mt-3 text-[1.6rem] font-semibold tracking-tight">{value}</p>
    </div>
  );
}
