import type { CreateServiceEntryInput, ServiceEntry } from "@/types/car";

export async function getServiceEntries(): Promise<ServiceEntry[]> {
  const response = await fetch("/api/service", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch service entries");
  }

  const data = await response.json();

  return data.entries;
}

export async function createServiceEntry(input: CreateServiceEntryInput) {
  const response = await fetch("/api/service", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to create service entry");
  }

  return response.json();
}
