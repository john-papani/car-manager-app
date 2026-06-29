"use client";

import { useMemo, useState } from "react";
import {
  emptyEntryFilters,
  type EntryFilterState,
  uniqueSortedValues,
} from "@/lib/entry-filters";
import { formInputClass } from "@/components/FormShell";

type EntryListFiltersProps = {
  totalCount: number;
  filteredCount: number;
  categories?: Array<string | undefined>;
  stations?: Array<string | undefined>;
  showOdometer?: boolean;
  onChange: (filters: EntryFilterState) => void;
};

export default function EntryListFilters({
  totalCount,
  filteredCount,
  categories = [],
  stations = [],
  showOdometer = true,
  onChange,
}: EntryListFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [filters, setFilters] = useState<EntryFilterState>(emptyEntryFilters);

  const categoryOptions = useMemo(
    () => uniqueSortedValues(categories),
    [categories],
  );
  const stationOptions = useMemo(
    () => uniqueSortedValues(stations),
    [stations],
  );

  function updateFilters(next: EntryFilterState) {
    setFilters(next);
    onChange(next);
  }

  function updateField<K extends keyof EntryFilterState>(
    key: K,
    value: EntryFilterState[K],
  ) {
    updateFilters({ ...filters, [key]: value });
  }

  function clearFilters() {
    updateFilters(emptyEntryFilters);
  }

  const hasActiveFilters =
    Boolean(filters.query) ||
    Boolean(filters.dateRange.from) ||
    Boolean(filters.dateRange.to) ||
    filters.odometerRange.min !== undefined ||
    filters.odometerRange.max !== undefined ||
    Boolean(filters.category) ||
    Boolean(filters.station);

  return (
    <section className="mt-5 rounded-[1.9rem] border border-[var(--line)] bg-[var(--card)] p-4 shadow-[0_18px_40px_rgb(18_49_59_/_0.06)]">
      <div className="flex items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <input
            type="search"
            value={filters.query}
            onChange={(event) => updateField("query", event.target.value)}
            placeholder="Αναζήτηση..."
            className={`${formInputClass} py-3 pl-10 text-sm`}
            aria-label="Αναζήτηση καταχωρήσεων"
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" />
          </svg>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="inline-flex shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-white px-3 py-2.5 text-xs font-semibold text-[var(--foreground)]"
          aria-expanded={expanded}
        >
          Φίλτρα
        </button>
      </div>

      <p className="mt-2 text-xs text-[var(--muted)]">
        {filteredCount === totalCount
          ? `${totalCount} καταχωρήσεις`
          : `${filteredCount} από ${totalCount} καταχωρήσεις`}
      </p>

      {expanded ? (
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--line)] pt-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--muted)]">
              Από ημερομηνία
            </label>
            <input
              type="date"
              value={filters.dateRange.from ?? ""}
              onChange={(event) =>
                updateField("dateRange", {
                  ...filters.dateRange,
                  from: event.target.value || undefined,
                })
              }
              className={`${formInputClass} py-2.5 text-sm`}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--muted)]">
              Έως ημερομηνία
            </label>
            <input
              type="date"
              value={filters.dateRange.to ?? ""}
              onChange={(event) =>
                updateField("dateRange", {
                  ...filters.dateRange,
                  to: event.target.value || undefined,
                })
              }
              className={`${formInputClass} py-2.5 text-sm`}
            />
          </div>

          {showOdometer ? (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--muted)]">
                  Min km
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={filters.odometerRange.min ?? ""}
                  onChange={(event) =>
                    updateField("odometerRange", {
                      ...filters.odometerRange,
                      min: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                  className={`${formInputClass} py-2.5 text-sm`}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--muted)]">
                  Max km
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={filters.odometerRange.max ?? ""}
                  onChange={(event) =>
                    updateField("odometerRange", {
                      ...filters.odometerRange,
                      max: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                  className={`${formInputClass} py-2.5 text-sm`}
                />
              </div>
            </>
          ) : null}

          {categoryOptions.length > 0 ? (
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-[var(--muted)]">
                Κατηγορία
              </label>
              <select
                value={filters.category ?? ""}
                onChange={(event) =>
                  updateField("category", event.target.value || undefined)
                }
                className={`${formInputClass} py-2.5 text-sm`}
              >
                <option value="">Όλες</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {stationOptions.length > 0 ? (
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-medium text-[var(--muted)]">
                Πρατήριο
              </label>
              <select
                value={filters.station ?? ""}
                onChange={(event) =>
                  updateField("station", event.target.value || undefined)
                }
                className={`${formInputClass} py-2.5 text-sm`}
              >
                <option value="">Όλα</option>
                {stationOptions.map((station) => (
                  <option key={station} value={station}>
                    {station}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {hasActiveFilters ? (
            <div className="col-span-2">
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-[var(--accent-strong)]"
              >
                Καθαρισμός φίλτρων
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
