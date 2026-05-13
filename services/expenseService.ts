import type { CreateExpenseEntryInput, ExpenseEntry } from "@/types/car";

export async function getExpenseEntries(): Promise<ExpenseEntry[]> {
  const response = await fetch("/api/expenses", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch expense entries");
  }

  const data = await response.json();

  return data.entries;
}

export async function createExpenseEntry(input: CreateExpenseEntryInput) {
  const response = await fetch("/api/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to create expense entry");
  }

  return response.json();
}

export async function deleteExpenseEntry(entryId: string) {
  const response = await fetch(`/api/expenses?id=${encodeURIComponent(entryId)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete expense entry");
  }

  return response.json();
}
