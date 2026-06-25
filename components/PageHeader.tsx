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
    <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,#102b34_0%,#214955_48%,#ca6f3d_155%)] p-5 text-white shadow-[0_24px_80px_rgb(18_49_59_/_0.2)]">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 left-8 h-32 w-32 rounded-full bg-[rgb(255_214_183_/_0.14)] blur-3xl" />

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
            className="shrink-0 rounded-full bg-white px-4 py-2.5 text-sm font-semibold !text-[var(--navy)] shadow-[0_14px_28px_rgb(255_255_255_/_0.18)] transition active:scale-95"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
