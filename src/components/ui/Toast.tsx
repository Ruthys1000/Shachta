"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { clsx } from "clsx";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

type ToastTone = "success" | "danger" | "muted";

interface ToastItem {
  id: string;
  tone: ToastTone;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneClasses: Record<ToastTone, string> = {
  success: "bg-success-soft border-success/30 text-foreground",
  danger: "bg-danger-soft border-danger/30 text-foreground",
  muted: "bg-muted-soft border-border text-foreground",
};

const toneIcons: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  danger: XCircle,
  muted: Info,
};

const toneIconClasses: Record<ToastTone, string> = {
  success: "text-success",
  danger: "text-danger",
  muted: "text-muted",
};

const AUTO_DISMISS_MS: Record<ToastTone, number> = {
  success: 3500,
  danger: 6000,
  muted: 3500,
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const [mounted, setMounted] = useState(false);
  const Icon = toneIcons[toast.tone];

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={clsx(
        "pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-2xl border p-3 shadow-lg transition-all duration-200",
        toneClasses[toast.tone],
        mounted ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
      )}
    >
      <Icon className={clsx("size-5 shrink-0", toneIconClasses[toast.tone])} />
      <p className="flex-1 text-sm">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-full p-1 text-muted transition hover:bg-black/5"
        aria-label="סגור הודעה"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [container] = useState<HTMLElement | null>(() =>
    typeof document !== "undefined" ? document.body : null
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, tone, message }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS[tone]);
    },
    [dismiss]
  );

  const value: ToastContextValue = {
    success: useCallback((message: string) => push("success", message), [push]),
    error: useCallback((message: string) => push("danger", message), [push]),
    info: useCallback((message: string) => push("muted", message), [push]),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {container &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4">
            {toasts.map((toast) => (
              <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
            ))}
          </div>,
          container
        )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
