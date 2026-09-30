'use client';

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

  return (
    <div className="surface-card flex flex-col gap-3 p-3 sm:p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[7rem] flex-col gap-1 text-xs font-medium text-[var(--color-muted)]">
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
          className="min-w-[14rem]"
        />

        <AggregateSelect
          label="Etapa"
          clearLabel="Todas"
          selected={filters.stages}
          onToggle={toggleStage}
          onClear={() => setFilters({ stages: [] })}
          options={STAGE_OPTIONS}
        />

        <AggregateSelect
          label="Turno"
          clearLabel="Todos"
          selected={filters.shifts}
          onToggle={toggleShift}
          onClear={() => setFilters({ shifts: [] })}
          options={SHIFT_OPTIONS}
        />

        <button
          type="button"
          onClick={resetFilters}
          disabled={!active}
          className="min-h-10 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-navy)] transition hover:bg-[var(--color-navy)]/5 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          Limpar
        </button>
      </div>

      <p className="text-xs text-[var(--color-muted)]">
        Período: {filters.periodStart} a {filters.periodEnd}
        {active ? (
          <>
            {' '}
            ·{' '}
            <span className="font-semibold text-[var(--color-primary)]">
              {describeFilters(filters, schools)}
            </span>
            {' '}
            · filtros aplicados
          </>
        ) : (
          <> · rede completa · Ambiente de demonstração</>
        )}
      </p>
    </div>
  );
}
