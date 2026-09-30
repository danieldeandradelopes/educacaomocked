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
import { inclusiveFields } from '@/lib/crud-fields';
import { useApiList } from '@/lib/use-api';
import { useFilters } from '@/lib/filter-context';
import {
  computeFilteredKpis,
  describeFilters,
  filtersResetKey,
  isFilterActive,
  matchesSchoolId,
} from '@/lib/filters';
import type { School, Student } from '@/domain/types';

interface InclusiveRow {
  id: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  grade: string;
  hasDocumentation: boolean;
  hasTutor: boolean;
  tutorName: string | null;
  status: 'pendente' | 'definido';
}

const FOCUS_ALLOWED = ['pending'] as const;

function InclusiveContent() {
  const inclusiveReq = useApiList<InclusiveRow>('inclusive');
  const schoolsReq = useApiList<School>('schools');
  const studentsReq = useApiList<Student>('students');
  const { filters } = useFilters();
  const focus = useFocusParam(FOCUS_ALLOWED);
  const statusFilter = useAggregateFilter<InclusiveRow['status']>();
  const schools = schoolsReq.data ?? [];
  const kpis = useMemo(
    () => computeFilteredKpis(filters, { schools }),
    [filters, schools],
  );
  const students = studentsReq.data ?? [];
  const base = (inclusiveReq.data ?? []).filter((r) => matchesSchoolId(r.schoolId, filters));
  const afterFocus = focus === 'pending' ? base.filter((r) => r.status === 'pendente') : base;
  const rows = useMemo(
    () => afterFocus.filter((r) => statusFilter.matches(r.status)),
    [afterFocus, statusFilter],
  );

  const schoolName = (id: string) => schools.find((s) => s.id === id)?.name ?? id;
  const sortAccessors = useMemo(
    () => ({
      student: (r: InclusiveRow) => r.studentName,
      school: (r: InclusiveRow) => schoolName(r.schoolId),
      grade: (r: InclusiveRow) => r.grade,
      documentation: (r: InclusiveRow) => (r.hasDocumentation ? 1 : 0),
      tutor: (r: InclusiveRow) => r.tutorName ?? '',
      status: (r: InclusiveRow) => r.status,
    }),
    [schools],
  );
  const resetKey = `${filtersResetKey(filters)}|${focus ?? ''}|${statusFilter.key}`;
  const sorted = useSortable(rows, sortAccessors, { resetKey });
  const pagination = usePagination(sorted.items, {
    resetKey: `${resetKey}|${sorted.sortKey}|${sorted.sortDir}`,
  });

  const crud = useCrudResource<InclusiveRow>({
    collection: 'inclusive',
    titleSingular: 'acompanhamento inclusivo',
    fields: inclusiveFields(schools, students),
    items: afterFocus,
    reload: inclusiveReq.reload,
    createDefaults: () => ({
      status: 'pendente',
      hasDocumentation: false,
      hasTutor: false,
      tutorName: null,
      studentId: students[0]?.id,
      studentName: students[0]?.name,
      schoolId: students[0]?.schoolId ?? schools[0]?.id,
      grade: students[0]?.grade ?? '',
    }),
  });

  const loading = inclusiveReq.loading || schoolsReq.loading || studentsReq.loading;
  const error = inclusiveReq.error ?? schoolsReq.error ?? studentsReq.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Educação Inclusiva"
        description={`CRUD de acompanhamentos e tutores${isFilterActive(filters) ? ` · ${describeFilters(filters, schools)}` : ''}.`}
        action={crud.toolbar}
      />
      <FocusBanner allowed={FOCUS_ALLOWED} />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard index={0} label="Na rede (KPI)" value={kpis.inclusive} accent="navy" />
            <KpiCard index={1} label="Registros" value={base.length} accent="navy" />
            <KpiCard index={2} label="Com tutor" value={base.filter((r) => r.hasTutor).length} accent="navy" />
            <KpiCard
              index={3}
              label="Pendentes"
              value={base.filter((r) => r.status === 'pendente').length}
              accent="amber"
            />
          </section>
          <AggregateFilterChips
            label="Situação"
            clearLabel="Todos"
            options={(
              [
                { value: 'pendente' as const, label: 'Pendente' },
                { value: 'definido' as const, label: 'Definido' },
              ] as const
            ).map((option) => ({
              ...option,
              count: afterFocus.filter((r) => r.status === option.value).length,
            }))}
            selected={statusFilter.selected}
            onToggle={statusFilter.toggle}
            onClear={statusFilter.clear}
          />
          <DataTable
            caption="Inclusão"
            columns={[
              { id: 'student', label: 'Aluno' },
              { id: 'school', label: 'Escola' },
              { id: 'grade', label: 'Série' },
              { id: 'documentation', label: 'Documentação' },
              { id: 'tutor', label: 'Tutor' },
              { id: 'status', label: 'Situação' },
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
                <td className="px-4 py-3">{row.grade}</td>
                <td className="px-4 py-3">
                  <StatusBadge tone={row.hasDocumentation ? 'success' : 'warning'}>
                    {row.hasDocumentation ? 'OK' : 'Pendente'}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3">{row.tutorName ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge tone={row.status === 'pendente' ? 'warning' : 'success'}>
                    {row.status === 'pendente' ? 'Pendente' : 'Definido'}
                  </StatusBadge>
                </td>
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

export function InclusiveView() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <InclusiveContent />
    </Suspense>
  );
}
