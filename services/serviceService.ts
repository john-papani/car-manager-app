import type { CreateServiceEntryInput, ServiceEntry, UpdateServiceEntryInput } from "@/types/car";

async function getResponseMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

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
    throw new Error(
      await getResponseMessage(response, "Failed to create service entry"),
    );
  }

  return response.json();
}

export async function updateServiceEntry(input: UpdateServiceEntryInput) {
  const response = await fetch("/api/service", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(
      await getResponseMessage(response, "Failed to update service entry"),
    );
  }

  return response.json();
}

export async function deleteServiceEntry(entryId: string) {
  const response = await fetch(`/api/service?id=${encodeURIComponent(entryId)}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(
      await getResponseMessage(response, "Failed to delete service entry"),
    );
  }

  return response.json();
}
