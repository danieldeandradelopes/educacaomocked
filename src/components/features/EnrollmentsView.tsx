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
import { enrollmentFields } from '@/lib/crud-fields';
import { apiUpdate } from '@/lib/api-client';
import { useApiList } from '@/lib/use-api';
import { useFilters } from '@/lib/filter-context';
import {
  describeFilters,
  filtersResetKey,
  isFilterActive,
  matchesSchoolId,
  matchesShiftValue,
  matchesStageValue,
  preferredSchoolId,
  shiftLabel,
  stageLabel,
} from '@/lib/filters';
import type { School, Student } from '@/domain/types';

interface Enrollment {
  id: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  grade: string;
  stage: 'creche' | 'infantil' | 'fundamental';
  shift: 'manha' | 'tarde' | 'noite' | 'integral';
  status: 'ativa' | 'transferida' | 'encerrada';
  enrolledAt: string;
}

const STATUS_OPTIONS: { value: Enrollment['status']; label: string }[] = [
  { value: 'ativa', label: 'Ativa' },
  { value: 'transferida', label: 'Transferida' },
  { value: 'encerrada', label: 'Encerrada' },
];

function resolveEnrollment(
  values: Record<string, unknown>,
  students: readonly Student[],
): Record<string, unknown> {
  const student = students.find((s) => s.id === values.studentId);
  return {
    ...values,
    studentName: student?.name ?? values.studentName ?? '',
  };
}

export function EnrollmentsView() {
  const enrollmentsReq = useApiList<Enrollment>('enrollments');
  const studentsReq = useApiList<Student>('students');
  const schoolsReq = useApiList<School>('schools');
  const { filters } = useFilters();
  const statusFilter = useAggregateFilter<Enrollment['status']>();
  const schools = schoolsReq.data ?? [];
  const students = studentsReq.data ?? [];
  const rows = (enrollmentsReq.data ?? []).filter(
    (e) =>
      matchesSchoolId(e.schoolId, filters) &&
      matchesStageValue(e.stage, filters) &&
      matchesShiftValue(e.shift, filters),
  );
  const entries = useMemo(
    () => rows.filter((e) => statusFilter.matches(e.status)),
    [rows, statusFilter],
  );

  const schoolName = (id: string) => schools.find((s) => s.id === id)?.name ?? id;
  const sortAccessors = useMemo(
    () => ({
      student: (e: Enrollment) => e.studentName,
      school: (e: Enrollment) => schoolName(e.schoolId),
      grade: (e: Enrollment) => e.grade,
      stage: (e: Enrollment) => stageLabel(e.stage),
      shift: (e: Enrollment) => shiftLabel(e.shift),
      status: (e: Enrollment) => e.status,
      enrolledAt: (e: Enrollment) => e.enrolledAt,
    }),
    [schools],
  );
  const resetKey = `${filtersResetKey(filters)}|${statusFilter.key}`;
  const sorted = useSortable(entries, sortAccessors, { resetKey });
  const pagination = usePagination(sorted.items, {
    resetKey: `${resetKey}|${sorted.sortKey}|${sorted.sortDir}`,
  });

  const enrolledActiveIds = new Set(
    (enrollmentsReq.data ?? [])
      .filter((e) => e.status === 'ativa')
      .map((e) => e.studentId),
  );
  const candidates = students.filter((s) => !enrolledActiveIds.has(s.id));
  const defaultStudent = candidates[0] ?? students[0];

  const crud = useCrudResource<Enrollment>({
    collection: 'enrollments',
    titleSingular: 'matrícula',
    fields: enrollmentFields(schools, students),
    items: rows,
    reload: () => {
      enrollmentsReq.reload();
      studentsReq.reload();
    },
    createDefaults: () => ({
      status: 'ativa',
      enrolledAt: new Date().toISOString().slice(0, 10),
      studentId: defaultStudent?.id,
      schoolId: preferredSchoolId(filters, defaultStudent?.schoolId ?? schools[0]?.id),
      grade: defaultStudent?.grade ?? '',
      stage: defaultStudent?.stage ?? 'fundamental',
      shift: defaultStudent?.shift ?? 'manha',
    }),
    mapCreate: (values) => resolveEnrollment(values, students),
    mapUpdate: (values) => resolveEnrollment(values, students),
    afterSave: async ({ values }) => {
      const studentId = String(values.studentId ?? '');
      if (!studentId) return;
      await apiUpdate('students', studentId, {
        schoolId: values.schoolId,
        grade: values.grade,
        stage: values.stage,
        shift: values.shift,
      });
    },
  });

  const loading = enrollmentsReq.loading || schoolsReq.loading || studentsReq.loading;
  const error = enrollmentsReq.error ?? schoolsReq.error ?? studentsReq.error;

  const statusOptions = STATUS_OPTIONS.map((opt) => ({
    ...opt,
    count: rows.filter((r) => r.status === opt.value).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matrículas"
        description={`Vincula aluno existente a escola e turma${isFilterActive(filters) ? ` · ${describeFilters(filters, schools)}` : ''}.`}
        action={crud.toolbar}
      />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <KpiCard index={0} label="Ativas" value={rows.filter((r) => r.status === 'ativa').length} accent="teal" />
            <KpiCard
              index={1}
              label="Transferidas"
              value={rows.filter((r) => r.status === 'transferida').length}
              accent="amber"
            />
            <KpiCard
              index={2}
              label="Encerradas"
              value={rows.filter((r) => r.status === 'encerrada').length}
              accent="navy"
            />
          </section>
          <AggregateFilterChips
            label="Status"
            clearLabel="Todos"
            options={statusOptions}
            selected={statusFilter.selected}
            onToggle={statusFilter.toggle}
            onClear={statusFilter.clear}
          />
          <DataTable
            caption="Matrículas"
            columns={[
              { id: 'student', label: 'Aluno' },
              { id: 'school', label: 'Escola' },
              { id: 'grade', label: 'Turma' },
              { id: 'stage', label: 'Etapa' },
              { id: 'shift', label: 'Turno' },
              { id: 'status', label: 'Status' },
              { id: 'enrolledAt', label: 'Data' },
              { id: 'actions', label: 'Ações', sortable: false },
            ]}
            sort={sorted}
            pagination={pagination}
          >
            {pagination.pageItems.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/students/${row.studentId}`}
                    className="font-medium text-[var(--color-primary)]"
                  >
                    {row.studentName}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {schools.find((s) => s.id === row.schoolId)?.name ?? row.schoolId}
                </td>
                <td className="px-4 py-3">{row.grade}</td>
                <td className="px-4 py-3">{stageLabel(row.stage)}</td>
                <td className="px-4 py-3">{shiftLabel(row.shift)}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    tone={
                      row.status === 'ativa' ? 'success' : row.status === 'transferida' ? 'warning' : 'neutral'
                    }
                  >
                    {row.status}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3">{row.enrolledAt}</td>
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
