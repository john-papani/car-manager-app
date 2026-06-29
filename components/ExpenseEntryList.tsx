"use client";

import { useMemo, useState } from "react";
import EmptyState from "@/components/EmptyState";
import EntryActions from "@/components/EntryActions";
import EntryListFilters from "@/components/EntryListFilters";
import {
  emptyEntryFilters,
  filterExpenseEntries,
  type EntryFilterState,
} from "@/lib/entry-filters";
import type { ExpenseEntry } from "@/types/car";

type ExpenseEntryListProps = {
  entries: ExpenseEntry[];
};

export default function ExpenseEntryList({ entries }: ExpenseEntryListProps) {
  const [filters, setFilters] = useState<EntryFilterState>(emptyEntryFilters);

  const sortedEntries = useMemo(
    () =>
      [...entries].sort((left, right) => {
        const dateCompare = right.date.localeCompare(left.date);
        return dateCompare !== 0
          ? dateCompare
          : right.created_at.localeCompare(left.created_at);
      }),
    [entries],
  );

  const filteredEntries = useMemo(
    () => filterExpenseEntries(sortedEntries, filters),
    [sortedEntries, filters],
  );

  const categories = useMemo(
    () => entries.map((entry) => entry.category),
    [entries],
  );

  if (entries.length === 0) {
    return (
      <EmptyState
        title="Δεν υπάρχουν έξοδα"
        description="Πρόσθεσε το πρώτο για να βλέπεις πού πηγαίνουν τα χρήματα."
        actionHref="/expenses/new"
        actionLabel="Πρώτο έξοδο"
      />
    );
  }

  return (
    <>
      <EntryListFilters
        totalCount={entries.length}
        filteredCount={filteredEntries.length}
        categories={categories}
        showOdometer={entries.some((entry) => entry.odometer)}
        onChange={setFilters}
      />

      <section className="mt-5 space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-5 text-sm text-[var(--muted)]">
            Δεν βρέθηκαν έξοδα με τα τρέχοντα φίλτρα.
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-[var(--muted)]">{entry.date}</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                    {entry.category}
                  </h2>
                </div>
                <div className="flex items-center gap-1">
                  <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-strong)]">
                    {entry.total_cost.toFixed(2)}€
                  </span>
                  <EntryActions
                    editHref={`/expenses/edit?id=${encodeURIComponent(entry.id)}`}
                    entryId={entry.id}
                    endpoint="/api/expenses"
                    confirmMessage="Να διαγραφεί αυτό το έξοδο;"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-[1.35rem] bg-white/70 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                    Σημείο
                  </p>
                  <p className="mt-1 font-semibold text-[var(--foreground)]">
                    {entry.vendor || "—"}
                  </p>
                </div>
                <div className="rounded-[1.35rem] bg-white/70 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                    Km
                  </p>
                  <p className="mt-1 font-semibold text-[var(--foreground)]">
                    {entry.odometer
                      ? entry.odometer.toLocaleString("el-GR")
                      : "—"}
                  </p>
                </div>
              </div>

              {entry.notes ? (
                <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                  {entry.notes}
                </p>
              ) : null}
            </article>
          ))
        )}
      </section>
    </>
  );
}
