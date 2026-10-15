'use client';

import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { AggregateSelect } from '@/components/ui/AggregateFilterChips';
import { useApiList } from '@/lib/use-api';
import { useFilters } from '@/lib/filter-context';
import { describeFilters, isFilterActive, shiftLabel, stageLabel } from '@/lib/filters';
import type { School, Shift, Stage } from '@/domain/types';

const STAGE_OPTIONS: { value: Stage; label: string }[] = [
  { value: 'creche', label: stageLabel('creche') },
  { value: 'infantil', label: stageLabel('infantil') },
  { value: 'fundamental', label: stageLabel('fundamental') },
];

const SHIFT_OPTIONS: { value: Shift; label: string }[] = [
  { value: 'manha', label: shiftLabel('manha') },
  { value: 'tarde', label: shiftLabel('tarde') },
  { value: 'noite', label: shiftLabel('noite') },
  { value: 'integral', label: shiftLabel('integral') },
];

export function FilterBar() {
  const { filters, setFilters, resetFilters, toggleSchool, toggleStage, toggleShift } = useFilters();
  const schoolsReq = useApiList<School>('schools');
  const schools = schoolsReq.data ?? [];
  const active = isFilterActive(filters);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="surface-card flex flex-col gap-3 p-3 sm:p-4">
      <div className="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-left text-sm font-medium text-[var(--color-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          <SlidersHorizontal className="h-4 w-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
          <span className="min-w-0 flex-1 truncate">
            Filtros
            {active ? (
              <span className="ml-1.5 font-normal text-[var(--color-primary)]">
                · {describeFilters(filters, schools)}
              </span>
            ) : (
              <span className="ml-1.5 font-normal text-[var(--color-muted)]">· rede completa</span>
            )}
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[var(--color-muted)] transition ${expanded ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
        {active && (
          <button
            type="button"
            onClick={resetFilters}
            className="min-h-10 shrink-0 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          >
            Limpar
          </button>
        )}
      </div>

      <div className={`${expanded ? 'grid' : 'hidden'} grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid lg:grid-cols-[7rem_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]`}>
        <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-[var(--color-muted)] sm:col-span-2 lg:col-span-1">
          Ano
          <select
            className="field"
            value={String(filters.year)}
            onChange={(e) => setFilters({ year: Number(e.target.value) })}
            aria-label="Filtrar por ano"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </label>

        <AggregateSelect
          label="Escola"
          clearLabel="Todas"
          selected={filters.schoolIds}
          onToggle={toggleSchool}
          onClear={() => setFilters({ schoolIds: [] })}
          options={schools.map((school) => ({ value: school.id, label: school.name }))}
          className="min-w-0 sm:col-span-2 lg:col-span-1"
        />

        <AggregateSelect
          label="Etapa"
          clearLabel="Todas"
          selected={filters.stages}
          onToggle={toggleStage}
          onClear={() => setFilters({ stages: [] })}
          options={STAGE_OPTIONS}
          className="min-w-0"
        />

        <AggregateSelect
          label="Turno"
          clearLabel="Todos"
          selected={filters.shifts}
          onToggle={toggleShift}
          onClear={() => setFilters({ shifts: [] })}
          options={SHIFT_OPTIONS}
          className="min-w-0"
        />

        <button
          type="button"
          onClick={resetFilters}
          disabled={!active}
          className="min-h-10 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-navy)] transition hover:bg-[var(--color-navy)]/5 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] sm:col-span-2 lg:col-span-1 lg:w-auto"
        >
          Limpar
        </button>
      </div>

      <p className={`${expanded ? 'block' : 'hidden'} text-xs leading-relaxed text-[var(--color-muted)] lg:block`}>
        <span className="block sm:inline">
          Período: {filters.periodStart} a {filters.periodEnd}
        </span>
        {active ? (
          <>
            <span className="hidden sm:inline"> · </span>
            <span className="mt-1 block sm:mt-0 sm:inline">
              <span className="font-semibold text-[var(--color-primary)]">
                {describeFilters(filters, schools)}
              </span>
              {' '}
              · filtros aplicados
            </span>
          </>
        ) : (
          <>
            <span className="hidden sm:inline"> · </span>
            <span className="mt-1 block sm:mt-0 sm:inline">
              rede completa · Ambiente de demonstração
            </span>
          </>
        )}
      </p>
    </div>
  );
}
