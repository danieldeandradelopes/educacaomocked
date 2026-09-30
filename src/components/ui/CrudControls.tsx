'use client';

import { useEffect, useId, useState, type FormEvent, type ReactNode } from 'react';

export interface CrudField {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'textarea' | 'date';
  required?: boolean;
  options?: readonly { value: string; label: string }[];
  placeholder?: string;
}

interface CrudModalProps {
  open: boolean;
  title: string;
  fields: readonly CrudField[];
  initialValues?: Record<string, unknown>;
  submitLabel?: string;
  busy?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => Promise<void> | void;
}

export function CrudModal({
  open,
  title,
  fields,
  initialValues,
  submitLabel = 'Salvar',
  busy,
  error,
  onClose,
  onSubmit,
}: CrudModalProps) {
  const formId = useId();
  const [values, setValues] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (!open) return;
    const next: Record<string, unknown> = {};
    for (const field of fields) {
      const current = initialValues?.[field.name];
      if (field.type === 'checkbox') {
        next[field.name] = Boolean(current);
      } else if (field.type === 'multiselect') {
        if (Array.isArray(current)) next[field.name] = current.map(String);
        else if (typeof current === 'string' && current) next[field.name] = [current];
        else next[field.name] = [];
      } else if (field.type === 'number') {
        next[field.name] = current ?? '';
      } else if (Array.isArray(current)) {
        next[field.name] = current.join(', ');
      } else {
        next[field.name] = current ?? '';
      }
    }
    setValues(next);
  }, [open, fields, initialValues]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      const raw = values[field.name];
      if (field.type === 'checkbox') {
        payload[field.name] = Boolean(raw);
      } else if (field.type === 'multiselect') {
        const selected = Array.isArray(raw) ? raw.map(String) : [];
        if (field.required && selected.length === 0) {
          return;
        }
        payload[field.name] = selected;
      } else if (field.type === 'number') {
        payload[field.name] = raw === '' || raw === undefined ? null : Number(raw);
      } else if (typeof raw === 'string' && raw.includes(',') && field.name === 'subjects') {
        payload[field.name] = raw
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean);
      } else if (raw === '') {
        payload[field.name] = null;
      } else {
        payload[field.name] = raw;
      }
    }
    await onSubmit(payload);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Fechar modal"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={formId}
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl"
      >
        <h2 id={formId} className="text-xl font-semibold text-[var(--color-navy)]">
          {title}
        </h2>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          {fields.map((field) => (
            <label key={field.name} className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-[var(--color-muted)]">{field.label}</span>
              {field.type === 'select' ? (
                <select
                  className="field"
                  required={field.required}
                  value={String(values[field.name] ?? '')}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                >
                  <option value="">Selecione…</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'multiselect' ? (
                <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2">
                  {(field.options ?? []).map((option) => {
                    const selected = Array.isArray(values[field.name])
                      ? (values[field.name] as string[])
                      : [];
                    const checked = selected.includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 text-sm text-[var(--color-navy)]"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-[var(--color-primary)]"
                          checked={checked}
                          onChange={(e) => {
                            setValues((prev) => {
                              const current = Array.isArray(prev[field.name])
                                ? [...(prev[field.name] as string[])]
                                : [];
                              const next = e.target.checked
                                ? [...current, option.value]
                                : current.filter((v) => v !== option.value);
                              return { ...prev, [field.name]: next };
                            });
                          }}
                        />
                        {option.label}
                      </label>
                    );
                  })}
                  {field.required &&
                    (!Array.isArray(values[field.name]) ||
                      (values[field.name] as string[]).length === 0) && (
                      <span className="text-xs text-[var(--color-danger)]">
                        Selecione ao menos uma etapa
                      </span>
                    )}
                </div>
              ) : field.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--color-primary)]"
                  checked={Boolean(values[field.name])}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.name]: e.target.checked }))
                  }
                />
              ) : field.type === 'textarea' ? (
                <textarea
                  className="field min-h-24"
                  required={field.required}
                  value={String(values[field.name] ?? '')}
                  placeholder={field.placeholder}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                />
              ) : (
                <input
                  className="field"
                  type={field.type ?? 'text'}
                  required={field.required}
                  value={String(values[field.name] ?? '')}
                  placeholder={field.placeholder}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                />
              )}
            </label>
          ))}
          {error && (
            <p className="rounded-lg bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-10 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="min-h-10 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            >
              {busy ? 'Salvando…' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CrudActions({
  onCreate,
  children,
}: {
  onCreate: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {children}
      <button
        type="button"
        onClick={onCreate}
        className="min-h-10 rounded-[var(--radius-control)] bg-[var(--color-primary)] px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
      >
        + Novo
      </button>
    </div>
  );
}

export function RowActions({
  onEdit,
  onDelete,
  busy,
}: {
  onEdit: () => void;
  onDelete: () => void;
  busy?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onEdit}
        disabled={busy}
        className="inline-flex min-h-6 min-w-6 items-center rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs font-semibold text-[var(--color-navy)] hover:bg-[var(--color-navy)]/5 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
      >
        Editar
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="inline-flex min-h-6 min-w-6 items-center rounded-lg border border-[var(--color-danger)]/30 px-2 py-1 text-xs font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger)]/8 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
      >
        Excluir
      </button>
    </div>
  );
}
