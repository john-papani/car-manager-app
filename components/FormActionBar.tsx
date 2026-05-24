type FormActionBarProps = {
  disabled?: boolean;
  isSubmitting?: boolean;
  idleLabel: string;
  submittingLabel: string;
  hint: string;
};

export default function FormActionBar({
  disabled,
  isSubmitting,
  idleLabel,
  submittingLabel,
  hint,
}: FormActionBarProps) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-white/70 bg-[rgb(246_240_230_/_0.92)] px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] pt-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-[1.5rem] border border-[rgb(18_49_59_/_0.08)] bg-[rgb(255_251_246_/_0.92)] p-3 shadow-[0_16px_36px_rgb(18_49_59_/_0.12)]">
        <p className="min-w-0 flex-1 text-sm leading-5 text-[var(--muted)]">
          {hint}
        </p>
        <button
          type="submit"
          disabled={disabled}
          className="inline-flex min-w-44 shrink-0 items-center justify-center rounded-[1.15rem] bg-[var(--navy)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_34px_rgb(18_49_59_/_0.2)] transition hover:bg-[rgb(16_43_52_/_0.96)] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSubmitting ? submittingLabel : idleLabel}
        </button>
      </div>
    </div>
  );
}
