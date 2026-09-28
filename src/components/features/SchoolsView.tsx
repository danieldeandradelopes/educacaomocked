'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { SCHOOLS } from '@/data/mocks';
import { FocusBanner, useFocusParam } from '@/components/ui/FocusBanner';
import { useFilters } from '@/lib/filter-context';
import {
  describeFilters,
  filterSchools,
  formatNumber,
  formatPercent,
  isFilterActive,
} from '@/lib/filters';

const FOCUS_ALLOWED = ['inclusive', 'transport'] as const;

function SchoolsContent() {
  const { filters } = useFilters();
  const focus = useFocusParam(FOCUS_ALLOWED);
  const schools = [...filterSchools(SCHOOLS, filters)].sort((a, b) => {
    if (focus === 'inclusive') return b.inclusive - a.inclusive;
    if (focus === 'transport') return b.transported - a.transported;
    return b.students - a.students;
  });

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-navy)] sm:text-3xl">
          Escolas
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Visão consolidada por unidade escolar da rede municipal.
          {isFilterActive(filters) ? ` · ${describeFilters(filters)}` : ''}
        </p>
      </section>

      <FocusBanner allowed={FOCUS_ALLOWED} />

      {schools.length === 0 && (
        <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-secondary)]">
          Nenhuma escola corresponde aos filtros atuais. Ajuste escola ou etapa.
        </p>
      )}

      {focus === 'inclusive' && (
        <p className="text-sm text-[var(--color-text-secondary)]">
          Ordenado por alunos em educação inclusiva. Há <strong>12</strong> casos aguardando
          definição de acompanhamento na rede (indicador do Dashboard).
        </p>
      )}
      {focus === 'transport' && (
        <p className="text-sm text-[var(--color-text-secondary)]">
          Ordenado por alunos transportados — detalhe operacional (rotas/custo) fica fora deste
          protótipo.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {schools.map((school, index) => (
          <article
            key={school.id}
            className={`kpi-enter rounded-2xl border bg-[var(--color-surface)] p-5 shadow-[0_1px_0_rgba(27,42,74,0.04)] transition hover:-translate-y-0.5 hover:shadow-md ${
              focus === 'inclusive' || focus === 'transport'
                ? 'border-[var(--color-primary)]/30'
                : 'border-[var(--color-border)]'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <h2 className="font-display text-lg font-semibold text-[var(--color-navy)]">
              {school.name}
            </h2>
            <p className="mt-1 text-xs text-[var(--color-muted)]">{school.neighborhood}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Metric label="Alunos" value={formatNumber(school.students)} emphasize={!focus} />
              <Metric label="Professores" value={formatNumber(school.teachers)} />
              <Metric label="Funcionários" value={formatNumber(school.staff)} />
              <Metric label="Frequência" value={formatPercent(school.attendanceRate)} />
              <Metric label="Busca ativa" value={formatNumber(school.activeSearch)} />
              <Metric label="Reforço" value={formatNumber(school.tutoring)} />
              <Metric
                label="Inclusão"
                value={formatNumber(school.inclusive)}
                emphasize={focus === 'inclusive'}
              />
              <Metric
                label="Transporte"
                value={formatNumber(school.transported)}
                emphasize={focus === 'transport'}
              />
            </dl>
            {school.activeSearch > 0 && (
              <Link
                href="/active-search?focus=attendance"
                className="mt-4 inline-flex text-xs font-semibold text-[var(--color-primary)]"
              >
                Ver busca ativa →
              </Link>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className={emphasize ? 'rounded-lg bg-[var(--color-primary)]/8 px-2 py-1' : undefined}>
      <dt className="text-xs text-[var(--color-muted)]">{label}</dt>
      <dd
        className={`mt-0.5 font-semibold ${
          emphasize ? 'text-[var(--color-primary)]' : 'text-[var(--color-navy)]'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export function SchoolsView() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">Carregando…</p>}>
      <SchoolsContent />
    </Suspense>
  );
}
