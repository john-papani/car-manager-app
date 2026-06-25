type FormActionBarProps = {
  disabled?: boolean;
  isSubmitting?: boolean;
  idleLabel: string;
  submittingLabel: string;
  hint?: string;
};

export default function FormActionBar({
  disabled,
  isSubmitting,
  idleLabel,
  submittingLabel,
  hint,
}: FormActionBarProps) {
  return (
    <div className="mt-6 space-y-2">
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex w-full items-center justify-center gap-2 rounded-[1.15rem] bg-[var(--navy)] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_34px_rgb(18_49_59_/_0.2)] transition hover:bg-[rgb(16_43_52_/_0.96)] disabled:cursor-not-allowed disabled:opacity-55"
      >
        {isSubmitting ? (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
          />
        ) : null}
        {isSubmitting ? submittingLabel : idleLabel}
      </button>

      {hint ? (
        <p className="text-center text-xs leading-5 text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
