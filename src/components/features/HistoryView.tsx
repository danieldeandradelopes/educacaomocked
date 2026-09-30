'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/ui/PageHeader';
import { useCrudResource } from '@/hooks/useCrudResource';
import { usePagination } from '@/hooks/usePagination';
import { useSortable } from '@/hooks/useSortable';
import { historyFields } from '@/lib/crud-fields';
import { useApiList } from '@/lib/use-api';
import { useFilters } from '@/lib/filter-context';
import { describeFilters, filtersResetKey, isFilterActive, matchesSchoolId, preferredSchoolId } from '@/lib/filters';
import type { School, Student } from '@/domain/types';

interface HistoryEvent {
  id: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  event: string;
  date: string;
  detail: string;
}

export function HistoryView() {
  const historyReq = useApiList<HistoryEvent>('history');
  const studentsReq = useApiList<Student>('students');
  const schoolsReq = useApiList<School>('schools');
  const { filters } = useFilters();
  const schools = schoolsReq.data ?? [];
  const students = studentsReq.data ?? [];
  const rows = (historyReq.data ?? []).filter((h) => matchesSchoolId(h.schoolId, filters));
  const schoolName = (id: string) => schools.find((s) => s.id === id)?.name ?? id;
  const sortAccessors = useMemo(
    () => ({
      date: (h: HistoryEvent) => h.date,
      student: (h: HistoryEvent) => h.studentName,
      school: (h: HistoryEvent) => schoolName(h.schoolId),
      event: (h: HistoryEvent) => h.event,
      detail: (h: HistoryEvent) => h.detail,
    }),
    [schools],
  );
  const resetKey = filtersResetKey(filters);
  const sorted = useSortable(rows, sortAccessors, { defaultKey: 'date', defaultDir: 'desc', resetKey });
  const pagination = usePagination(sorted.items, {
    resetKey: `${resetKey}|${sorted.sortKey}|${sorted.sortDir}`,
  });

  const crud = useCrudResource<HistoryEvent>({
    collection: 'history',
    titleSingular: 'evento',
    fields: historyFields(schools, students),
    items: rows,
    reload: historyReq.reload,
    createDefaults: () => ({
      date: new Date().toISOString().slice(0, 10),
      schoolId: preferredSchoolId(filters, schools[0]?.id),
      studentId: students[0]?.id,
      studentName: students[0]?.name,
      event: 'Registro',
      detail: '',
    }),
    mapCreate: (values) => {
      const student = students.find((s) => s.id === values.studentId);
      return {
        ...values,
        studentName: student?.name ?? values.studentName,
        schoolId: student?.schoolId ?? values.schoolId,
      };
    },
    mapUpdate: (values) => {
      const student = students.find((s) => s.id === values.studentId);
      return {
        ...values,
        studentName: student?.name ?? values.studentName,
        schoolId: student?.schoolId ?? values.schoolId,
      };
    },
  });

  const loading = historyReq.loading || studentsReq.loading || schoolsReq.loading;
  const error = historyReq.error ?? studentsReq.error ?? schoolsReq.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico escolar"
        description={`CRUD da linha do tempo consolidada${isFilterActive(filters) ? ` · ${describeFilters(filters, schools)}` : ''}.`}
        action={crud.toolbar}
      />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && (
        <DataTable
          caption="Histórico"
          columns={[
            { id: 'date', label: 'Data' },
            { id: 'student', label: 'Aluno' },
            { id: 'school', label: 'Escola' },
            { id: 'event', label: 'Evento' },
            { id: 'detail', label: 'Detalhe' },
            { id: 'actions', label: 'Ações', sortable: false },
          ]}
          sort={sorted}
          pagination={pagination}
        >
          {pagination.pageItems.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3">{row.date}</td>
              <td className="px-4 py-3">
                <Link href={`/students/${row.studentId}`} className="font-medium text-[var(--color-primary)]">
                  {row.studentName}
                </Link>
              </td>
              <td className="px-4 py-3">
                {schools.find((s) => s.id === row.schoolId)?.name ?? row.schoolId}
              </td>
              <td className="px-4 py-3 font-medium text-[var(--color-navy)]">{row.event}</td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.detail}</td>
              <td className="px-4 py-3">{crud.rowActions(row)}</td>
            </tr>
          ))}
        </DataTable>
      )}
      {crud.modal}
    </div>
  );
}
