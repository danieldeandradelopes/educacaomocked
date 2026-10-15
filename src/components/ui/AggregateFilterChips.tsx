'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';

interface AggregateOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface AggregateSelectProps<T extends string> {
  label: string;
  options: readonly AggregateOption<T>[];
  selected: readonly T[];
  onToggle: (value: T) => void;
  onClear?: () => void;
  clearLabel?: string;
  showClear?: boolean;
  className?: string;
}

/**
 * Select multi (aglutinador): vários valores no mesmo eixo (OR).
 * Seleção vazia = sem restrição.
 */
export function AggregateSelect<T extends string>({
  label,
  options,
  selected,
  onToggle,
  onClear,
  clearLabel = 'Todas',
  className,
}: AggregateSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listId = useId();
  const noneSelected = selected.length === 0;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const summary = (() => {
    if (noneSelected) return clearLabel;
    if (selected.length === 1) {
      const only = options.find((o) => o.value === selected[0]);
      return only?.label ?? '1 selecionado';
    }
    return `${selected.length} selecionados`;
  })();

  return (
    <div
      className={`relative flex w-full min-w-0 flex-col gap-1 ${className ?? ''}`}
      ref={rootRef}
    >
      <span className="text-xs font-medium text-[var(--color-muted)]">{label}</span>
      <button
        type="button"
        className="field flex items-center justify-between gap-2 text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={`truncate ${noneSelected ? 'text-[var(--color-muted)]' : ''}`}>
          {summary}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--color-muted)] transition ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          aria-label={label}
          className="absolute left-0 top-full z-[60] mt-1 max-h-64 w-full min-w-[12rem] overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg"
        >
          {onClear && (
            <button
              type="button"
              role="option"
              aria-selected={noneSelected}
              className={optionClass(noneSelected)}
              onClick={() => onClear()}
            >
              <span className={checkBoxClass(noneSelected)}>
                {noneSelected && <Check className="h-3.5 w-3.5" aria-hidden />}
              </span>
              <span className="flex-1 text-left">{clearLabel}</span>
            </button>
          )}
          {options.map((option) => {
            const active = selected.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                className={optionClass(active)}
                onClick={() => onToggle(option.value)}
              >
                <span className={checkBoxClass(active)}>
                  {active && <Check className="h-3.5 w-3.5" aria-hidden />}
                </span>
                <span className="min-w-0 flex-1 truncate text-left">{option.label}</span>
                {typeof option.count === 'number' && (
                  <span className="tabular-nums text-[var(--color-muted)]">{option.count}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Alias mantido para as telas existentes. */
export const AggregateFilterChips = AggregateSelect;

function optionClass(active: boolean) {
  return [
    'flex w-full items-center gap-2 px-3 py-2 text-sm transition',
    active
      ? 'bg-[var(--color-primary)]/10 text-[var(--color-navy)]'
      : 'text-[var(--color-navy)] hover:bg-[var(--color-navy)]/5',
  ].join(' ');
}

function checkBoxClass(active: boolean) {
  return [
    'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
    active
      ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
      : 'border-[var(--color-border)] bg-white text-transparent',
  ].join(' ');
}
