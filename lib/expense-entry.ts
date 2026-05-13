import type { ExpenseEntry } from "@/types/car";

function parseSheetNumber(value: string) {
  const normalizedValue = String(value ?? "").trim().replace(",", ".");

  if (!normalizedValue) {
    return 0;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function mapRowToExpenseEntry(
  row: Record<string, string>
): ExpenseEntry {
  const odometer = parseSheetNumber(row.odometer);

  return {
    id: row.id,
    date: row.date,
    category: row.category,
    total_cost: parseSheetNumber(row.total_cost),
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
