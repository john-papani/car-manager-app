import {
  dataUrlToFile,
  listOfflineEntries,
  removeOfflineEntry,
  type OfflineEntryKind,
  type PendingOfflineEntry,
} from "@/lib/offline-queue";
import { isBrowserOffline, shouldQueueOfflineRequest } from "@/lib/offline-network";

type SyncResult = {
  synced: number;
  failed: number;
};

const ENDPOINTS: Record<OfflineEntryKind, string> = {
  fuel: "/api/fuel",
  service: "/api/service",
  expense: "/api/expenses",
};

async function getResponseMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function syncFuelReceipt(entryId: string, receiptDataUrl: string) {
  const file = await dataUrlToFile(receiptDataUrl, "receipt.jpg");
  const formData = new FormData();
  formData.append("file", file);

  const uploadResponse = await fetch("/api/receipts", {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    throw new Error(
      await getResponseMessage(uploadResponse, "Failed to upload queued receipt"),
    );
  }

  const receipt = (await uploadResponse.json()) as {
    file_id?: string;
    url?: string;
  };

  const patchResponse = await fetch("/api/fuel", {
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

  if (!patchResponse.ok) {
    throw new Error(
      await getResponseMessage(patchResponse, "Failed to attach queued receipt"),
    );
  }
}

async function syncOfflineEntry(entry: PendingOfflineEntry) {
  const response = await fetch(ENDPOINTS[entry.kind], {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(entry.payload),
  });

  if (!response.ok) {
    throw new Error(await getResponseMessage(response, "Failed to sync offline entry"));
  }

  if (entry.kind === "fuel" && entry.receiptDataUrl) {
    const data = (await response.json()) as { entry?: { id?: string } };
    const entryId = data.entry?.id;

    if (!entryId) {
      throw new Error("Synced fuel entry is missing an id.");
    }

    await syncFuelReceipt(entryId, entry.receiptDataUrl);
  }
}

export async function flushOfflineQueue(): Promise<SyncResult> {
  if (isBrowserOffline()) {
    return { synced: 0, failed: 0 };
  }

  const entries = await listOfflineEntries();
  let synced = 0;
  let failed = 0;

  for (const entry of entries) {
    try {
      await syncOfflineEntry(entry);
      await removeOfflineEntry(entry.id);
      synced += 1;
    } catch (error) {
      failed += 1;

      if (shouldQueueOfflineRequest(error)) {
        break;
      }

      console.error("Offline entry sync failed permanently:", entry.id, error);
    }
  }

  return { synced, failed };
}

export function isOfflineQueueSupported() {
  return typeof window !== "undefined" && "indexedDB" in window;
}
