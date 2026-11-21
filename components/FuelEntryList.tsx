"use client";

import { Fragment, useMemo, useState } from "react";
import EmptyState from "@/components/EmptyState";
import EntryActions from "@/components/EntryActions";
import EntryListFilters from "@/components/EntryListFilters";
import {
  emptyEntryFilters,
  filterFuelEntries,
  type EntryFilterState,
} from "@/lib/entry-filters";
import { calculateConsumption } from "@/lib/fuel-calculations";
import { buildFuelCsv } from "@/lib/fuel-csv";
import { buildFuelReportHtml } from "@/lib/fuel-report-html";
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
    () => [...entries].sort((left, right) => right.date.localeCompare(left.date) || right.odometer - left.odometer),
    [entries],
  );

  const filteredEntries = useMemo(
    () => filterFuelEntries(sortedEntries, filters),
    [sortedEntries, filters],
  );

  const monthlyTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const entry of filteredEntries) {
      const month = entry.date.slice(0, 7);
      totals.set(month, (totals.get(month) ?? 0) + entry.total_cost);
    }
    return totals;
  }, [filteredEntries]);

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

  function exportCsv() {
    const blob = new Blob([buildFuelCsv(filteredEntries)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `car-manager-fuel-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportPdf() {
    const reportWindow = window.open("", "_blank", "width=1000,height=720");

    if (!reportWindow) {
      alert("Δεν ήταν δυνατό να ανοίξει το παράθυρο εξαγωγής PDF.");
      return;
    }

    reportWindow.document.open();
    reportWindow.document.write(buildFuelReportHtml(filteredEntries));
    reportWindow.document.close();
    reportWindow.onload = () => {
      reportWindow.focus();
      reportWindow.print();
      reportWindow.close();
    };
  }

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

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={exportPdf}
          disabled={filteredEntries.length === 0}
          className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          PDF
        </button>
        <button
          type="button"
          onClick={exportCsv}
          disabled={filteredEntries.length === 0}
          className="min-h-11 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          CSV
        </button>
        <div
          className="grid min-w-0 flex-1 grid-cols-2 rounded-xl bg-[var(--background-strong)] p-1"
          role="group"
          aria-label="Τρόπος προβολής"
        >
        {(["list", "calendar"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setView(option)}
            aria-pressed={view === option}
            className={`min-h-9 rounded-lg px-2 text-xs font-semibold ${
              view === option
                ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted)]"
            }`}
          >
            {option === "list" ? "Λίστα" : "Ημερολόγιο"}
          </button>
        ))}
        </div>
      </div>

      {view === "list" ? (
        <section className="mt-4 space-y-2">
          {filteredEntries.length === 0 ? (
            <div className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-5 text-sm text-[var(--muted)]">
              Δεν βρέθηκαν γεμίσματα με τα τρέχοντα φίλτρα.
            </div>
          ) : (
            filteredEntries.map((entry, index) => {
            const previousEntry = previousById.get(entry.id);
            const consumption = calculateConsumption(entry, previousEntry);
            const distance = previousEntry ? entry.odometer - previousEntry.odometer : null;
            const month = entry.date.slice(0, 7);
            const startsMonth = index === 0 || filteredEntries[index - 1].date.slice(0, 7) !== month;

            return (
              <Fragment key={entry.id}>
              {startsMonth ? (
                <div className="flex items-center gap-3 px-1 pt-3">
                  <span className="h-px flex-1 bg-[var(--line)]" />
                  <h2 className="text-center text-sm font-semibold capitalize text-[var(--foreground)]">
                    {new Intl.DateTimeFormat("el-GR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`))}
                    <span className="ml-2 inline-flex rounded-full bg-[var(--background-strong)] px-2 py-0.5 text-xs font-medium tabular-nums text-[var(--muted)]">
                      {(monthlyTotals.get(month) ?? 0).toFixed(2)}€
                    </span>
                  </h2>
                  <span className="h-px flex-1 bg-[var(--line)]" />
                </div>
              ) : null}
              <article
                className="rounded-2xl border border-[var(--line)] bg-[var(--card)] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-xs text-[var(--muted)]">
                    {new Intl.DateTimeFormat("el-GR", { day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(new Date(`${entry.date}T00:00:00Z`))} · {entry.station || "Χωρίς πρατήριο"}
                  </p>
                  <EntryActions
                    editHref={`/fuel/edit?id=${encodeURIComponent(entry.id)}`}
                    entryId={entry.id}
                    endpoint="/api/fuel"
                    confirmMessage="Να διαγραφεί αυτή η καταχώρηση καυσίμου;"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xl font-semibold tracking-tight tabular-nums">{entry.total_cost.toFixed(2)}€</p>
                  <p className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold tabular-nums text-[var(--accent-strong)]">
                    {distance === null ? "— km" : `+${distance.toLocaleString("el-GR")} km`}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[var(--line)] pt-2 text-xs tabular-nums text-[var(--muted)]">
                  <span className="font-medium text-[var(--foreground)]">{entry.liters.toFixed(2)} L</span>
                  <span>{entry.price_per_liter.toFixed(3)}€/L</span>
                  <span>{consumption ?? "—"} L/100km</span>
                  {entry.receipt_url ? (
                    <a href={entry.receipt_url} target="_blank" rel="noreferrer" className="ml-auto shrink-0 font-medium text-[var(--accent-strong)]">
                      Απόδειξη
                    </a>
                  ) : null}
                </div>
              </article>
              </Fragment>
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
