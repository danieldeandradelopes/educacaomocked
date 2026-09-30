'use client';

import { useCallback, useMemo, useState } from 'react';
import { toggleInList } from '@/lib/filters';

/** Multi-select: empty selection means “all” (no restriction). */
export function useAggregateFilter<T extends string>(initial: readonly T[] = []) {
  const [selected, setSelected] = useState<readonly T[]>(initial);

  const toggle = useCallback((value: T) => {
    setSelected((prev) => toggleInList(prev, value));
  }, []);

  const clear = useCallback(() => setSelected([]), []);

  const isActive = selected.length > 0;

  const matches = useCallback(
    (value: T) => selected.length === 0 || selected.includes(value),
    [selected],
  );

  const key = useMemo(() => selected.slice().sort().join(','), [selected]);

  return { selected, setSelected, toggle, clear, isActive, matches, key };
}
