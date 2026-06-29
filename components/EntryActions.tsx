"use client";

import Link from "next/link";
import DeleteEntryButton from "@/components/DeleteEntryButton";

type EntryActionsProps = {
  editHref: string;
  entryId: string;
  endpoint: string;
  confirmMessage: string;
};

function EditIcon() {
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export default function EntryActions({
  editHref,
  entryId,
  endpoint,
  confirmMessage,
}: EntryActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Link
        href={editHref}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-white/80 hover:text-[var(--foreground)] active:scale-95"
        aria-label="Επεξεργασία"
      >
        <EditIcon />
      </Link>
      <DeleteEntryButton
        entryId={entryId}
        endpoint={endpoint}
        confirmMessage={confirmMessage}
      />
    </div>
  );
}
