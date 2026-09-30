'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

interface ToastApi {
  push: (toast: Omit<ToastItem, 'id'> & { id?: string }) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const TONE_STYLES: Record<
  ToastTone,
  { icon: typeof CheckCircle2; className: string }
> = {
  success: {
    icon: CheckCircle2,
    className: 'border-[var(--color-primary)]/25 bg-[var(--color-surface)] text-[var(--color-primary)]',
  },
  error: {
    icon: XCircle,
    className: 'border-[var(--color-danger)]/30 bg-[var(--color-surface)] text-[var(--color-danger)]',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-[var(--color-warning)]/35 bg-[var(--color-surface)] text-[var(--color-warning)]',
  },
  info: {
    icon: Info,
    className: 'border-[var(--color-navy)]/20 bg-[var(--color-surface)] text-[var(--color-navy)]',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (toast: Omit<ToastItem, 'id'> & { id?: string }) => {
      const id =
        toast.id ?? `toast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      setItems((prev) => [
        ...prev,
        { id, title: toast.title, description: toast.description, tone: toast.tone },
      ]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      push,
      dismiss,
      success: (title, description) => push({ title, description, tone: 'success' }),
      error: (title, description) => push({ title, description, tone: 'error' }),
      info: (title, description) => push({ title, description, tone: 'info' }),
      warning: (title, description) => push({ title, description, tone: 'warning' }),
    }),
    [push, dismiss],
  );

  const viewport =
    mounted &&
    createPortal(
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[210] flex flex-col items-end gap-2 p-4 sm:p-6"
        aria-live="polite"
        aria-relevant="additions"
      >
        {items.map((item) => {
          const style = TONE_STYLES[item.tone];
          const Icon = style.icon;
          return (
            <div
              key={item.id}
              role="status"
              className={`toast-enter pointer-events-auto flex w-full max-w-sm gap-3 rounded-2xl border p-3 shadow-lg ${style.className}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--color-navy)]">{item.title}</p>
                {item.description && (
                  <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                    {item.description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded-lg p-1 text-[var(--color-muted)] transition hover:bg-[var(--color-navy)]/5 hover:text-[var(--color-navy)]"
                aria-label="Fechar notificação"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>,
      document.body,
    );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {viewport}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return ctx;
}
