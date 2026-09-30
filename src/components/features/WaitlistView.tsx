'use client';

import { Suspense, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
import { waitlistFields } from '@/lib/crud-fields';
import { useApiList } from '@/lib/use-api';
import { useFilters } from '@/lib/filter-context';
import {
  computeFilteredKpis,
  describeFilters,
  filterSchools,
  filterWaitlistEntries,
  filtersResetKey,
  formatNumber,
  isFilterActive,
  preferredSchoolId,
  stageLabel,
} from '@/lib/filters';
import { CHART_SERIES, CHART_THEME } from '@/lib/chart-theme';
import type { School, WaitlistEntry } from '@/domain/types';

const PIE_COLORS = [...CHART_SERIES];
const FOCUS_ALLOWED = ['over60'] as const;

type WaitSituation = 'recent' | 'over30' | 'over60';

function waitSituation(days: number): WaitSituation {
  if (days > 60) return 'over60';
  if (days > 30) return 'over30';
  return 'recent';
}

function situationLabel(value: WaitSituation) {
  if (value === 'over60') return '> 60 dias';
  if (value === 'over30') return '> 30 dias';
  return 'Recente';
}

function applySituation(
  entries: readonly WaitlistEntry[],
  matches: (value: WaitSituation) => boolean,
): WaitlistEntry[] {
  return entries.filter((e) => matches(waitSituation(e.waitingDays)));
}

function WaitlistContent() {
  const waitlistReq = useApiList<WaitlistEntry>('waitlist');
  const schoolsReq = useApiList<School>('schools');
  const { filters } = useFilters();
  const focus = useFocusParam(FOCUS_ALLOWED);
  const situationFilter = useAggregateFilter<WaitSituation>(
    focus === 'over60' ? ['over60'] : [],
  );
  const schools = schoolsReq.data ?? [];
  const base = filterWaitlistEntries(waitlistReq.data ?? [], filters);
  const kpis = useMemo(
    () => computeFilteredKpis(filters, { schools, waitlistCount: base.length }),
    [filters, schools, base.length],
  );

  const entries = useMemo(
    () => applySituation(base, situationFilter.matches),
    [base, situationFilter.matches],
  );

  const over60 = base.filter((e) => e.waitingDays > 60).length;
  const over30 = base.filter((e) => e.waitingDays > 30).length;
  const avgWait = Math.round(
    base.reduce((sum, e) => sum + e.waitingDays, 0) / Math.max(base.length, 1),
  );

  const schoolName = (id: string) => schools.find((s) => s.id === id)?.name ?? id;

  const sortAccessors = useMemo(
    () => ({
      childName: (e: WaitlistEntry) => e.childName,
      stage: (e: WaitlistEntry) => stageLabel(e.stage),
      school: (e: WaitlistEntry) => schoolName(e.preferredSchoolId),
      neighborhood: (e: WaitlistEntry) => e.neighborhood,
      waitingDays: (e: WaitlistEntry) => e.waitingDays,
      situation: (e: WaitlistEntry) => e.waitingDays,
    }),
    [schools],
  );

  const resetKey = `${filtersResetKey(filters)}|${focus ?? ''}|${situationFilter.key}`;
  const sorted = useSortable(entries, sortAccessors, {
    defaultKey: 'waitingDays',
    defaultDir: 'desc',
    resetKey,
  });
  const pagination = usePagination(sorted.items, { resetKey: `${resetKey}|${sorted.sortKey}|${sorted.sortDir}` });

  const bySchool = filterSchools(schools, filters)
    .map((s) => ({
      name: s.name.replace('EMEF ', '').replace('EMEI ', '').replace('Creche ', ''),
      count: entries.filter((w) => w.preferredSchoolId === s.id).length,
    }))
    .filter((row) => row.count > 0);

  const stageCounts = [
    { stage: 'Creche', count: entries.filter((e) => e.stage === 'creche').length },
    { stage: 'Ed. Infantil', count: entries.filter((e) => e.stage === 'infantil').length },
    { stage: 'Fundamental', count: entries.filter((e) => e.stage === 'fundamental').length },
  ].filter((row) => row.count > 0);

  const crud = useCrudResource<WaitlistEntry>({
    collection: 'waitlist',
    titleSingular: 'registro de espera',
    fields: waitlistFields(schools),
    items: entries,
    reload: waitlistReq.reload,
    createDefaults: () => ({
      stage: 'creche',
      age: 2,
      waitingDays: 1,
      requestedAt: new Date().toISOString().slice(0, 10),
      preferredSchoolId: preferredSchoolId(filters, schools[0]?.id),
      neighborhood: schools[0]?.neighborhood ?? '',
    }),
  });

  const loading = waitlistReq.loading || schoolsReq.loading;
  const error = waitlistReq.error ?? schoolsReq.error;

  const situationOptions: { value: WaitSituation; label: string; count: number }[] = [
    {
      value: 'recent',
      label: 'Recente',
      count: base.filter((e) => waitSituation(e.waitingDays) === 'recent').length,
    },
    {
      value: 'over30',
      label: '> 30 dias',
      count: base.filter((e) => waitSituation(e.waitingDays) === 'over30').length,
    },
    {
      value: 'over60',
      label: '> 60 dias',
      count: base.filter((e) => waitSituation(e.waitingDays) === 'over60').length,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lista de Espera"
        description={`CRUD da demanda por vagas${isFilterActive(filters) ? ` · ${describeFilters(filters, schools)}` : ''}.`}
        action={crud.toolbar}
      />
      <FocusBanner allowed={FOCUS_ALLOWED} />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard index={0} label="Total (KPI)" value={kpis.waitlist} accent="amber" />
            <KpiCard index={1} label="Tempo médio (dias)" value={avgWait || 0} accent="navy" />
            <KpiCard index={2} label="Acima de 30 dias" value={over30} accent="amber" />
            <KpiCard index={3} label="Acima de 60 dias" value={over60} accent="danger" />
          </section>
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Distribuição por etapa" subtitle="Lista filtrada">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stageCounts}
                    dataKey="count"
                    nameKey="stage"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {stageCounts.map((entry, index) => (
                      <Cell key={entry.stage} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatNumber(Number(value)), 'Crianças']} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Demanda por escola" subtitle="Preferência declarada">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bySchool}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                  <XAxis dataKey="name" tick={{ fill: CHART_THEME.muted, fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fill: CHART_THEME.muted, fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill={CHART_THEME.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <AggregateFilterChips
              label="Situação"
              clearLabel="Todas"
              options={situationOptions}
              selected={situationFilter.selected}
              onToggle={situationFilter.toggle}
              onClear={situationFilter.clear}
            />
          </div>

          <DataTable
            caption="Lista de espera"
            columns={[
              { id: 'childName', label: 'Criança' },
              { id: 'stage', label: 'Etapa' },
              { id: 'school', label: 'Escola' },
              { id: 'neighborhood', label: 'Bairro' },
              { id: 'waitingDays', label: 'Dias' },
              { id: 'situation', label: 'Situação' },
              { id: 'actions', label: 'Ações', sortable: false },
            ]}
            sort={sorted}
            pagination={pagination}
          >
            {pagination.pageItems.map((entry) => {
              const sit = waitSituation(entry.waitingDays);
              return (
                <tr key={entry.id}>
                  <td className="px-4 py-3 font-medium text-[var(--color-navy)]">{entry.childName}</td>
                  <td className="px-4 py-3">{stageLabel(entry.stage)}</td>
                  <td className="px-4 py-3">{schoolName(entry.preferredSchoolId)}</td>
                  <td className="px-4 py-3">{entry.neighborhood}</td>
                  <td className="px-4 py-3">{entry.waitingDays}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      tone={sit === 'over60' ? 'danger' : sit === 'over30' ? 'warning' : 'info'}
                    >
                      {situationLabel(sit)}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">{crud.rowActions(entry)}</td>
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

export function WaitlistView() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <WaitlistContent />
    </Suspense>
  );
}
