"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { messages } from "@/messages/en";

type ToastMessage = {
  id: number;
  text: string;
};

type ToastContextValue = {
  showToast: (text: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = useCallback((text: string) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, text }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-region" aria-label={messages.common.notifications} aria-live="polite">
        {toasts.map((toast) => (
          <p className="toast-message" key={toast.id} role="status">{toast.text}</p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
