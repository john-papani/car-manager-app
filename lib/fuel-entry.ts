import type { FuelEntry } from "@/types/car";
import { parseSheetNumberOrZero } from "@/lib/sheet-parse";

export function mapRowToFuelEntry(row: Record<string, string>): FuelEntry {
  return {
    id: row.id,
    date: row.date,
    odometer: parseSheetNumberOrZero(row.odometer),
    liters: parseSheetNumberOrZero(row.liters),
    total_cost: parseSheetNumberOrZero(row.total_cost),
    price_per_liter: parseSheetNumberOrZero(row.price_per_liter),
    station: row.station,
    is_full_tank: row.is_full_tank === "TRUE" || row.is_full_tank === "true",
    notes: row.notes,
    receipt_file_id: row.receipt_file_id,
    receipt_url: row.receipt_url,
    calendar_event_id: row.calendar_event_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function isFuelEntryValid(entry: FuelEntry) {
  return (
    Boolean(entry.id) &&
    Boolean(entry.date) &&
    Number.isFinite(entry.odometer) &&
    entry.odometer > 0 &&
    Number.isFinite(entry.liters) &&
    entry.liters > 0 &&
    Number.isFinite(entry.total_cost) &&
    entry.total_cost >= 0 &&
    Number.isFinite(entry.price_per_liter) &&
    entry.price_per_liter >= 0
  );
}

export function fuelEntryToRowValues(entry: FuelEntry) {
  return [
    entry.id,
    entry.date,
    entry.odometer,
    entry.liters,
    entry.total_cost,
    entry.price_per_liter,
    entry.station || "",
    entry.is_full_tank ? "TRUE" : "FALSE",
    entry.notes || "",
    entry.receipt_file_id || "",
    entry.receipt_url || "",
    entry.calendar_event_id || "",
    entry.created_at,
    entry.updated_at,
  ];
}

export function fuelEntryFromExistingRow(
  existing: Record<string, string>,
  updates: Partial<FuelEntry>,
): FuelEntry {
  const merged = { ...mapRowToFuelEntry(existing), ...updates };

  return {
    ...merged,
    price_per_liter: Number(
      (merged.total_cost / merged.liters).toFixed(3),
    ),
  };
}
