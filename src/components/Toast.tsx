import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              t.type === 'error'
                ? 'bg-rose-950 border-rose-800 text-rose-100'
                : t.type === 'success'
                  ? 'bg-emerald-950 border-emerald-800 text-emerald-100'
                  : 'bg-slate-900 border-slate-700 text-white'
            }`}
          >
            {t.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden />
            )}
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="opacity-70 hover:opacity-100 shrink-0"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
