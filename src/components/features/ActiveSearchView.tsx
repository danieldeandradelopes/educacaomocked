'use client';

import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AggregateFilterChips } from '@/components/ui/AggregateFilterChips';
import { ChartCard, KpiCard } from '@/components/ui/KpiCard';
import { DataTable } from '@/components/ui/DataTable';
import { FocusBanner, useFocusParam } from '@/components/ui/FocusBanner';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAggregateFilter } from '@/hooks/useAggregateFilter';
import { useCrudResource } from '@/hooks/useCrudResource';
import { usePagination } from '@/hooks/usePagination';
import { useSortable } from '@/hooks/useSortable';
import { activeSearchFields } from '@/lib/crud-fields';
import { CHART_THEME } from '@/lib/chart-theme';
import { useApiList } from '@/lib/use-api';
import { useFilters } from '@/lib/filter-context';
import {
  computeFilteredKpis,
  describeFilters,
  filterActiveSearchCases,
  filterSchools,
  filtersResetKey,
  formatNumber,
  formatPercent,
  isFilterActive,
  preferredSchoolId,
} from '@/lib/filters';
import { ACTIVE_SEARCH_STATUS_LABEL } from '@/lib/labels';
import type { ActiveSearchCase, ActiveSearchStatus, School, Student } from '@/domain/types';

const statusTone: Record<ActiveSearchStatus, 'info' | 'warning' | 'danger' | 'success' | 'neutral'> = {
  em_acompanhamento: 'info',
  em_investigacao: 'warning',
  aguardando_retorno: 'warning',
  encaminhado: 'neutral',
  resolvido: 'success',
  encerrado: 'neutral',
};

const FOCUS_ALLOWED = ['attendance', 'stale', 'referrals'] as const;

function applyFocus(
  cases: readonly ActiveSearchCase[],
  focus: string | null,
): ActiveSearchCase[] {
  if (focus === 'stale') return cases.filter((c) => c.status === 'aguardando_retorno');
  if (focus === 'referrals') {
    return cases.filter((c) => c.status === 'encaminhado' || c.status === 'aguardando_retorno');
  }
  if (focus === 'attendance') return cases.filter((c) => c.attendanceRate < 75);
  return [...cases];
}

function ActiveSearchContent() {
  const casesReq = useApiList<ActiveSearchCase>('activeSearch');
  const trendReq = useApiList<{ month: string; cases: number }>('activeSearchTrend');
  const schoolsReq = useApiList<School>('schools');
  const studentsReq = useApiList<Student>('students');
  const { filters } = useFilters();
  const focus = useFocusParam(FOCUS_ALLOWED);
  const statusFilter = useAggregateFilter<ActiveSearchStatus>();
  const schools = schoolsReq.data ?? [];
  const students = studentsReq.data ?? [];
  const base = filterActiveSearchCases(casesReq.data ?? [], filters, schools);
  const kpis = useMemo(
    () => computeFilteredKpis(filters, { schools }),
    [filters, schools],
  );
  const afterFocus = applyFocus(base, focus);
  const cases = useMemo(
    () => afterFocus.filter((c) => statusFilter.matches(c.status)),
    [afterFocus, statusFilter],
  );
  const stale = base.filter((c) => c.status === 'aguardando_retorno').length;
  const referrals = base.filter((c) => c.status === 'encaminhado').length;
  const resolved = base.filter((c) => c.status === 'resolvido').length;

  const schoolName = (id: string) => schools.find((s) => s.id === id)?.name ?? id;
  const studentName = (id: string) => students.find((s) => s.id === id)?.name ?? id;
  const sortAccessors = useMemo(
    () => ({
      student: (c: ActiveSearchCase) => studentName(c.studentId),
      school: (c: ActiveSearchCase) => schoolName(c.schoolId),
      grade: (c: ActiveSearchCase) => c.grade,
      attendance: (c: ActiveSearchCase) => c.attendanceRate,
      status: (c: ActiveSearchCase) => ACTIVE_SEARCH_STATUS_LABEL[c.status],
    }),
    [schools, students],
  );
  const resetKey = `${filtersResetKey(filters)}|${focus ?? ''}|${statusFilter.key}`;
  const sorted = useSortable(cases, sortAccessors, { resetKey });
  const pagination = usePagination(sorted.items, {
    resetKey: `${resetKey}|${sorted.sortKey}|${sorted.sortDir}`,
  });

  const bySchool = filterSchools(schools, filters)
    .map((s) => ({
      name: s.name.replace('EMEF ', '').replace('EMEI ', ''),
      cases: filterActiveSearchCases(casesReq.data ?? [], filters, schools).filter(
        (c) => c.schoolId === s.id,
      ).length,
    }))
    .filter((row) => row.cases > 0);

  const crud = useCrudResource<ActiveSearchCase>({
    collection: 'activeSearch',
    titleSingular: 'caso de busca ativa',
    fields: activeSearchFields(schools, students),
    items: afterFocus,
    reload: casesReq.reload,
    createDefaults: () => ({
      status: 'em_acompanhamento',
      attendanceRate: 70,
      openedAt: new Date().toISOString().slice(0, 10),
      lastUpdateAt: new Date().toISOString().slice(0, 10),
      schoolId: preferredSchoolId(filters, schools[0]?.id),
      studentId: students[0]?.id,
      grade: students[0]?.grade ?? '5º ano',
    }),
    mapCreate: (values) => {
      const student = students.find((s) => s.id === values.studentId);
      return {
        ...values,
        grade: values.grade || student?.grade || '',
        schoolId: values.schoolId || student?.schoolId,
      };
    },
  });

  const loading = casesReq.loading || schoolsReq.loading || studentsReq.loading;
  const error = casesReq.error ?? schoolsReq.error ?? studentsReq.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Busca Ativa"
        description={`CRUD de baixa frequência e risco de evasão${isFilterActive(filters) ? ` · ${describeFilters(filters, schools)}` : ''}.`}
        action={crud.toolbar}
      />
      <FocusBanner allowed={FOCUS_ALLOWED} />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard index={0} label="Em busca ativa (KPI)" value={kpis.activeSearch} accent="danger" />
            <KpiCard index={1} label="Sem atualização" value={stale} accent="amber" />
            <KpiCard index={2} label="Resolvidos" value={resolved} accent="navy" />
            <KpiCard index={3} label="Encaminhados" value={referrals} accent="navy" />
          </section>
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Evolução" subtitle="Casos por mês">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendReq.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                  <XAxis dataKey="month" tick={{ fill: CHART_THEME.muted, fontSize: 12 }} />
                  <YAxis tick={{ fill: CHART_THEME.muted, fontSize: 12 }} />
                  <Tooltip formatter={(value) => [formatNumber(Number(value)), 'Casos']} />
                  <Line type="monotone" dataKey="cases" stroke={CHART_THEME.danger} strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Por escola" subtitle="Casos cadastrados">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bySchool}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                  <XAxis dataKey="name" tick={{ fill: CHART_THEME.muted, fontSize: 11 }} />
                  <YAxis tick={{ fill: CHART_THEME.muted, fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="cases" fill={CHART_THEME.warning} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <AggregateFilterChips
            label="Situação"
            clearLabel="Todos"
            options={(Object.keys(ACTIVE_SEARCH_STATUS_LABEL) as ActiveSearchStatus[])
              .map((st) => ({
                value: st,
                label: ACTIVE_SEARCH_STATUS_LABEL[st],
                count: afterFocus.filter((c) => c.status === st).length,
              }))
              .filter(
                (opt) =>
                  opt.count > 0 || statusFilter.selected.includes(opt.value),
              )}
            selected={statusFilter.selected}
            onToggle={statusFilter.toggle}
            onClear={statusFilter.clear}
          />
          <DataTable
            caption="Casos de busca ativa"
            columns={[
              { id: 'student', label: 'Aluno' },
              { id: 'school', label: 'Escola' },
              { id: 'grade', label: 'Série' },
              { id: 'attendance', label: 'Frequência' },
              { id: 'status', label: 'Situação' },
              { id: 'actions', label: 'Ações', sortable: false },
            ]}
            sort={sorted}
            pagination={pagination}
          >
            {pagination.pageItems.map((item) => {
              const student = students.find((s) => s.id === item.studentId);
              const school = schools.find((s) => s.id === item.schoolId);
              return (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/students/${item.studentId}`}
                      className="font-medium text-[var(--color-primary)] hover:underline"
                    >
                      {student?.name ?? item.studentId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{school?.name ?? item.schoolId}</td>
                  <td className="px-4 py-3">{item.grade}</td>
                  <td className="px-4 py-3">{formatPercent(item.attendanceRate)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={statusTone[item.status]}>
                      {ACTIVE_SEARCH_STATUS_LABEL[item.status]}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">{crud.rowActions(item)}</td>
                </tr>
              );
            })}
          </DataTable>
        </>
      )}
      {crud.modal}
    </div>
  );
}

export function ActiveSearchView() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <ActiveSearchContent />
    </Suspense>
  );
}
