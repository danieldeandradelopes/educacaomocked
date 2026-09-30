'use client';

import { useMemo } from 'react';
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
import { ChartCard, KpiCard } from '@/components/ui/KpiCard';
import { DataTable } from '@/components/ui/DataTable';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/ui/PageHeader';
import { usePagination } from '@/hooks/usePagination';
import { useSortable } from '@/hooks/useSortable';
import { useApiList } from '@/lib/use-api';
import { useFilters } from '@/lib/filter-context';
import { describeFilters, filtersResetKey, formatPercent, isFilterActive, matchesSchoolId } from '@/lib/filters';
import type { School } from '@/domain/types';

interface Monthly {
  month: string;
  rate: number;
}

interface BySchool {
  schoolId: string;
  schoolName: string;
  rate: number;
  lowAttendance: number;
}

export function AttendanceView() {
  const monthly = useApiList<Monthly>('attendanceMonthly');
  const bySchool = useApiList<BySchool>('attendanceBySchool');
  const schoolsReq = useApiList<School>('schools');
  const { filters } = useFilters();
  const networkSchools = schoolsReq.data ?? [];
  const schools = (bySchool.data ?? []).filter((s) => matchesSchoolId(s.schoolId, filters));
  const avg =
    schools.length > 0
      ? schools.reduce((sum, s) => sum + s.rate, 0) / schools.length
      : 0;
  const low = schools.reduce((sum, s) => sum + s.lowAttendance, 0);
  const sortAccessors = useMemo(
    () => ({
      school: (r: BySchool) => r.schoolName,
      rate: (r: BySchool) => r.rate,
      lowAttendance: (r: BySchool) => r.lowAttendance,
    }),
    [],
  );
  const resetKey = filtersResetKey(filters);
  const sorted = useSortable(schools, sortAccessors, { defaultKey: 'rate', defaultDir: 'desc', resetKey });
  const pagination = usePagination(sorted.items, {
    resetKey: `${resetKey}|${sorted.sortKey}|${sorted.sortDir}`,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Frequência"
        description={`Acompanhamento da frequência escolar da rede${isFilterActive(filters) ? ` · ${describeFilters(filters, networkSchools)}` : ''}.`}
      />
      {(monthly.loading || bySchool.loading || schoolsReq.loading) && <LoadingBlock />}
      {(monthly.error || bySchool.error || schoolsReq.error) && (
        <ErrorBlock message={monthly.error ?? bySchool.error ?? schoolsReq.error ?? 'Erro'} />
      )}
      {!monthly.loading && !bySchool.loading && !schoolsReq.loading && (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <KpiCard index={0} label="Média filtrada" value={Number(avg.toFixed(1))} hint="%" accent="teal" />
            <KpiCard index={1} label="Baixa frequência (proxy)" value={low} accent="danger" />
            <KpiCard index={2} label="Escolas na visão" value={schools.length} accent="navy" />
          </section>
          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Evolução mensal" subtitle="Rede">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly.data ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d7e0ea" />
                  <XAxis dataKey="month" tick={{ fill: '#5b6b7c', fontSize: 12 }} />
                  <YAxis domain={[90, 97]} tick={{ fill: '#5b6b7c', fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="rate" stroke="#0F6B5C" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Por escola" subtitle="Taxa atual">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={schools}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d7e0ea" />
                  <XAxis dataKey="schoolName" hide />
                  <YAxis domain={[90, 97]} tick={{ fill: '#5b6b7c', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="rate" fill="#1B2A4A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <DataTable
            caption="Frequência por escola"
            columns={[
              { id: 'school', label: 'Escola' },
              { id: 'rate', label: 'Frequência' },
              { id: 'lowAttendance', label: 'Baixa frequência' },
            ]}
            sort={sorted}
            pagination={pagination}
          >
            {pagination.pageItems.map((row) => (
              <tr key={row.schoolId}>
                <td className="px-4 py-3 font-medium text-[var(--color-navy)]">{row.schoolName}</td>
                <td className="px-4 py-3">{formatPercent(row.rate)}</td>
                <td className="px-4 py-3">{row.lowAttendance}</td>
              </tr>
            ))}
          </DataTable>
        </>
      )}
    </div>
  );
}
