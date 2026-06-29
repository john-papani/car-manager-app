"use client";

import { useMemo, useState } from "react";
import EmptyState from "@/components/EmptyState";
import EntryActions from "@/components/EntryActions";
import EntryListFilters from "@/components/EntryListFilters";
import {
  emptyEntryFilters,
  filterFuelEntries,
  type EntryFilterState,
} from "@/lib/entry-filters";
import {
  calculateConsumption,
  calculateCostPerKm,
} from "@/lib/fuel-calculations";
import type { FuelEntry } from "@/types/car";

type FuelEntryListProps = {
  entries: FuelEntry[];
};

export default function FuelEntryList({ entries }: FuelEntryListProps) {
  const [filters, setFilters] = useState<EntryFilterState>(emptyEntryFilters);

  const sortedEntries = useMemo(
    () => [...entries].sort((left, right) => right.odometer - left.odometer),
    [entries],
  );

  const filteredEntries = useMemo(
    () => filterFuelEntries(sortedEntries, filters),
    [sortedEntries, filters],
  );

  const previousById = useMemo(() => {
    const chronologicalEntries = [...entries].sort(
      (left, right) => left.odometer - right.odometer,
    );
    const map = new Map<string, FuelEntry | undefined>();

    for (let index = 0; index < chronologicalEntries.length; index += 1) {
      map.set(
        chronologicalEntries[index].id,
        index > 0 ? chronologicalEntries[index - 1] : undefined,
      );
    }

    return map;
  }, [entries]);

  const stations = useMemo(
    () => entries.map((entry) => entry.station),
    [entries],
  );

  if (entries.length === 0) {
    return (
      <EmptyState
        title="Δεν έχεις ακόμα γεμίσματα"
        description="Πρόσθεσε το πρώτο για να ξεκινήσουν τα στατιστικά κατανάλωσης."
        actionHref="/fuel/new"
        actionLabel="Πρώτο γέμισμα"
      />
    );
  }

  return (
    <>
      <EntryListFilters
        totalCount={entries.length}
        filteredCount={filteredEntries.length}
        stations={stations}
        onChange={setFilters}
      />

      <section className="mt-5 space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-5 text-sm text-[var(--muted)]">
            Δεν βρέθηκαν γεμίσματα με τα τρέχοντα φίλτρα.
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const previousEntry = previousById.get(entry.id);
            const consumption = calculateConsumption(entry, previousEntry);
            const costPerKm = calculateCostPerKm(entry, previousEntry);

            return (
              <article
                key={entry.id}
                className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-[var(--muted)]">{entry.date}</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                      {entry.total_cost.toFixed(2)}€
                    </h2>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accent-strong)]">
                      {entry.price_per_liter.toFixed(3)}€/L
                    </span>
                    <EntryActions
                      editHref={`/fuel/edit?id=${encodeURIComponent(entry.id)}`}
                      entryId={entry.id}
                      endpoint="/api/fuel"
                      confirmMessage="Να διαγραφεί αυτή η καταχώρηση καυσίμου;"
                    />
                  </div>
                </div>

                <p className="mt-3 text-sm text-[var(--muted)]">
                  {entry.station || "Χωρίς πρατήριο"}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
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
                      Λίτρα
                    </p>
                    <p className="mt-1 font-semibold text-[var(--foreground)]">
                      {entry.liters.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] bg-[var(--accent-soft)]/50 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--accent-strong)]">
                      L/100km
                    </p>
                    <p className="mt-1 font-semibold text-[var(--foreground)]">
                      {consumption ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end gap-3 text-sm text-[var(--muted)]">
                  {entry.receipt_url ? (
                    <a
                      href={entry.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-[var(--accent-strong)]"
                    >
                      Απόδειξη
                    </a>
                  ) : null}
                  <span>{costPerKm ? `${costPerKm}€/km` : "—€/km"}</span>
                </div>
              </article>
            );
          })
        )}
      </section>
    </>
  );
}
