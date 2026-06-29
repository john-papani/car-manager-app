export type DateRangeFilter = {
  from?: string;
  to?: string;
};

export type OdometerRangeFilter = {
  min?: number;
  max?: number;
};

export type EntryFilterState = {
  query: string;
  dateRange: DateRangeFilter;
  odometerRange: OdometerRangeFilter;
  category?: string;
  station?: string;
};

export const emptyEntryFilters: EntryFilterState = {
  query: "",
  dateRange: {},
  odometerRange: {},
};

function matchesQuery(values: Array<string | number | undefined>, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return values.some((value) =>
    String(value ?? "")
      .toLowerCase()
      .includes(normalizedQuery),
  );
}

function matchesDateRange(date: string, range: DateRangeFilter) {
  if (range.from && date < range.from) {
    return false;
  }

  if (range.to && date > range.to) {
    return false;
  }

  return true;
}

function matchesOdometerRange(
  odometer: number | undefined,
  range: OdometerRangeFilter,
) {
  if (odometer === undefined) {
    return !range.min && !range.max;
  }

  if (range.min !== undefined && odometer < range.min) {
    return false;
  }

  if (range.max !== undefined && odometer > range.max) {
    return false;
  }

  return true;
}

export function filterFuelEntries<
  T extends {
    date: string;
    odometer: number;
    station?: string;
    notes?: string;
    total_cost: number;
    liters: number;
  },
>(entries: T[], filters: EntryFilterState) {
  return entries.filter((entry) => {
    if (!matchesDateRange(entry.date, filters.dateRange)) {
      return false;
    }

    if (!matchesOdometerRange(entry.odometer, filters.odometerRange)) {
      return false;
    }

    if (
      filters.station &&
      !(entry.station ?? "").toLowerCase().includes(filters.station.toLowerCase())
    ) {
      return false;
    }

    return matchesQuery(
      [
        entry.date,
        entry.station,
        entry.notes,
        entry.total_cost,
        entry.liters,
        entry.odometer,
      ],
      filters.query,
    );
  });
}

export function filterServiceEntries<
  T extends {
    date: string;
    odometer: number;
    service_type: string;
    location?: string;
    notes?: string;
    total_cost: number;
  },
>(entries: T[], filters: EntryFilterState) {
  return entries.filter((entry) => {
    if (!matchesDateRange(entry.date, filters.dateRange)) {
      return false;
    }

    if (!matchesOdometerRange(entry.odometer, filters.odometerRange)) {
      return false;
    }

    return matchesQuery(
      [
        entry.date,
        entry.service_type,
        entry.location,
        entry.notes,
        entry.total_cost,
        entry.odometer,
      ],
      filters.query,
    );
  });
}

export function filterExpenseEntries<
  T extends {
    date: string;
    category: string;
    vendor?: string;
    notes?: string;
    total_cost: number;
    odometer?: number;
  },
>(entries: T[], filters: EntryFilterState) {
  return entries.filter((entry) => {
    if (!matchesDateRange(entry.date, filters.dateRange)) {
      return false;
    }

    if (!matchesOdometerRange(entry.odometer, filters.odometerRange)) {
      return false;
    }

    if (
      filters.category &&
      !entry.category.toLowerCase().includes(filters.category.toLowerCase())
    ) {
      return false;
    }

    return matchesQuery(
      [
        entry.date,
        entry.category,
        entry.vendor,
        entry.notes,
        entry.total_cost,
        entry.odometer,
      ],
      filters.query,
    );
  });
}

export function uniqueSortedValues(values: Array<string | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])].sort(
    (left, right) => left.localeCompare(right, "el"),
  );
}
