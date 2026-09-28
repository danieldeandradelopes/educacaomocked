'use client';

import { Suspense } from 'react';
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
import { ChartCard, KpiCard } from '@/components/ui/KpiCard';
import { DataTable } from '@/components/ui/DataTable';
import { FocusBanner, useFocusParam } from '@/components/ui/FocusBanner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SCHOOLS, WAITLIST, WAITLIST_BY_STAGE } from '@/data/mocks';
import { useFilters } from '@/lib/filter-context';
import {
  computeFilteredKpis,
  describeFilters,
  filterSchools,
  filterWaitlistEntries,
  formatNumber,
  isFilterActive,
  stageLabel,
} from '@/lib/filters';
import type { WaitlistEntry } from '@/domain/types';

const PIE_COLORS = ['#0F6B5C', '#1B2A4A', '#C47A11'];
const FOCUS_ALLOWED = ['over60'] as const;

function applyFocus(entries: readonly WaitlistEntry[], focus: string | null): WaitlistEntry[] {
  if (focus === 'over60') return entries.filter((e) => e.waitingDays > 60);
  return [...entries];
}

function WaitlistContent() {
  const { filters } = useFilters();
  const focus = useFocusParam(FOCUS_ALLOWED);
  const kpis = computeFilteredKpis(filters);
  const base = filterWaitlistEntries(WAITLIST, filters);
  const entries = applyFocus(base, focus);
  const over60 = base.filter((e) => e.waitingDays > 60).length;
  const over30 = base.filter((e) => e.waitingDays > 30).length;
  const avgWait = Math.round(
    base.reduce((sum, e) => sum + e.waitingDays, 0) / Math.max(base.length, 1),
  );

  const bySchool = filterSchools(SCHOOLS, filters)
    .map((s) => ({
      name: s.name.replace('EMEF ', '').replace('EMEI ', '').replace('Creche ', ''),
      count: WAITLIST.filter((w) => w.preferredSchoolId === s.id).length,
    }))
    .filter((row) => row.count > 0);

  const stageCounts = [
    { stage: 'Creche', count: base.filter((e) => e.stage === 'creche').length },
    { stage: 'Ed. Infantil', count: base.filter((e) => e.stage === 'infantil').length },
    { stage: 'Fundamental', count: base.filter((e) => e.stage === 'fundamental').length },
  ].filter((row) => row.count > 0);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-navy)] sm:text-3xl">
          Lista de Espera
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Demanda por vagas e tempo de espera na rede.
          {isFilterActive(filters) ? ` · ${describeFilters(filters)}` : ''}
        </p>
      </section>

      <FocusBanner allowed={FOCUS_ALLOWED} />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard index={0} label="Total aguardando" value={kpis.waitlist} accent="amber" />
        <KpiCard index={1} label="Tempo médio (dias)" value={avgWait || 0} accent="navy" />
        <KpiCard index={2} label="Acima de 30 dias (amostra)" value={over30} accent="amber" />
        <KpiCard index={3} label="Acima de 60 dias (amostra)" value={over60} accent="danger" />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Distribuição por etapa" subtitle="Amostra filtrada">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stageCounts.length ? stageCounts : [...WAITLIST_BY_STAGE]}
                dataKey="count"
                nameKey="stage"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {(stageCounts.length ? stageCounts : WAITLIST_BY_STAGE).map((entry, index) => (
                  <Cell key={entry.stage} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatNumber(Number(value)), 'Crianças']} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Demanda por escola (amostra)" subtitle="Preferência declarada">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bySchool}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e0ea" />
              <XAxis dataKey="name" tick={{ fill: '#5b6b7c', fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#5b6b7c', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0F6B5C" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <p className="text-sm text-[var(--color-text-secondary)]">
        Exibindo {entries.length} registro(s){focus === 'over60' ? ' com mais de 60 dias' : ''}.
      </p>

      <DataTable
        caption="Lista de espera"
        headers={['Criança', 'Etapa', 'Escola preferida', 'Bairro', 'Dias', 'Situação']}
      >
        {entries.map((entry) => {
          const school = SCHOOLS.find((s) => s.id === entry.preferredSchoolId);
          return (
            <tr key={entry.id} className="hover:bg-[var(--color-navy)]/[0.03]">
              <td className="px-4 py-3 font-medium text-[var(--color-navy)]">{entry.childName}</td>
              <td className="px-4 py-3">{stageLabel(entry.stage)}</td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)]">{school?.name}</td>
              <td className="px-4 py-3">{entry.neighborhood}</td>
              <td className="px-4 py-3">{entry.waitingDays}</td>
              <td className="px-4 py-3">
                <StatusBadge
                  tone={entry.waitingDays > 60 ? 'danger' : entry.waitingDays > 30 ? 'warning' : 'info'}
                >
                  {entry.waitingDays > 60 ? '> 60 dias' : entry.waitingDays > 30 ? '> 30 dias' : 'Recente'}
                </StatusBadge>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </div>
  );
}

export function WaitlistView() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">Carregando…</p>}>
      <WaitlistContent />
    </Suspense>
  );
}
