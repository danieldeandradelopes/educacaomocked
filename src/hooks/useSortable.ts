'use client';

import { useEffect, useMemo, useState } from 'react';

export type SortDir = 'asc' | 'desc';

export type SortAccessor<T> = (item: T) => string | number | boolean | null | undefined;

export interface SortState {
  sortKey: string | null;
  sortDir: SortDir;
  onSort: (key: string) => void;
}

function compareValues(a: ReturnType<SortAccessor<unknown>>, b: ReturnType<SortAccessor<unknown>>, dir: SortDir) {
  const mul = dir === 'asc' ? 1 : -1;
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return (a - b) * mul;
  if (typeof a === 'boolean' && typeof b === 'boolean') return (Number(a) - Number(b)) * mul;
  return String(a).localeCompare(String(b), 'pt-BR', { sensitivity: 'base', numeric: true }) * mul;
}

export function useSortable<T>(
  items: readonly T[],
  accessors: Record<string, SortAccessor<T>>,
  options?: { defaultKey?: string; defaultDir?: SortDir; resetKey?: string | number },
): SortState & { items: T[] } {
  const [sortKey, setSortKey] = useState<string | null>(options?.defaultKey ?? null);
  const [sortDir, setSortDir] = useState<SortDir>(options?.defaultDir ?? 'asc');

  useEffect(() => {
    if (options?.defaultKey) {
      setSortKey(options.defaultKey);
      setSortDir(options.defaultDir ?? 'asc');
    }
  }, [options?.resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const sorted = useMemo(() => {
    if (!sortKey || !accessors[sortKey]) return [...items];
    const getValue = accessors[sortKey];
    return [...items].sort((left, right) => compareValues(getValue(left), getValue(right), sortDir));
  }, [items, sortKey, sortDir, accessors]);

  function onSort(key: string) {
    if (!accessors[key]) return;
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDir('asc');
  }

  return {
    items: sorted,
    sortKey,
    sortDir,
    onSort,
  };
}
