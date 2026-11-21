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

      <section className="mt-3 space-y-2">
        {filteredEntries.length === 0 ? (
          <div className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-5 text-sm text-[var(--muted)]">
            Δεν βρέθηκαν έξοδα με τα τρέχοντα φίλτρα.
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-2xl border border-[var(--line)] bg-[var(--card)] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--muted)]">{entry.date}</p>
                  <h2 className="mt-0.5 truncate text-lg font-semibold tracking-tight text-[var(--foreground)]">
                    {entry.category}
                  </h2>
                </div>
                <div className="flex items-center gap-1">
                  <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent-strong)]">
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

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--line)] pt-2 text-xs text-[var(--muted)]">
                <span className="font-medium text-[var(--foreground)]">
                  {entry.vendor || "Χωρίς σημείο"}
                </span>
                {entry.odometer ? (
                  <span>{entry.odometer.toLocaleString("el-GR")} km</span>
                ) : null}
              </div>

              {entry.notes ? (
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
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
