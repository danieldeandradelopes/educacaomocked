'use client';

import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import { AggregateFilterChips } from '@/components/ui/AggregateFilterChips';
import { DataTable } from '@/components/ui/DataTable';
import { FocusBanner, useFocusParam } from '@/components/ui/FocusBanner';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAggregateFilter } from '@/hooks/useAggregateFilter';
import { useCrudResource } from '@/hooks/useCrudResource';
import { usePagination } from '@/hooks/usePagination';
import { useSortable } from '@/hooks/useSortable';
import { intersectoralFields } from '@/lib/crud-fields';
import { useApiList } from '@/lib/use-api';
import { useFilters } from '@/lib/filter-context';
import { describeFilters, filtersResetKey, isFilterActive, matchesSchoolId } from '@/lib/filters';
import type { School, Student } from '@/domain/types';

interface IntersectoralRow {
  id: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  sector: string;
  status: string;
  openedAt: string;
  dueAt: string;
  notes: string;
}

const FOCUS_ALLOWED = ['pending'] as const;

type IntersectoralStatus = 'ativo' | 'pendente' | 'aguardando_retorno' | 'encerrado';

function IntersectoralContent() {
  const casesReq = useApiList<IntersectoralRow>('intersectoral');
  const schoolsReq = useApiList<School>('schools');
  const studentsReq = useApiList<Student>('students');
  const { filters } = useFilters();
  const focus = useFocusParam(FOCUS_ALLOWED);
  const statusFilter = useAggregateFilter<IntersectoralStatus>();
  const schools = schoolsReq.data ?? [];
  const students = studentsReq.data ?? [];
  const base = (casesReq.data ?? []).filter((r) => matchesSchoolId(r.schoolId, filters));
  const afterFocus =
    focus === 'pending'
      ? base.filter((r) => r.status === 'pendente' || r.status === 'aguardando_retorno')
      : base;
  const rows = useMemo(
    () =>
      afterFocus.filter((r) =>
        statusFilter.matches(r.status as IntersectoralStatus),
      ),
    [afterFocus, statusFilter],
  );

  const schoolName = (id: string) => schools.find((s) => s.id === id)?.name ?? id;
  const sortAccessors = useMemo(
    () => ({
      student: (r: IntersectoralRow) => r.studentName,
      school: (r: IntersectoralRow) => schoolName(r.schoolId),
      sector: (r: IntersectoralRow) => r.sector,
      status: (r: IntersectoralRow) => r.status,
      openedAt: (r: IntersectoralRow) => r.openedAt,
      dueAt: (r: IntersectoralRow) => r.dueAt,
    }),
    [schools],
  );
  const resetKey = `${filtersResetKey(filters)}|${focus ?? ''}|${statusFilter.key}`;
  const sorted = useSortable(rows, sortAccessors, { resetKey });
  const pagination = usePagination(sorted.items, {
    resetKey: `${resetKey}|${sorted.sortKey}|${sorted.sortDir}`,
  });

  const crud = useCrudResource<IntersectoralRow>({
    collection: 'intersectoral',
    titleSingular: 'caso intersetorial',
    fields: intersectoralFields(schools, students),
    items: afterFocus,
    reload: casesReq.reload,
    createDefaults: () => ({
      status: 'ativo',
      sector: 'Educação',
      openedAt: new Date().toISOString().slice(0, 10),
      dueAt: new Date().toISOString().slice(0, 10),
      notes: '',
      studentId: students[0]?.id,
      studentName: students[0]?.name,
      schoolId: students[0]?.schoolId ?? schools[0]?.id,
    }),
  });

  const loading = casesReq.loading || schoolsReq.loading || studentsReq.loading;
  const error = casesReq.error ?? schoolsReq.error ?? studentsReq.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Acompanhamento Intersetorial"
        description={`CRUD de casos entre setores${isFilterActive(filters) ? ` · ${describeFilters(filters, schools)}` : ''}.`}
        action={crud.toolbar}
      />
      <FocusBanner allowed={FOCUS_ALLOWED} />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard index={0} label="Casos" value={base.length} accent="navy" />
            <KpiCard index={1} label="Ativos" value={base.filter((r) => r.status === 'ativo').length} accent="navy" />
            <KpiCard
              index={2}
              label="Aguardando retorno"
              value={base.filter((r) => r.status === 'aguardando_retorno').length}
              accent="amber"
            />
            <KpiCard
              index={3}
              label="Pendentes"
              value={base.filter((r) => r.status === 'pendente').length}
              accent="danger"
            />
          </section>
          <AggregateFilterChips
            label="Situação"
            clearLabel="Todos"
            options={(['ativo', 'pendente', 'aguardando_retorno', 'encerrado'] as const)
              .map((st) => ({
                value: st,
                label:
                  st === 'aguardando_retorno'
                    ? 'Aguardando retorno'
                    : st.charAt(0).toUpperCase() + st.slice(1),
                count: afterFocus.filter((r) => r.status === st).length,
              }))
              .filter(
                (opt) => opt.count > 0 || statusFilter.selected.includes(opt.value),
              )}
            selected={statusFilter.selected}
            onToggle={statusFilter.toggle}
            onClear={statusFilter.clear}
          />
          <DataTable
            caption="Intersetorial"
            columns={[
              { id: 'student', label: 'Aluno' },
              { id: 'school', label: 'Escola' },
              { id: 'sector', label: 'Setor' },
              { id: 'status', label: 'Situação' },
              { id: 'openedAt', label: 'Abertura' },
              { id: 'dueAt', label: 'Prazo' },
              { id: 'actions', label: 'Ações', sortable: false },
            ]}
            sort={sorted}
            pagination={pagination}
          >
            {pagination.pageItems.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3">
                  <Link href={`/students/${row.studentId}`} className="font-medium text-[var(--color-primary)]">
                    {row.studentName}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {schools.find((s) => s.id === row.schoolId)?.name ?? row.schoolId}
                </td>
                <td className="px-4 py-3">{row.sector}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    tone={
                      row.status === 'ativo'
                        ? 'success'
                        : row.status === 'encerrado'
                          ? 'neutral'
                          : 'warning'
                    }
                  >
                    {row.status.replaceAll('_', ' ')}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3">{row.openedAt}</td>
                <td className="px-4 py-3">{row.dueAt}</td>
                <td className="px-4 py-3">{crud.rowActions(row)}</td>
              </tr>
            ))}
          </DataTable>
        </>
      )}
      {crud.modal}
    </div>
  );
}

export function IntersectoralView() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <IntersectoralContent />
    </Suspense>
  );
}
