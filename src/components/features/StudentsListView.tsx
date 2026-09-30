'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useCrudResource } from '@/hooks/useCrudResource';
import { usePagination } from '@/hooks/usePagination';
import { useSortable } from '@/hooks/useSortable';
import { studentFields } from '@/lib/crud-fields';
import { useApiList } from '@/lib/use-api';
import { useFilters } from '@/lib/filter-context';
import {
  describeFilters,
  filtersResetKey,
  formatPercent,
  isFilterActive,
  matchesSchoolId,
  matchesShiftValue,
  matchesStageValue,
  preferredSchoolId,
  shiftLabel,
  stageLabel,
} from '@/lib/filters';
import type { School, Student } from '@/domain/types';

export function StudentsListView() {
  const studentsReq = useApiList<Student>('students');
  const schoolsReq = useApiList<School>('schools');
  const { filters } = useFilters();
  const schools = schoolsReq.data ?? [];
  const schoolName = (id: string) => schools.find((s) => s.id === id)?.name ?? id;
  const rows = (studentsReq.data ?? []).filter(
    (s) =>
      matchesSchoolId(s.schoolId, filters) &&
      matchesStageValue(s.stage, filters) &&
      matchesShiftValue(s.shift, filters),
  );
  const sortAccessors = useMemo(
    () => ({
      name: (s: Student) => s.name,
      school: (s: Student) => schoolName(s.schoolId),
      grade: (s: Student) => s.grade,
      stage: (s: Student) => stageLabel(s.stage),
      shift: (s: Student) => shiftLabel(s.shift),
      attendance: (s: Student) => s.attendanceRate,
      flags: (s: Student) =>
        [s.inActiveSearch, s.inTutoring, s.inInclusive, s.documentsPending].filter(Boolean).length,
    }),
    [schools],
  );
  const resetKey = filtersResetKey(filters);
  const sorted = useSortable(rows, sortAccessors, { resetKey });
  const pagination = usePagination(sorted.items, {
    resetKey: `${resetKey}|${sorted.sortKey}|${sorted.sortDir}`,
  });
  const loading = studentsReq.loading || schoolsReq.loading;
  const error = studentsReq.error ?? schoolsReq.error;

  const crud = useCrudResource<Student>({
    collection: 'students',
    titleSingular: 'aluno',
    fields: studentFields(schools),
    items: rows,
    reload: studentsReq.reload,
    createDefaults: () => ({
      stage: 'fundamental',
      shift: 'manha',
      attendanceRate: 95,
      birthDate: '2016-01-01',
      inActiveSearch: false,
      inTutoring: false,
      inInclusive: false,
      documentsPending: false,
      transported: false,
      schoolId: preferredSchoolId(filters, schools[0]?.id),
    }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alunos"
        description={`CRUD da rede municipal${isFilterActive(filters) ? ` · ${describeFilters(filters, schools)}` : ''}.`}
        action={crud.toolbar}
      />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard index={0} label="Na lista" value={rows.length} accent="teal" />
            <KpiCard
              index={1}
              label="Busca ativa"
              value={rows.filter((s) => s.inActiveSearch).length}
              accent="danger"
            />
            <KpiCard
              index={2}
              label="Em reforço"
              value={rows.filter((s) => s.inTutoring).length}
              accent="navy"
            />
            <KpiCard
              index={3}
              label="Docs pendentes"
              value={rows.filter((s) => s.documentsPending).length}
              accent="amber"
            />
          </section>
          <DataTable
            caption="Alunos"
            columns={[
              { id: 'name', label: 'Aluno' },
              { id: 'school', label: 'Escola' },
              { id: 'grade', label: 'Série' },
              { id: 'stage', label: 'Etapa' },
              { id: 'shift', label: 'Turno' },
              { id: 'attendance', label: 'Frequência' },
              { id: 'flags', label: 'Flags' },
              { id: 'actions', label: 'Ações', sortable: false },
            ]}
            sort={sorted}
            pagination={pagination}
          >
            {pagination.pageItems.map((student) => (
              <tr key={student.id} className="hover:bg-[var(--color-navy)]/[0.03]">
                <td className="px-4 py-3">
                  <Link
                    href={`/students/${student.id}`}
                    className="font-medium text-[var(--color-primary)] hover:underline"
                  >
                    {student.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                  {schoolName(student.schoolId)}
                </td>
                <td className="px-4 py-3">{student.grade}</td>
                <td className="px-4 py-3">{stageLabel(student.stage)}</td>
                <td className="px-4 py-3">{shiftLabel(student.shift)}</td>
                <td className="px-4 py-3">{formatPercent(student.attendanceRate)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {student.inActiveSearch && <StatusBadge tone="danger">Busca</StatusBadge>}
                    {student.inTutoring && <StatusBadge tone="info">Reforço</StatusBadge>}
                    {student.inInclusive && <StatusBadge tone="success">Inclusão</StatusBadge>}
                    {student.documentsPending && <StatusBadge tone="warning">Docs</StatusBadge>}
                  </div>
                </td>
                <td className="px-4 py-3">{crud.rowActions(student)}</td>
              </tr>
            ))}
          </DataTable>
        </>
      )}
      {crud.modal}
    </div>
  );
}
