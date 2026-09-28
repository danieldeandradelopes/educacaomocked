'use client';

import Link from 'next/link';
import { Suspense } from 'react';
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
import { FocusBanner, useFocusParam } from '@/components/ui/FocusBanner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ACTIVE_SEARCH_CASES,
  ACTIVE_SEARCH_TREND,
  SCHOOLS,
  getStudentById,
} from '@/data/mocks';
import { useFilters } from '@/lib/filter-context';
import {
  computeFilteredKpis,
  describeFilters,
  filterActiveSearchCases,
  formatNumber,
  formatPercent,
  isFilterActive,
} from '@/lib/filters';
import { ACTIVE_SEARCH_STATUS_LABEL } from '@/lib/labels';
import type { ActiveSearchCase, ActiveSearchStatus } from '@/domain/types';

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
  if (focus === 'stale') {
    return cases.filter((c) => c.status === 'aguardando_retorno');
  }
  if (focus === 'referrals') {
    return cases.filter(
      (c) => c.status === 'encaminhado' || c.status === 'aguardando_retorno',
    );
  }
  if (focus === 'attendance') {
    return cases.filter((c) => c.attendanceRate < 75);
  }
  return [...cases];
}

function ActiveSearchContent() {
  const { filters } = useFilters();
  const focus = useFocusParam(FOCUS_ALLOWED);
  const kpis = computeFilteredKpis(filters);
  const base = filterActiveSearchCases(ACTIVE_SEARCH_CASES, filters);
  const cases = applyFocus(base, focus);

  const bySchool = SCHOOLS.filter((s) => s.activeSearch > 0)
    .filter((s) => filters.schoolId === 'all' || s.id === filters.schoolId)
    .filter((s) => filters.stage === 'all' || s.stage === filters.stage)
    .map((s) => ({ name: s.name.replace('EMEF ', '').replace('EMEI ', ''), cases: s.activeSearch }));

  const stale = base.filter((c) => c.status === 'aguardando_retorno').length;
  const referrals = base.filter((c) => c.status === 'encaminhado').length;
  const resolved = base.filter((c) => c.status === 'resolvido').length;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-navy)] sm:text-3xl">
          Busca Ativa
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Acompanhamento de baixa frequência e risco de evasão.
          {isFilterActive(filters) ? ` · ${describeFilters(filters)}` : ''}
        </p>
      </section>

      <FocusBanner allowed={FOCUS_ALLOWED} />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard index={0} label="Em busca ativa" value={kpis.activeSearch} accent="danger" />
        <KpiCard index={1} label="Sem atualização (amostra)" value={stale} accent="amber" />
        <KpiCard index={2} label="Resolvidos (amostra)" value={resolved} accent="teal" />
        <KpiCard index={3} label="Encaminhados (amostra)" value={referrals} accent="navy" />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Evolução da Busca Ativa" subtitle="Casos acumulados por mês">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[...ACTIVE_SEARCH_TREND]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e0ea" />
              <XAxis dataKey="month" tick={{ fill: '#5b6b7c', fontSize: 12 }} />
              <YAxis tick={{ fill: '#5b6b7c', fontSize: 12 }} />
              <Tooltip formatter={(value) => [formatNumber(Number(value)), 'Casos']} />
              <Line type="monotone" dataKey="cases" stroke="#B42318" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Distribuição por escola" subtitle="Casos ativos">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bySchool}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e0ea" />
              <XAxis dataKey="name" tick={{ fill: '#5b6b7c', fontSize: 11 }} />
              <YAxis tick={{ fill: '#5b6b7c', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="cases" fill="#C47A11" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <p className="text-sm text-[var(--color-text-secondary)]">
        Exibindo {cases.length} caso(s) na tabela
        {focus ? ' com o filtro do Dashboard' : ''}. Clique no aluno para o perfil 360º.
      </p>

      <DataTable
        caption="Casos de busca ativa"
        headers={['Aluno', 'Escola', 'Série', 'Frequência', 'Situação']}
      >
        {cases.map((item) => {
          const student = getStudentById(item.studentId);
          const school = SCHOOLS.find((s) => s.id === item.schoolId);
          return (
            <tr key={item.id} className="hover:bg-[var(--color-navy)]/[0.03]">
              <td className="px-4 py-3">
                <Link
                  href={`/students/${item.studentId}`}
                  className="font-medium text-[var(--color-primary)] underline-offset-2 hover:underline"
                >
                  {student?.name ?? item.studentId}
                </Link>
              </td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)]">{school?.name}</td>
              <td className="px-4 py-3">{item.grade}</td>
              <td className="px-4 py-3">{formatPercent(item.attendanceRate)}</td>
              <td className="px-4 py-3">
                <StatusBadge tone={statusTone[item.status]}>
                  {ACTIVE_SEARCH_STATUS_LABEL[item.status]}
                </StatusBadge>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </div>
  );
}

export function ActiveSearchView() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">Carregando…</p>}>
      <ActiveSearchContent />
    </Suspense>
  );
}
