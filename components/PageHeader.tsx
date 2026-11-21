import Link from "next/link";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  compact?: boolean;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel = "+ Νέο",
  compact = false,
}: PageHeaderProps) {
  if (compact) {
    return (
      <header className="flex items-center justify-between gap-3 py-1">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[var(--muted)]">{eyebrow}</p>
          <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
        {actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex min-h-11 shrink-0 items-center rounded-xl bg-[var(--navy)] px-4 text-sm font-semibold !text-white"
          >
            {actionLabel}
          </Link>
        ) : null}
      </header>
    );
  }

  return (
    <section className="rounded-[1.75rem] bg-[var(--navy)] p-5 text-white">

      <div className="relative flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/62">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-[20rem] text-sm leading-6 text-white/72">
            {description}
          </p>
        </div>

        {actionHref ? (
          <Link
            href={actionHref}
            className="shrink-0 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold !text-[var(--navy)]"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
