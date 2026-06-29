import type { ExpenseEntry } from "@/types/car";
import { parseSheetNumberOrZero } from "@/lib/sheet-parse";

export function mapRowToExpenseEntry(
  row: Record<string, string>,
): ExpenseEntry {
  const odometer = parseSheetNumberOrZero(row.odometer);

  return {
    id: row.id,
    date: row.date,
    category: row.category,
    total_cost: parseSheetNumberOrZero(row.total_cost),
    odometer: odometer || undefined,
    vendor: row.vendor,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function isExpenseEntryValid(entry: ExpenseEntry) {
  return (
    Boolean(entry.id) &&
    Boolean(entry.date) &&
    Boolean(entry.category) &&
    Number.isFinite(entry.total_cost) &&
    entry.total_cost >= 0
  );
}

export function expenseEntryToRowValues(entry: ExpenseEntry) {
  return [
    entry.id,
    entry.date,
    entry.category,
    entry.total_cost,
    entry.odometer ?? "",
    entry.vendor || "",
    entry.notes || "",
    entry.created_at,
    entry.updated_at,
  ];
}
