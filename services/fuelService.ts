import type { CreateFuelEntryInput, FuelEntry } from "@/types/car";

export async function getFuelEntries(): Promise<FuelEntry[]> {
  const response = await fetch("/api/fuel", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch fuel entries");
  }

  const data = await response.json();

  return data.entries;
}

export async function createFuelEntry(input: CreateFuelEntryInput) {
  const response = await fetch("/api/fuel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to create fuel entry");
  }

  return response.json();
}

export async function deleteFuelEntry(entryId: string) {
  const response = await fetch(`/api/fuel?id=${encodeURIComponent(entryId)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete fuel entry");
  }

  return response.json();
}
