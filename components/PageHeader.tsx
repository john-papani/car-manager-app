import Link from "next/link";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel = "+ Νέο",
}: PageHeaderProps) {
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
