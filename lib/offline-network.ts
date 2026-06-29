export function isBrowserOffline() {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function shouldQueueOfflineRequest(error: unknown) {
  if (isBrowserOffline()) {
    return true;
  }

  if (error instanceof TypeError) {
    return true;
  }

  return error instanceof Error && /failed to fetch|network|load failed/i.test(error.message);
}

export async function requestBackgroundSync() {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("SyncManager" in window)
  ) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const syncCapableRegistration = registration as ServiceWorkerRegistration & {
      sync?: { register: (tag: string) => Promise<void> };
    };

    await syncCapableRegistration.sync?.register("sync-offline-entries");
  } catch (error) {
    console.warn("Background sync registration failed:", error);
  }
}
