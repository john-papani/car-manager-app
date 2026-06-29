"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/components/AppProviders";
import ConfirmDialog from "@/components/ConfirmDialog";

type DeleteEntryButtonProps = {
  entryId: string;
  endpoint: string;
  confirmMessage: string;
};

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export default function DeleteEntryButton({
  entryId,
  endpoint,
  confirmMessage,
}: DeleteEntryButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  async function handleDelete() {
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

      setDialogOpen(false);
      startTransition(() => {
        router.refresh();
      });
      showToast("Η καταχώρηση διαγράφηκε.", "success");
    } catch (error) {
      console.error(error);
      showToast(
        error instanceof Error ? error.message : "Η διαγραφή απέτυχε.",
        "error",
      );
      setIsDeleting(false);
    }
  }

  const disabled = isDeleting || isPending;

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        disabled={disabled}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
        aria-label={disabled ? "Διαγραφή..." : "Διαγραφή"}
      >
        <TrashIcon />
      </button>

      <ConfirmDialog
        open={dialogOpen}
        title="Επιβεβαίωση διαγραφής"
        message={confirmMessage}
        isPending={disabled}
        onCancel={() => {
          if (!disabled) {
            setDialogOpen(false);
          }
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}
