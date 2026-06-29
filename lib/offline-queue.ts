export type OfflineEntryKind = "fuel" | "service" | "expense";

export type PendingOfflineEntry = {
  id: string;
  kind: OfflineEntryKind;
  payload: Record<string, unknown>;
  receiptDataUrl?: string;
  createdAt: string;
};

const DB_NAME = "car-manager-offline";
const DB_VERSION = 1;
const STORE_NAME = "pending-entries";

function isBrowser() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
  });
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest,
): Promise<T> {
  return openDatabase().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = callback(store);

        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () =>
          reject(request.error ?? new Error("IndexedDB request failed"));
        transaction.oncomplete = () => database.close();
        transaction.onerror = () =>
          reject(transaction.error ?? new Error("IndexedDB transaction failed"));
      }),
  );
}

export function notifyOfflineQueueChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent("offline-queue-changed"));
}

export async function enqueueOfflineEntry(
  entry: PendingOfflineEntry,
): Promise<void> {
  if (!isBrowser()) {
    throw new Error("Offline queue is only available in the browser.");
  }

  await runTransaction("readwrite", (store) => store.put(entry));
  notifyOfflineQueueChanged();
}

export async function listOfflineEntries(): Promise<PendingOfflineEntry[]> {
  if (!isBrowser()) {
    return [];
  }

  const entries = await runTransaction<PendingOfflineEntry[]>("readonly", (store) =>
    store.getAll(),
  );

  return entries.sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

export async function removeOfflineEntry(id: string): Promise<void> {
  if (!isBrowser()) {
    return;
  }

  await runTransaction("readwrite", (store) => store.delete(id));
  notifyOfflineQueueChanged();
}

export async function getOfflineEntryCount(): Promise<number> {
  const entries = await listOfflineEntries();
  return entries.length;
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function dataUrlToFile(dataUrl: string, filename: string) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}
