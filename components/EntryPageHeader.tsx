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
    <section className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(160deg,#102b34_0%,#214955_48%,#ca6f3d_155%)] p-5 text-white shadow-[0_24px_80px_rgb(18_49_59_/_0.2)]">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 left-8 h-32 w-32 rounded-full bg-[rgb(255_214_183_/_0.14)] blur-3xl" />

      <div className="relative min-w-0">
        <Link
          href={backHref}
          className="inline-flex items-center rounded-full border border-white/14 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/92 backdrop-blur transition active:scale-95"
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
