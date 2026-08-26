"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toasts: Toast[];
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const toast = {
    success: (message: string) => addToast("success", message),
    error: (message: string) => addToast("error", message),
    warning: (message: string) => addToast("warning", message),
    info: (message: string) => addToast("info", message),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.toast;
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-white shrink-0" />,
  error: <XCircle className="w-5 h-5 text-white shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-white shrink-0" />,
  info: <Info className="w-5 h-5 text-white shrink-0" />,
};

const STYLES: Record<ToastType, string> = {
  success: "border-success bg-success text-white shadow-success/30",
  error: "border-error bg-error text-white shadow-error/30",
  warning: "border-warning bg-warning text-white shadow-warning/30",
  info: "border-info bg-info text-white shadow-info/30",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`relative overflow-hidden flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-2xl max-w-sm w-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${STYLES[toast.type]} ${
        visible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-24 scale-75"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 pointer-events-none" />
      <div className="relative z-10 flex items-start gap-3 w-full">
        {ICONS[toast.type]}
        <p className="text-sm font-bold flex-1 leading-snug pt-0.5">{toast.message}</p>
        <button
          onClick={onDismiss}
          className="text-white/70 hover:text-white transition-colors ml-1 mt-0.5 hover:rotate-90 hover:scale-110 active:scale-95 duration-200"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={() => onDismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}
