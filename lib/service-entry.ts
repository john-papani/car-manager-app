import type { ServiceEntry } from "@/types/car";
import { parseSheetNumberOrZero } from "@/lib/sheet-parse";

export function mapRowToServiceEntry(
  row: Record<string, string>,
): ServiceEntry {
  const nextServiceOdometer = parseSheetNumberOrZero(row.next_service_odometer);

  return {
    id: row.id,
    date: row.date,
    odometer: parseSheetNumberOrZero(row.odometer),
    total_cost: parseSheetNumberOrZero(row.total_cost),
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

export function serviceEntryToRowValues(entry: ServiceEntry) {
  return [
    entry.id,
    entry.date,
    entry.odometer,
    entry.total_cost,
    entry.service_type,
    entry.location || "",
    entry.next_service_odometer ?? "",
    entry.notes || "",
    entry.created_at,
    entry.updated_at,
  ];
}
