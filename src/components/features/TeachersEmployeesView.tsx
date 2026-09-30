'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useCrudResource } from '@/hooks/useCrudResource';
import { usePagination } from '@/hooks/usePagination';
import { useSortable } from '@/hooks/useSortable';
import { staffFields } from '@/lib/crud-fields';
import { useApiList } from '@/lib/use-api';
import { useFilters } from '@/lib/filter-context';
import {
  computeFilteredKpis,
  describeFilters,
  filterStaffMembers,
  filtersResetKey,
  isFilterActive,
  preferredSchoolId,
  shiftLabel,
} from '@/lib/filters';
import { EMPLOYMENT_TYPE_LABEL } from '@/lib/labels';
import type { School, StaffMember } from '@/domain/types';

function StaffCrudView({
  title,
  description,
  onlyTeachers,
}: {
  title: string;
  description: string;
  onlyTeachers: boolean;
}) {
  const staffReq = useApiList<StaffMember>('staff');
  const schoolsReq = useApiList<School>('schools');
  const { filters } = useFilters();
  const schools = schoolsReq.data ?? [];
  const filteredStaff = filterStaffMembers(staffReq.data ?? [], filters, schools);
  const ciopCount = filteredStaff.filter((s) => s.employmentType === 'ciop').length;
  const kpis = useMemo(
    () => computeFilteredKpis(filters, { schools, ciopCount }),
    [filters, schools, ciopCount],
  );
  const rows = filteredStaff.filter((s) => (onlyTeachers ? s.isTeacher : !s.isTeacher));
  const schoolName = (id: string) => schools.find((s) => s.id === id)?.name ?? id;
  const sortAccessors = useMemo(
    () => ({
      name: (r: StaffMember) => r.name,
      school: (r: StaffMember) => schoolName(r.schoolId),
      role: (r: StaffMember) => r.role,
      employment: (r: StaffMember) => EMPLOYMENT_TYPE_LABEL[r.employmentType],
      shift: (r: StaffMember) => shiftLabel(r.shift),
    }),
    [schools],
  );
  const resetKey = `${filtersResetKey(filters)}|${onlyTeachers}`;
  const sorted = useSortable(rows, sortAccessors, { resetKey });
  const pagination = usePagination(sorted.items, {
    resetKey: `${resetKey}|${sorted.sortKey}|${sorted.sortDir}`,
  });

  const crud = useCrudResource<StaffMember>({
    collection: 'staff',
    titleSingular: onlyTeachers ? 'professor' : 'funcionário',
    fields: staffFields(schools),
    items: rows,
    reload: staffReq.reload,
    createDefaults: () => ({
      isTeacher: onlyTeachers,
      employmentType: 'effective',
      shift: 'manha',
      schoolId: preferredSchoolId(filters, schools[0]?.id),
      role: onlyTeachers ? 'Professor(a) — Português' : 'Auxiliar de sala',
    }),
  });

  const loading = staffReq.loading || schoolsReq.loading;
  const error = staffReq.error ?? schoolsReq.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={`${description}${isFilterActive(filters) ? ` · ${describeFilters(filters, schools)}` : ''}.`}
        action={crud.toolbar}
      />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <KpiCard
              index={0}
              label={onlyTeachers ? 'Professores (KPI)' : 'Funcionários (KPI)'}
              value={onlyTeachers ? kpis.teachers : kpis.staff}
              accent={onlyTeachers ? 'navy' : 'navy'}
            />
            <KpiCard index={1} label="Registros" value={rows.length} accent="navy" />
            <KpiCard
              index={2}
              label={onlyTeachers ? 'Efetivos' : 'Funcionários CIOP'}
              value={
                onlyTeachers
                  ? rows.filter((r) => r.employmentType === 'effective').length
                  : rows.filter((r) => r.employmentType === 'ciop').length
              }
              accent="amber"
            />
          </section>
          <DataTable
            caption={title}
            columns={[
              { id: 'name', label: 'Nome' },
              { id: 'school', label: 'Escola' },
              { id: 'role', label: 'Função' },
              { id: 'employment', label: 'Vínculo' },
              { id: 'shift', label: 'Turno' },
              { id: 'actions', label: 'Ações', sortable: false },
            ]}
            sort={sorted}
            pagination={pagination}
          >
            {pagination.pageItems.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-medium text-[var(--color-navy)]">{row.name}</td>
                <td className="px-4 py-3">
                  {schools.find((s) => s.id === row.schoolId)?.name ?? row.schoolId}
                </td>
                <td className="px-4 py-3">{row.role}</td>
                <td className="px-4 py-3">
                  <StatusBadge tone={row.employmentType === 'ciop' ? 'warning' : 'neutral'}>
                    {EMPLOYMENT_TYPE_LABEL[row.employmentType]}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3">{shiftLabel(row.shift)}</td>
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

export function TeachersView() {
  return (
    <StaffCrudView
      title="Professores"
      description="CRUD do quadro docente"
      onlyTeachers
    />
  );
}

export function EmployeesView() {
  return (
    <StaffCrudView
      title="Funcionários"
      description="CRUD da equipe administrativa e de apoio"
      onlyTeachers={false}
    />
  );
}
