'use client';

import { SCHOOLS } from '@/data/mocks';
import { useFilters } from '@/lib/filter-context';
import { describeFilters, isFilterActive } from '@/lib/filters';
import type { Shift, Stage } from '@/domain/types';

export function FilterBar() {
  const { filters, setFilters, resetFilters } = useFilters();
  const active = isFilterActive(filters);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-3 backdrop-blur sm:p-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Ano">
          <select
            className="field"
            value={String(filters.year)}
            onChange={(e) => setFilters({ year: Number(e.target.value) })}
            aria-label="Filtrar por ano"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>
        </Field>
        <Field label="Escola">
          <select
            className="field"
            value={filters.schoolId}
            onChange={(e) => setFilters({ schoolId: e.target.value })}
            aria-label="Filtrar por escola"
          >
            <option value="all">Todas</option>
            {SCHOOLS.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Etapa">
          <select
            className="field"
            value={filters.stage}
            onChange={(e) => setFilters({ stage: e.target.value as Stage | 'all' })}
            aria-label="Filtrar por etapa"
          >
            <option value="all">Todas</option>
            <option value="creche">Creche</option>
            <option value="infantil">Ed. Infantil</option>
            <option value="fundamental">Fundamental</option>
          </select>
        </Field>
        <Field label="Turno">
          <select
            className="field"
            value={filters.shift}
            onChange={(e) => setFilters({ shift: e.target.value as Shift | 'all' })}
            aria-label="Filtrar por turno"
          >
            <option value="all">Todos</option>
            <option value="manha">Manhã</option>
            <option value="tarde">Tarde</option>
            <option value="noite">Noite</option>
            <option value="integral">Integral</option>
          </select>
        </Field>
        <button
          type="button"
          onClick={resetFilters}
          disabled={!active}
          className="rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-navy)] transition hover:bg-[var(--color-navy)]/5 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          Limpar
        </button>
      </div>
      <p className="text-xs text-[var(--color-muted)]">
        Período: {filters.periodStart} a {filters.periodEnd}
        {active ? (
          <>
            {' '}
            · <span className="font-semibold text-[var(--color-primary)]">{describeFilters(filters)}</span>
          </>
        ) : (
          <> · rede completa · dados fictícios</>
        )}
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-[9rem] flex-1 flex-col gap-1 text-xs font-medium text-[var(--color-muted)]">
      {label}
      {children}
    </label>
  );
}
