import type { ServiceEntry } from "@/types/car";

function parseSheetNumber(value: string) {
  const normalizedValue = String(value ?? "").trim().replace(",", ".");

  if (!normalizedValue) {
    return 0;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function mapRowToServiceEntry(
  row: Record<string, string>
): ServiceEntry {
  const nextServiceOdometer = parseSheetNumber(row.next_service_odometer);

  return {
    id: row.id,
    date: row.date,
    odometer: parseSheetNumber(row.odometer),
    total_cost: parseSheetNumber(row.total_cost),
    service_type: row.service_type,
    location: row.location,
    next_service_odometer: nextServiceOdometer || undefined,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function isServiceEntryValid(entry: ServiceEntry) {
  return (
    Boolean(entry.id) &&
    Boolean(entry.date) &&
    Boolean(entry.service_type) &&
    Number.isFinite(entry.odometer) &&
    entry.odometer > 0 &&
    Number.isFinite(entry.total_cost) &&
    entry.total_cost >= 0
  );
}
