import type { FuelEntry } from "@/types/car";

function parseSheetNumber(value: string) {
  const normalizedValue = String(value ?? "").trim().replace(",", ".");

  if (!normalizedValue) {
    return 0;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function mapRowToFuelEntry(row: Record<string, string>): FuelEntry {
  return {
    id: row.id,
    date: row.date,
    odometer: parseSheetNumber(row.odometer),
    liters: parseSheetNumber(row.liters),
    total_cost: parseSheetNumber(row.total_cost),
    price_per_liter: parseSheetNumber(row.price_per_liter),
    station: row.station,
    is_full_tank: row.is_full_tank === "TRUE" || row.is_full_tank === "true",
    notes: row.notes,
    receipt_file_id: row.receipt_file_id,
    receipt_url: row.receipt_url,
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
