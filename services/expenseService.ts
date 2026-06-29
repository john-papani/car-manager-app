import type { CreateExpenseEntryInput, ExpenseEntry, UpdateExpenseEntryInput } from "@/types/car";
import { createWithOfflineQueue } from "@/lib/offline-create";

async function getResponseMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

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
  const result = await createWithOfflineQueue<ExpenseEntry>({
    kind: "expense",
    endpoint: "/api/expenses",
    payload: input,
    fallbackMessage: "Failed to create expense entry",
  });

  return { entry: result.entry, queued: result.queued };
}

export async function updateExpenseEntry(input: UpdateExpenseEntryInput) {
  const response = await fetch("/api/expenses", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await getResponseMessage(response, "Failed to update expense entry"),
    );
  }

  return response.json();
}

export async function deleteExpenseEntry(entryId: string) {
  const response = await fetch(`/api/expenses?id=${encodeURIComponent(entryId)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getResponseMessage(response, "Failed to delete expense entry"),
    );
  }

  return response.json();
}
