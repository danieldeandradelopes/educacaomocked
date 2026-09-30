'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { FocusBanner, useFocusParam } from '@/components/ui/FocusBanner';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/ui/PageHeader';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { useCrudResource } from '@/hooks/useCrudResource';
import { usePagination } from '@/hooks/usePagination';
import { schoolFields } from '@/lib/crud-fields';
import { useApiList } from '@/lib/use-api';
import { useFilters } from '@/lib/filter-context';
import {
  describeFilters,
  filterSchools,
  filtersResetKey,
  formatNumber,
  formatPercent,
  isFilterActive,
  schoolStages,
  stagesLabel,
} from '@/lib/filters';
import type { School, Stage } from '@/domain/types';

const FOCUS_ALLOWED = ['inclusive', 'transport'] as const;

function SchoolsContent() {
  const schoolsReq = useApiList<School>('schools');
  const allSchools = schoolsReq.data ?? [];
  const { filters } = useFilters();
  const focus = useFocusParam(FOCUS_ALLOWED);
  const schools = [...filterSchools(allSchools, filters)].sort((a, b) => {
    if (focus === 'inclusive') return b.inclusive - a.inclusive;
    if (focus === 'transport') return b.transported - a.transported;
    return b.students - a.students;
  });
  const resetKey = `${filtersResetKey(filters)}|${focus ?? ''}`;
  const pagination = usePagination(schools, { resetKey });

  const crud = useCrudResource<School>({
    collection: 'schools',
    titleSingular: 'escola',
    fields: schoolFields(),
    items: schools,
    reload: schoolsReq.reload,
    createDefaults: () => ({
      stages: ['fundamental'] as Stage[],
      students: 0,
      teachers: 0,
      staff: 0,
      attendanceRate: 95,
      activeSearch: 0,
      tutoring: 0,
      inclusive: 0,
      transported: 0,
    }),
    mapCreate: (values) => ({
      ...values,
      stages: Array.isArray(values.stages) ? values.stages : ['fundamental'],
    }),
    mapUpdate: (values) => ({
      ...values,
      stages: Array.isArray(values.stages)
        ? values.stages
        : schoolStages({ stages: values.stages as Stage[] | undefined }),
    }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Escolas"
        description={`CRUD das unidades da rede${isFilterActive(filters) ? ` · ${describeFilters(filters, allSchools)}` : ''}.`}
        action={crud.toolbar}
      />
      <FocusBanner allowed={FOCUS_ALLOWED} />
      {schoolsReq.loading && <LoadingBlock />}
      {schoolsReq.error && <ErrorBlock message={schoolsReq.error} />}
      {!schoolsReq.loading && !schoolsReq.error && (
        <>
          {schools.length === 0 && (
            <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-sm text-[var(--color-text-secondary)]">
              Nenhuma escola corresponde aos filtros atuais.
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pagination.pageItems.map((school, index) => (
              <article
                key={school.id}
                className={`kpi-enter rounded-2xl border bg-[var(--color-surface)] p-5 shadow-[0_1px_0_rgba(27,42,74,0.04)] ${
                  focus === 'inclusive' || focus === 'transport'
                    ? 'border-[var(--color-primary)]/30'
                    : 'border-[var(--color-border)]'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--color-navy)]">
                      {school.name}
                    </h2>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">{school.neighborhood}</p>
                    <p className="mt-2 text-xs font-medium text-[var(--color-primary)]">
                      {stagesLabel(schoolStages(school))}
                    </p>
                  </div>
                  {crud.rowActions(school)}
                </div>
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
          {schools.length > 0 && <PaginationBar {...pagination} />}
        </>
      )}
      {crud.modal}
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
    <Suspense fallback={<LoadingBlock />}>
      <SchoolsContent />
    </Suspense>
  );
}
