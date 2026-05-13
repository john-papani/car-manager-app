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
      ? "bg-[linear-gradient(180deg,#16313a_0%,#244752_100%)] text-white shadow-[0_20px_50px_rgb(18_49_59_/_0.16)]"
      : "bg-[var(--card)] text-[var(--foreground)] shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]";

  return (
    <div
      className={`rounded-[1.75rem] border border-[var(--line)] p-4 ${toneClass}`}
    >
      <p
        className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
          tone === "accent" ? "text-white/62" : "text-[var(--muted)]"
        }`}
      >
        {label}
      </p>
      <p className="mt-3 text-[1.6rem] font-semibold tracking-tight">{value}</p>
    </div>
  );
}
