'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
}

interface ConfirmApi {
  ask: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmApi | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [mounted, setMounted] = useState(false);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish(false);
    };
    window.addEventListener('keydown', onKey);
    queueMicrotask(() => confirmBtnRef.current?.focus());
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const finish = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOpen(false);
    setOptions(null);
  }, []);

  const ask = useCallback((next: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current?.(false);
      resolverRef.current = resolve;
      setOptions(next);
      setOpen(true);
    });
  }, []);

  const api = useMemo(() => ({ ask }), [ask]);
  const tone = options?.tone ?? 'danger';

  const dialog =
    mounted && open && options
      ? createPortal(
          <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center">
            <button
              type="button"
              className="absolute inset-0 bg-[var(--color-navy)]/45 backdrop-blur-[2px]"
              aria-label="Cancelar"
              onClick={() => finish(false)}
            />
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={options.description ? descId : undefined}
              className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-2xl"
            >
              <div className="flex gap-3">
                <div
                  className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    tone === 'danger'
                      ? 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                      : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2
                    id={titleId}
                    className="text-lg font-semibold text-[var(--color-navy)]"
                  >
                    {options.title}
                  </h2>
                  {options.description && (
                    <p id={descId} className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      {options.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => finish(false)}
                  className="min-h-10 rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium text-[var(--color-navy)] transition hover:bg-[var(--color-navy)]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
                >
                  {options.cancelLabel ?? 'Cancelar'}
                </button>
                <button
                  ref={confirmBtnRef}
                  type="button"
                  onClick={() => finish(true)}
                  className={`min-h-10 rounded-[var(--radius-control)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
                    tone === 'danger' ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-primary)]'
                  }`}
                >
                  {options.confirmLabel ?? 'Confirmar'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <ConfirmContext.Provider value={api}>
      {children}
      {dialog}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmApi {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error('useConfirm deve ser usado dentro de ConfirmProvider');
  }
  return ctx;
}
