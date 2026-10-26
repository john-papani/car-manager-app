import Link from "next/link";

type EntryPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
};

export default function EntryPageHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
}: EntryPageHeaderProps) {
  return (
    <section className="rounded-[1.75rem] bg-[var(--navy)] p-5 text-white">

      <div className="relative min-w-0">
        <Link
          href={backHref}
          className="inline-flex items-center rounded-full border border-white/30 px-3 py-1.5 text-xs font-semibold text-white"
        >
          ← {backLabel}
        </Link>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/62">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-[22rem] text-sm leading-6 text-white/74">
          {description}
        </p>
      </div>
    </section>
  );
}
