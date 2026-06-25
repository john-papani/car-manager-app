"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

type ToastTone = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within AppProviders");
  }

  return context;
}

function toastToneClasses(tone: ToastTone) {
  switch (tone) {
    case "success":
      return "border-emerald-200/80 bg-emerald-50 text-emerald-950";
    case "error":
      return "border-red-200/80 bg-red-50 text-red-950";
    default:
      return "border-sky-200/80 bg-sky-50 text-sky-950";
  }
}

function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);

    const timeout = window.setTimeout(() => {
      setVisible(false);
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  if (!visible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-transparent"
    >
      <div className="h-full w-full origin-left animate-[navProgress_0.7s_ease-out_forwards] bg-[var(--accent)]" />
    </div>
  );
}

function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-4 z-[90] flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto w-full max-w-md rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_16px_40px_rgb(18_49_59_/_0.12)] backdrop-blur-md ${toastToneClasses(toast.tone)}`}
        >
          <div className="flex items-start justify-between gap-3">
            <p>{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 rounded-full px-2 py-0.5 text-xs opacity-70 transition hover:opacity-100"
              aria-label="Κλείσιμο"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);

    setToasts((current) => [...current, { id, message, tone }]);

    window.setTimeout(() => {
      dismissToast(id);
    }, 4200);
  }, [dismissToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      <NavigationProgress />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      {children}
    </ToastContext.Provider>
  );
}
