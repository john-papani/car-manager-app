"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type DeleteEntryButtonProps = {
  entryId: string;
  endpoint: string;
  label?: string;
  confirmMessage: string;
};

export default function DeleteEntryButton({
  entryId,
  endpoint,
  label = "Delete",
  confirmMessage,
}: DeleteEntryButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`${endpoint}?id=${encodeURIComponent(entryId)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let message = "Failed to delete entry";

        try {
          const data = (await response.json()) as { message?: string };
          message = data.message || message;
        } catch {
          // Ignore JSON parse failures and keep fallback text.
        }

        throw new Error(message);
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Delete failed.",
      );
      setIsDeleting(false);
    }
  }

  const disabled = isDeleting || isPending;

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={disabled}
      className="inline-flex items-center justify-center rounded-full border border-[rgb(173_84_37_/_0.12)] bg-[rgb(255_251_246_/_0.88)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-strong)] transition hover:border-[rgb(173_84_37_/_0.22)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-55"
    >
      {disabled ? "Deleting..." : label}
    </button>
  );
}
