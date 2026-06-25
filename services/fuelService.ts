import type { CreateFuelEntryInput, FuelEntry } from "@/types/car";

async function getResponseMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

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
    throw new Error(
      await getResponseMessage(response, "Failed to create fuel entry")
    );
  }

  return response.json() as Promise<{ entry: FuelEntry }>;
}

export async function attachFuelReceipt(
  entryId: string,
  receipt: { file_id?: string; url?: string },
) {
  const response = await fetch("/api/fuel", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: entryId,
      receipt_file_id: receipt.file_id,
      receipt_url: receipt.url,
    }),
  });

  if (!response.ok) {
    throw new Error(
      await getResponseMessage(response, "Failed to attach fuel receipt"),
    );
  }

  return response.json();
}

export async function uploadFuelReceipt(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/receipts", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await getResponseMessage(response, "Failed to upload fuel receipt")
    );
  }

  return (await response.json()) as {
    file_id?: string;
    url?: string;
  };
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
