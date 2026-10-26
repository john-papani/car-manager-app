"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useToast } from "@/components/AppProviders";
import { getOfflineEntryCount } from "@/lib/offline-queue";
import { flushOfflineQueue } from "@/lib/offline-sync";

type OfflineContextValue = {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  syncNow: () => Promise<void>;
};

const OfflineContext = createContext<OfflineContextValue | null>(null);

export function useOffline() {
  const context = useContext(OfflineContext);

  if (!context) {
    throw new Error("useOffline must be used within OfflineProvider");
  }

  return context;
}

function subscribeToOnlineStatus(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);

  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getOnlineStatusSnapshot() {
  return navigator.onLine;
}

function getOnlineStatusServerSnapshot() {
  return true;
}

function OfflineBanner({
  isOnline,
  pendingCount,
  isSyncing,
  onSync,
}: {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onSync: () => void;
}) {
  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[85] border-b px-4 py-2 text-center text-xs font-medium backdrop-blur-md ${
        isOnline
          ? "border-amber-200/80 bg-amber-50/95 text-amber-950"
          : "border-sky-200/80 bg-sky-50/95 text-sky-950"
      }`}
      role="status"
    >
      {!isOnline ? (
        <span>Είσαι offline — οι νέες καταχωρήσεις αποθηκεύονται τοπικά.</span>
      ) : (
        <span className="inline-flex flex-wrap items-center justify-center gap-2">
          {pendingCount > 0
            ? `${pendingCount} καταχώρηση${pendingCount === 1 ? "" : "εις"} σε αναμονή συγχρονισμού.`
            : null}
          {pendingCount > 0 ? (
            <button
              type="button"
              onClick={onSync}
              disabled={isSyncing}
              className="rounded-full border border-current/20 px-2.5 py-0.5 font-semibold disabled:opacity-60"
            >
              {isSyncing ? "Συγχρονισμός..." : "Συγχρονισμός τώρα"}
            </button>
          ) : null}
        </span>
      )}
    </div>
  );
}

export default function OfflineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const isOnline = useSyncExternalStore(
    subscribeToOnlineStatus,
    getOnlineStatusSnapshot,
    getOnlineStatusServerSnapshot,
  );
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshPendingCount = useCallback(async () => {
    const count = await getOfflineEntryCount();
    setPendingCount(count);
  }, []);

  const syncNow = useCallback(async () => {
    if (!navigator.onLine) {
      return;
    }

    setIsSyncing(true);

    try {
      const result = await flushOfflineQueue();
      await refreshPendingCount();

      if (result.synced > 0) {
        showToast(
          `Συγχρονίστηκαν ${result.synced} καταχώρηση${result.synced === 1 ? "" : "εις"}.`,
          "success",
        );
        router.refresh();
      }
    } catch (error) {
      console.error("Offline sync failed:", error);
      showToast("Ο συγχρονισμός απέτυχε.", "error");
    } finally {
      setIsSyncing(false);
    }
  }, [refreshPendingCount, router, showToast]);

  const syncNowRef = useRef(syncNow);

  useEffect(() => {
    syncNowRef.current = syncNow;
  }, [syncNow]);

  useEffect(() => {
    void getOfflineEntryCount().then((count) => {
      setPendingCount(count);
    });

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.warn("Service worker registration failed:", error);
      });
    }

    const handleOnline = () => {
      void syncNowRef.current();
    };
    const handleQueueChanged = () => {
      void refreshPendingCount();
    };
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === "SYNC_OFFLINE_QUEUE") {
        void syncNowRef.current();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline-queue-changed", handleQueueChanged);
    navigator.serviceWorker?.addEventListener("message", handleServiceWorkerMessage);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline-queue-changed", handleQueueChanged);
      navigator.serviceWorker?.removeEventListener(
        "message",
        handleServiceWorkerMessage,
      );
    };
  }, [refreshPendingCount]);

  const value = useMemo(
    () => ({
      isOnline,
      pendingCount,
      isSyncing,
      syncNow,
    }),
    [isOnline, pendingCount, isSyncing, syncNow],
  );

  return (
    <OfflineContext.Provider value={value}>
      <OfflineBanner
        isOnline={isOnline}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        onSync={() => {
          void syncNow();
        }}
      />
      <div className={!isOnline || pendingCount > 0 ? "pt-9" : undefined}>
        {children}
      </div>
    </OfflineContext.Provider>
  );
}
