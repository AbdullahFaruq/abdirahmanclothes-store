"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { AlertIcon, CheckIcon, CloseIcon } from "@/components/icons";

type ToastTone = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 3600);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Polite live region: feedback reaches screen readers without stealing focus. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:bottom-8 sm:left-auto sm:right-8 sm:translate-x-0"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`animate-rise pointer-events-auto flex items-center gap-3 border px-4 py-3 shadow-[0_18px_40px_-24px_rgba(11,11,12,0.55)] ${
              item.tone === "error"
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-line bg-ink text-bone"
            }`}
          >
            <span className="shrink-0 text-base">
              {item.tone === "error" ? <AlertIcon /> : <CheckIcon />}
            </span>
            <p className="flex-1 text-sm leading-snug">{item.message}</p>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss notification"
              className={`shrink-0 text-base transition-opacity hover:opacity-60 ${
                item.tone === "error" ? "text-red-900" : "text-bone"
              }`}
            >
              <CloseIcon />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
