import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export default function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="rounded-[1.9rem] border border-dashed border-[var(--line)] bg-[var(--card)] p-8 text-center shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)] text-2xl">
        📋
      </div>
      <p className="mt-4 text-lg font-semibold text-[var(--foreground)]">{title}</p>
      <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-6 text-[var(--muted)]">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex rounded-full bg-[var(--navy)] px-5 py-3 text-sm font-semibold !text-white shadow-[0_14px_28px_rgb(18_49_59_/_0.16)] transition active:scale-95"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
