'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { useCrudResource } from '@/hooks/useCrudResource';
import { usePagination } from '@/hooks/usePagination';
import { useSortable } from '@/hooks/useSortable';
import { transportRouteFields } from '@/lib/crud-fields';
import { useApiList } from '@/lib/use-api';
import { useFilters } from '@/lib/filter-context';
import {
  computeFilteredKpis,
  describeFilters,
  filtersResetKey,
  isFilterActive,
  matchesSchoolId,
} from '@/lib/filters';
import type { School } from '@/domain/types';

interface RouteRow {
  id: string;
  name: string;
  vehicle: string;
  driver: string;
  students: number;
}

interface TransportStudent {
  id: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  routeId: string;
  neighborhood: string;
}

export function TransportView() {
  const routesReq = useApiList<RouteRow>('transportRoutes');
  const transportedReq = useApiList<TransportStudent>('transportStudents');
  const schoolsReq = useApiList<School>('schools');
  const { filters } = useFilters();
  const schools = schoolsReq.data ?? [];
  const kpis = useMemo(
    () => computeFilteredKpis(filters, { schools }),
    [filters, schools],
  );
  const students = (transportedReq.data ?? []).filter((s) => matchesSchoolId(s.schoolId, filters));
  const routes = routesReq.data ?? [];
  const schoolName = (id: string) => schools.find((s) => s.id === id)?.name ?? id;
  const routeName = (id: string) => routes.find((r) => r.id === id)?.name ?? id;

  const routeSortAccessors = useMemo(
    () => ({
      name: (r: RouteRow) => r.name,
      vehicle: (r: RouteRow) => r.vehicle,
      driver: (r: RouteRow) => r.driver,
      students: (r: RouteRow) => r.students,
    }),
    [],
  );
  const studentSortAccessors = useMemo(
    () => ({
      student: (r: TransportStudent) => r.studentName,
      school: (r: TransportStudent) => schoolName(r.schoolId),
      route: (r: TransportStudent) => routeName(r.routeId),
      neighborhood: (r: TransportStudent) => r.neighborhood,
    }),
    [schools, routes],
  );

  const resetKey = filtersResetKey(filters);
  const routesSorted = useSortable(routes, routeSortAccessors, { resetKey });
  const studentsSorted = useSortable(students, studentSortAccessors, { resetKey });
  const routesPagination = usePagination(routesSorted.items, {
    resetKey: `${resetKey}|routes|${routesSorted.sortKey}|${routesSorted.sortDir}`,
  });
  const studentsPagination = usePagination(studentsSorted.items, {
    resetKey: `${resetKey}|students|${studentsSorted.sortKey}|${studentsSorted.sortDir}`,
  });

  const crud = useCrudResource<RouteRow>({
    collection: 'transportRoutes',
    titleSingular: 'rota',
    fields: transportRouteFields(),
    items: routesReq.data ?? [],
    reload: routesReq.reload,
    createDefaults: () => ({
      students: 0,
      vehicle: 'Van 01',
      driver: '',
    }),
  });

  const loading = routesReq.loading || transportedReq.loading || schoolsReq.loading;
  const error = routesReq.error ?? transportedReq.error ?? schoolsReq.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transporte Escolar"
        description={`CRUD de rotas e visão de alunos transportados${isFilterActive(filters) ? ` · ${describeFilters(filters, schools)}` : ''}.`}
        action={crud.toolbar}
      />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard index={0} label="Transportados (KPI)" value={kpis.transport} accent="navy" />
            <KpiCard index={1} label="Alunos (amostra)" value={students.length} accent="teal" />
            <KpiCard index={2} label="Rotas" value={(routesReq.data ?? []).length} accent="amber" />
            <KpiCard index={3} label="Veículos" value={(routesReq.data ?? []).length} accent="navy" />
          </section>
          <DataTable
            caption="Rotas"
            columns={[
              { id: 'name', label: 'Rota' },
              { id: 'vehicle', label: 'Veículo' },
              { id: 'driver', label: 'Motorista' },
              { id: 'students', label: 'Alunos' },
              { id: 'actions', label: 'Ações', sortable: false },
            ]}
            sort={routesSorted}
            pagination={routesPagination}
          >
            {routesPagination.pageItems.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-medium text-[var(--color-navy)]">{row.name}</td>
                <td className="px-4 py-3">{row.vehicle}</td>
                <td className="px-4 py-3">{row.driver}</td>
                <td className="px-4 py-3">{row.students}</td>
                <td className="px-4 py-3">{crud.rowActions(row)}</td>
              </tr>
            ))}
          </DataTable>
          <DataTable
            caption="Alunos transportados"
            columns={[
              { id: 'student', label: 'Aluno' },
              { id: 'school', label: 'Escola' },
              { id: 'route', label: 'Rota' },
              { id: 'neighborhood', label: 'Bairro' },
            ]}
            sort={studentsSorted}
            pagination={studentsPagination}
          >
            {studentsPagination.pageItems.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3">
                  <Link href={`/students/${row.studentId}`} className="font-medium text-[var(--color-primary)]">
                    {row.studentName}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {schools.find((s) => s.id === row.schoolId)?.name ?? row.schoolId}
                </td>
                <td className="px-4 py-3">
                  {(routesReq.data ?? []).find((r) => r.id === row.routeId)?.name ?? row.routeId}
                </td>
                <td className="px-4 py-3">{row.neighborhood}</td>
              </tr>
            ))}
          </DataTable>
        </>
      )}
      {crud.modal}
    </div>
  );
}
