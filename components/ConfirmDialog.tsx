"use client";

import { useEffect, useId, useRef } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Διαγραφή",
  cancelLabel = "Ακύρωση",
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    cancelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-[rgb(18_49_59_/_0.42)] p-4 sm:items-center"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md rounded-[1.6rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[0_24px_60px_rgb(18_49_59_/_0.22)]"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold text-[var(--foreground)]">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-6 text-[var(--muted)]">
          {message}
        </p>

        <div className="mt-5 flex gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 rounded-[1.1rem] border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--foreground)] disabled:opacity-55"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 rounded-[1.1rem] bg-[var(--accent-strong)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-55"
          >
            {isPending ? "Διαγραφή..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
