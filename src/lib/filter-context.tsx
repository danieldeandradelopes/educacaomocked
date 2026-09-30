'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { GlobalFilters, Shift, Stage } from '@/domain/types';
import { DEFAULT_FILTERS, toggleInList } from '@/lib/filters';

interface FilterContextValue {
  filters: GlobalFilters;
  setFilters: (next: Partial<GlobalFilters>) => void;
  resetFilters: () => void;
  toggleSchool: (schoolId: string) => void;
  toggleStage: (stage: Stage) => void;
  toggleShift: (shift: Shift) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<GlobalFilters>(DEFAULT_FILTERS);

  const setFilters = useCallback((next: Partial<GlobalFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...next }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const toggleSchool = useCallback((schoolId: string) => {
    setFiltersState((prev) => ({
      ...prev,
      schoolIds: toggleInList(prev.schoolIds, schoolId),
    }));
  }, []);

  const toggleStage = useCallback((stage: Stage) => {
    setFiltersState((prev) => ({
      ...prev,
      stages: toggleInList(prev.stages, stage),
    }));
  }, []);

  const toggleShift = useCallback((shift: Shift) => {
    setFiltersState((prev) => ({
      ...prev,
      shifts: toggleInList(prev.shifts, shift),
    }));
  }, []);

  const value = useMemo(
    () => ({
      filters,
      setFilters,
      resetFilters,
      toggleSchool,
      toggleStage,
      toggleShift,
    }),
    [filters, setFilters, resetFilters, toggleSchool, toggleStage, toggleShift],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return ctx;
}
