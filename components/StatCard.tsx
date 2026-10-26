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
      ? "bg-[var(--navy)] text-white border-[var(--navy)]"
      : "bg-[var(--card)] text-[var(--foreground)] border-[var(--line)]";

  return (
    <div
      className={`rounded-[1.5rem] border p-4 ${toneClass}`}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
          tone === "accent" ? "text-white/62" : "text-[var(--muted)]"
        }`}
      >
        {label}
      </p>
      <p className="mt-3 break-words text-xl font-semibold leading-snug tracking-tight">{value}</p>
    </div>
  );
}
