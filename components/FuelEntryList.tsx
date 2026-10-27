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
import {
  buildCalendarDays,
  monthKey,
  moveMonth,
} from "@/lib/fuel-calendar-grid";
import type { FuelEntry } from "@/types/car";

type FuelEntryListProps = {
  entries: FuelEntry[];
};

export default function FuelEntryList({ entries }: FuelEntryListProps) {
  const [filters, setFilters] = useState<EntryFilterState>(emptyEntryFilters);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [visibleMonth, setVisibleMonth] = useState(() =>
    monthKey(
      [...entries].sort((a, b) => b.date.localeCompare(a.date))[0]?.date ??
        "1970-01-01",
    ),
  );
  const [selectedDate, setSelectedDate] = useState<string>();

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

  const entriesByDate = useMemo(() => {
    const grouped = new Map<string, FuelEntry[]>();

    for (const entry of filteredEntries) {
      grouped.set(entry.date, [...(grouped.get(entry.date) ?? []), entry]);
    }

    return grouped;
  }, [filteredEntries]);

  const calendarDays = useMemo(
    () => buildCalendarDays(visibleMonth),
    [visibleMonth],
  );
  const selectedEntries = selectedDate
    ? (entriesByDate.get(selectedDate) ?? [])
    : [];
  const monthLabel = new Intl.DateTimeFormat("el-GR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${visibleMonth}-01T00:00:00Z`));

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

      <div
        className="mt-4 grid grid-cols-2 rounded-full bg-[var(--background-strong)] p-1"
        role="group"
        aria-label="Τρόπος προβολής"
      >
        {(["list", "calendar"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setView(option)}
            aria-pressed={view === option}
            className={`min-h-10 rounded-full px-4 text-sm font-semibold ${
              view === option
                ? "bg-white text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted)]"
            }`}
          >
            {option === "list" ? "Λίστα" : "Ημερολόγιο"}
          </button>
        ))}
      </div>

      {view === "list" ? (
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
      ) : (
        <section className="mt-4 rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-3 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]">
          <div className="flex items-center justify-between gap-3 px-1 py-1">
            <button
              type="button"
              onClick={() => {
                setVisibleMonth((month) => moveMonth(month, -1));
                setSelectedDate(undefined);
              }}
              className="grid size-10 place-items-center rounded-full border border-[var(--line)] text-xl"
              aria-label="Προηγούμενος μήνας"
            >
              ‹
            </button>
            <h2 className="text-base font-semibold capitalize">{monthLabel}</h2>
            <button
              type="button"
              onClick={() => {
                setVisibleMonth((month) => moveMonth(month, 1));
                setSelectedDate(undefined);
              }}
              className="grid size-10 place-items-center rounded-full border border-[var(--line)] text-xl"
              aria-label="Επόμενος μήνας"
            >
              ›
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 text-center text-[10px] font-semibold uppercase text-[var(--muted)]">
            {["Δε", "Τρ", "Τε", "Πε", "Πα", "Σα", "Κυ"].map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dayEntries = entriesByDate.get(day.date) ?? [];
              const isSelected = selectedDate === day.date;

              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() =>
                    dayEntries.length > 0 && setSelectedDate(day.date)
                  }
                  disabled={dayEntries.length === 0}
                  aria-label={`${day.date}${dayEntries.length ? `, ${dayEntries.length} γεμίσματα` : ""}`}
                  className={`relative aspect-square min-w-0 rounded-xl text-sm ${
                    isSelected
                      ? "bg-[var(--accent)] font-semibold text-white"
                      : dayEntries.length
                        ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent-strong)]"
                        : day.inMonth
                          ? "text-[var(--foreground)]"
                          : "text-[var(--muted)]/35"
                  }`}
                >
                  {day.day}
                  {dayEntries.length > 0 ? (
                    <span
                      className={`absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full ${isSelected ? "bg-white" : "bg-[var(--accent)]"}`}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          {selectedEntries.length > 0 ? (
            <div className="mt-3 space-y-2 border-t border-[var(--line)] pt-3">
              {selectedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--accent-soft)]/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {entry.total_cost.toFixed(2)}€ · {entry.liters.toFixed(2)} L
                    </p>
                    <p className="truncate text-xs text-[var(--muted)]">
                      {entry.station || "Χωρίς πρατήριο"}
                    </p>
                  </div>
                  <EntryActions
                    editHref={`/fuel/edit?id=${encodeURIComponent(entry.id)}`}
                    entryId={entry.id}
                    endpoint="/api/fuel"
                    confirmMessage="Να διαγραφεί αυτή η καταχώρηση καυσίμου;"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 border-t border-[var(--line)] px-1 pt-3 text-xs text-[var(--muted)]">
              Πάτησε μια επισημασμένη ημέρα για λεπτομέρειες.
            </p>
          )}
        </section>
      )}
    </>
  );
}
