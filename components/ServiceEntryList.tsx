"use client";

import { useMemo, useState } from "react";
import EmptyState from "@/components/EmptyState";
import EntryActions from "@/components/EntryActions";
import EntryListFilters from "@/components/EntryListFilters";
import {
  emptyEntryFilters,
  filterServiceEntries,
  type EntryFilterState,
} from "@/lib/entry-filters";
import type { ServiceEntry } from "@/types/car";

type ServiceEntryListProps = {
  entries: ServiceEntry[];
};

export default function ServiceEntryList({ entries }: ServiceEntryListProps) {
  const [filters, setFilters] = useState<EntryFilterState>(emptyEntryFilters);

  const sortedEntries = useMemo(
    () => [...entries].sort((left, right) => right.odometer - left.odometer),
    [entries],
  );

  const filteredEntries = useMemo(
    () => filterServiceEntries(sortedEntries, filters),
    [sortedEntries, filters],
  );

  if (entries.length === 0) {
    return (
      <EmptyState
        title="Δεν υπάρχουν εργασίες service"
        description="Κατέγραψε την πρώτη για να κρατάς οργανωμένο το ιστορικό συντήρησης."
        actionHref="/service/new"
        actionLabel="Πρώτη εργασία"
      />
    );
  }

  return (
    <>
      <EntryListFilters
        totalCount={entries.length}
        filteredCount={filteredEntries.length}
        onChange={setFilters}
      />

      <section className="mt-5 space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-5 text-sm text-[var(--muted)]">
            Δεν βρέθηκαν εργασίες με τα τρέχοντα φίλτρα.
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
                    {entry.service_type}
                  </h2>
                </div>
                <div className="flex items-center gap-1">
                  <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-strong)]">
                    {entry.total_cost.toFixed(2)}€
                  </span>
                  <EntryActions
                    editHref={`/service/edit?id=${encodeURIComponent(entry.id)}`}
                    entryId={entry.id}
                    endpoint="/api/service"
                    confirmMessage="Να διαγραφεί αυτή η εργασία service;"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-[1.35rem] bg-white/70 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                    Km
                  </p>
                  <p className="mt-1 font-semibold text-[var(--foreground)]">
                    {entry.odometer.toLocaleString("el-GR")}
                  </p>
                </div>
                <div className="rounded-[1.35rem] bg-white/70 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                    Επόμενο
                  </p>
                  <p className="mt-1 font-semibold text-[var(--foreground)]">
                    {entry.next_service_odometer
                      ? entry.next_service_odometer.toLocaleString("el-GR")
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-1 text-sm text-[var(--muted)]">
                <p>{entry.location || "Χωρίς συνεργείο"}</p>
                {entry.notes ? <p>{entry.notes}</p> : null}
              </div>
            </article>
          ))
        )}
      </section>
    </>
  );
}
