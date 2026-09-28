'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AttentionList } from '@/components/ui/AttentionList';
import { ChartCard, KpiCard } from '@/components/ui/KpiCard';
import { ATTENDANCE_TREND, ATTENTION_POINTS } from '@/data/mocks';
import { useFilters } from '@/lib/filter-context';
import { computeFilteredKpis, describeFilters, isFilterActive } from '@/lib/filters';

export function DashboardView() {
  const { filters } = useFilters();
  const kpis = computeFilteredKpis(filters);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-navy)] sm:text-3xl">
          Visão geral da rede
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--color-text-secondary)]">
          Principais indicadores da educação municipal em um só lugar — números fictícios para
          validação com a Dirigente.
          {isFilterActive(filters) ? (
            <>
              {' '}
              <span className="font-semibold text-[var(--color-primary)]">
                Filtro: {describeFilters(filters)}
              </span>
            </>
          ) : null}
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          index={0}
          label="Alunos"
          value={kpis.students}
          delta={kpis.studentsDelta}
          hint="matrículas ativas"
          accent="teal"
        />
        <KpiCard index={1} label="Escolas" value={kpis.schools} hint="ativas" href="/schools" accent="navy" />
        <KpiCard
          index={2}
          label="Professores"
          value={kpis.teachers}
          hint="ativos"
          href="/staff?focus=teachers"
          accent="navy"
        />
        <KpiCard
          index={3}
          label="Funcionários"
          value={kpis.staff}
          hint="ativos"
          href="/staff?focus=employees"
          accent="navy"
        />
        <KpiCard
          index={4}
          label="CIOP"
          value={kpis.ciop}
          hint="vínculo de pessoal"
          href="/staff?focus=ciop"
          accent="teal"
        />
        <KpiCard
          index={5}
          label="Busca Ativa"
          value={kpis.activeSearch}
          hint="em acompanhamento"
          href="/active-search?focus=attendance"
          accent="danger"
        />
        <KpiCard
          index={6}
          label="Lista de Espera"
          value={kpis.waitlist}
          hint="aguardando vaga"
          href="/waitlist"
          accent="amber"
        />
        <KpiCard
          index={7}
          label="Reforço Escolar"
          value={kpis.tutoring}
          hint="detalhe em breve"
          accent="teal"
        />
        <KpiCard
          index={8}
          label="Transporte"
          value={kpis.transport}
          hint="ver por escola"
          href="/schools?focus=transport"
          accent="navy"
        />
        <KpiCard
          index={9}
          label="Educação Inclusiva"
          value={kpis.inclusive}
          hint="ver por escola"
          href="/schools?focus=inclusive"
          accent="teal"
        />
      </section>

      <AttentionList items={ATTENTION_POINTS} />

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Frequência da rede" subtitle="Evolução mensal (%)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[...ATTENDANCE_TREND]}>
              <defs>
                <linearGradient id="freqFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F6B5C" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0F6B5C" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e0ea" />
              <XAxis dataKey="month" tick={{ fill: '#5b6b7c', fontSize: 12 }} />
              <YAxis domain={[90, 96]} tick={{ fill: '#5b6b7c', fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [`${Number(value).toFixed(1).replace('.', ',')}%`, 'Frequência']}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="#0F6B5C"
                fill="url(#freqFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Alunos por escola (amostra)" subtitle="Maiores matrículas da rede">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: 'João XXIII', students: 684 },
                { name: 'Maria Silva', students: 592 },
                { name: 'Paulo Freire', students: 541 },
                { name: 'Jardim Brasil', students: 498 },
                { name: 'Castro Alves', students: 476 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e0ea" />
              <XAxis dataKey="name" tick={{ fill: '#5b6b7c', fontSize: 11 }} />
              <YAxis tick={{ fill: '#5b6b7c', fontSize: 12 }} />
              <Tooltip formatter={(value) => [Number(value).toLocaleString('pt-BR'), 'Alunos']} />
              <Bar dataKey="students" fill="#1B2A4A" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
