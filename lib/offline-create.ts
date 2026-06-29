import { v4 as uuidv4 } from "uuid";
import {
  enqueueOfflineEntry,
  fileToDataUrl,
  type OfflineEntryKind,
} from "@/lib/offline-queue";
import {
  isBrowserOffline,
  requestBackgroundSync,
  shouldQueueOfflineRequest,
} from "@/lib/offline-network";

type QueueCreateOptions = {
  kind: OfflineEntryKind;
  endpoint: string;
  payload: Record<string, unknown>;
  receiptFile?: File | null;
  fallbackMessage: string;
};

type QueueCreateResult<TEntry> = {
  entry: TEntry;
  queued: boolean;
};

async function getResponseMessage(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

function buildOptimisticEntry<TEntry extends Record<string, unknown>>(
  payload: Record<string, unknown>,
  localId: string,
): TEntry {
  const now = new Date().toISOString();

  return {
    id: localId,
    ...payload,
    created_at: now,
    updated_at: now,
    pending_sync: true,
  } as unknown as TEntry;
}

export async function createWithOfflineQueue<TEntry extends Record<string, unknown>>(
  options: QueueCreateOptions,
): Promise<QueueCreateResult<TEntry>> {
  const queueOffline = async () => {
    const localId = uuidv4();
    const receiptDataUrl = options.receiptFile
      ? await fileToDataUrl(options.receiptFile)
      : undefined;

    await enqueueOfflineEntry({
      id: localId,
      kind: options.kind,
      payload: options.payload,
      receiptDataUrl,
      createdAt: new Date().toISOString(),
    });
    await requestBackgroundSync();

    return {
      entry: buildOptimisticEntry<TEntry>(options.payload, localId),
      queued: true,
    };
  };

  if (isBrowserOffline()) {
    return queueOffline();
  }

  try {
    const response = await fetch(options.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options.payload),
    });

    if (!response.ok) {
      throw new Error(await getResponseMessage(response, options.fallbackMessage));
    }

    const data = (await response.json()) as { entry: TEntry };
    return { entry: data.entry, queued: false };
  } catch (error) {
    if (shouldQueueOfflineRequest(error)) {
      return queueOffline();
    }

    throw error;
  }
}

export function getOfflineSuccessMessage(queued: boolean, onlineMessage: string) {
  return queued
    ? "Αποθηκεύτηκε offline — θα συγχρονιστεί όταν επανέλθει το δίκτυο."
    : onlineMessage;
}
