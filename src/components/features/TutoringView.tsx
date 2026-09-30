'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { AggregateFilterChips } from '@/components/ui/AggregateFilterChips';
import { DataTable } from '@/components/ui/DataTable';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAggregateFilter } from '@/hooks/useAggregateFilter';
import { useCrudResource } from '@/hooks/useCrudResource';
import { usePagination } from '@/hooks/usePagination';
import { useSortable } from '@/hooks/useSortable';
import { tutoringFields } from '@/lib/crud-fields';
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

interface TutoringRow {
  id: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  grade: string;
  subjects: string[];
  bimestre: string;
  status: string;
}

export function TutoringView() {
  const tutoringReq = useApiList<TutoringRow>('tutoring');
  const schoolsReq = useApiList<School>('schools');
  const studentsReq = useApiList<Student>('students');
  const { filters } = useFilters();
  const statusFilter = useAggregateFilter<'em_acompanhamento' | 'evoluiu'>();
  const schools = schoolsReq.data ?? [];
  const kpis = useMemo(
    () => computeFilteredKpis(filters, { schools }),
    [filters, schools],
  );
  const students = studentsReq.data ?? [];
  const base = (tutoringReq.data ?? []).filter((r) => matchesSchoolId(r.schoolId, filters));
  const rows = useMemo(
    () => base.filter((r) => statusFilter.matches(r.status as 'em_acompanhamento' | 'evoluiu')),
    [base, statusFilter],
  );

  const schoolName = (id: string) => schools.find((s) => s.id === id)?.name ?? id;
  const sortAccessors = useMemo(
    () => ({
      student: (r: TutoringRow) => r.studentName,
      school: (r: TutoringRow) => schoolName(r.schoolId),
      grade: (r: TutoringRow) => r.grade,
      subjects: (r: TutoringRow) => r.subjects.join(', '),
      bimestre: (r: TutoringRow) => r.bimestre,
      status: (r: TutoringRow) => r.status,
    }),
    [schools],
  );
  const resetKey = `${filtersResetKey(filters)}|${statusFilter.key}`;
  const sorted = useSortable(rows, sortAccessors, { resetKey });
  const pagination = usePagination(sorted.items, {
    resetKey: `${resetKey}|${sorted.sortKey}|${sorted.sortDir}`,
  });

  const crud = useCrudResource<TutoringRow>({
    collection: 'tutoring',
    titleSingular: 'reforço',
    fields: tutoringFields(schools, students),
    items: base,
    reload: tutoringReq.reload,
    createDefaults: () => ({
      status: 'em_acompanhamento',
      bimestre: '1º',
      subjects: ['Português'],
      studentId: students[0]?.id,
      studentName: students[0]?.name,
      schoolId: students[0]?.schoolId ?? schools[0]?.id,
      grade: students[0]?.grade ?? '',
    }),
    mapCreate: (values) => {
      const student = students.find((s) => s.id === values.studentId);
      return {
        ...values,
        studentName: values.studentName || student?.name || '',
        schoolId: values.schoolId || student?.schoolId,
        grade: values.grade || student?.grade || '',
        subjects: Array.isArray(values.subjects)
          ? values.subjects
          : String(values.subjects ?? '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
      };
    },
    mapUpdate: (values) => ({
      ...values,
      subjects: Array.isArray(values.subjects)
        ? values.subjects
        : String(values.subjects ?? '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
    }),
  });

  const loading = tutoringReq.loading || schoolsReq.loading || studentsReq.loading;
  const error = tutoringReq.error ?? schoolsReq.error ?? studentsReq.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reforço Escolar"
        description={`CRUD de acompanhamentos${isFilterActive(filters) ? ` · ${describeFilters(filters, schools)}` : ''}.`}
        action={crud.toolbar}
      />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <KpiCard index={0} label="Na rede (KPI)" value={kpis.tutoring} accent="navy" />
            <KpiCard index={1} label="Registros" value={base.length} accent="navy" />
            <KpiCard
              index={2}
              label="Evoluíram"
              value={base.filter((r) => r.status === 'evoluiu').length}
              accent="amber"
            />
          </section>
          <AggregateFilterChips
            label="Situação"
            clearLabel="Todos"
            options={(
              [
                { value: 'em_acompanhamento' as const, label: 'Em acompanhamento' },
                { value: 'evoluiu' as const, label: 'Evoluiu' },
              ] as const
            ).map((option) => ({
              ...option,
              count: base.filter((r) => r.status === option.value).length,
            }))}
            selected={statusFilter.selected}
            onToggle={statusFilter.toggle}
            onClear={statusFilter.clear}
          />
          <DataTable
            caption="Reforço"
            columns={[
              { id: 'student', label: 'Aluno' },
              { id: 'school', label: 'Escola' },
              { id: 'grade', label: 'Série' },
              { id: 'subjects', label: 'Disciplinas' },
              { id: 'bimestre', label: 'Bimestre' },
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
                <td className="px-4 py-3">{row.subjects.join(', ')}</td>
                <td className="px-4 py-3">{row.bimestre}</td>
                <td className="px-4 py-3">
                  <StatusBadge tone={row.status === 'evoluiu' ? 'success' : 'info'}>
                    {row.status === 'evoluiu' ? 'Evoluiu' : 'Em acompanhamento'}
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
