'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AttentionList } from '@/components/ui/AttentionList';
import { ChartCard, KpiCard, SectionHeader } from '@/components/ui/KpiCard';
import { ErrorBlock, LoadingBlock } from '@/components/ui/PageHeader';
import { useApiList } from '@/lib/use-api';
import { useFilters } from '@/lib/filter-context';
import {
  computeFilteredKpis,
  describeFilters,
  filterSchools,
  filterStaffMembers,
  filterWaitlistEntries,
  isFilterActive,
  matchesSchoolId,
  matchesShiftValue,
  matchesStageValue,
  shiftLabel,
  stageLabel,
} from '@/lib/filters';
import { CHART_THEME } from '@/lib/chart-theme';
import type {
  AttentionPoint,
  School,
  Shift,
  StaffMember,
  Stage,
  Student,
  WaitlistEntry,
} from '@/domain/types';

const CHART = {
  teal: CHART_THEME.primary,
  navy: CHART_THEME.navy,
  amber: CHART_THEME.warning,
  danger: CHART_THEME.danger,
  muted: CHART_THEME.muted,
  grid: CHART_THEME.grid,
} as const;

const STAGE_COLORS: Record<Stage, string> = {
  creche: CHART.amber,
  infantil: CHART.teal,
  fundamental: CHART.navy,
};

const SHIFT_COLORS: Record<Shift, string> = {
  manha: CHART.teal,
  tarde: CHART.navy,
  noite: CHART.muted,
  integral: CHART.amber,
};

interface MonthlyAttendance {
  month: string;
  rate: number;
}

interface ActiveSearchTrend {
  month: string;
  cases: number;
}

interface EnrollmentRow {
  id: string;
  schoolId: string;
  stage: Stage;
  shift: Shift;
  status: 'ativa' | 'transferida' | 'encerrada';
}

interface IntersectoralRow {
  id: string;
  schoolId: string;
  status: string;
}

interface DocumentRow {
  id: string;
  schoolId: string;
  status: string;
}

function countBy<T>(items: readonly T[], key: (item: T) => string) {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}

export function DashboardView() {
  const { filters } = useFilters();

  const schoolsReq = useApiList<School>('schools');
  const studentsReq = useApiList<Student>('students');
  const waitlistReq = useApiList<WaitlistEntry>('waitlist');
  const staffReq = useApiList<StaffMember>('staff');
  const enrollmentsReq = useApiList<EnrollmentRow>('enrollments');
  const attendanceReq = useApiList<MonthlyAttendance>('attendanceMonthly');
  const searchTrendReq = useApiList<ActiveSearchTrend>('activeSearchTrend');
  const attentionReq = useApiList<AttentionPoint>('attentionPoints');
  const intersectoralReq = useApiList<IntersectoralRow>('intersectoral');
  const documentsReq = useApiList<DocumentRow>('documents');

  const schools = schoolsReq.data ?? [];
  const waitlistCount = filterWaitlistEntries(waitlistReq.data ?? [], filters).length;
  const ciopCount = filterStaffMembers(staffReq.data ?? [], filters, schools).filter(
    (s) => s.employmentType === 'ciop',
  ).length;
  const kpis = useMemo(
    () => computeFilteredKpis(filters, { schools, waitlistCount, ciopCount }),
    [filters, schools, waitlistCount, ciopCount],
  );

  const loading =
    schoolsReq.loading ||
    studentsReq.loading ||
    waitlistReq.loading ||
    staffReq.loading ||
    enrollmentsReq.loading ||
    attendanceReq.loading ||
    searchTrendReq.loading ||
    attentionReq.loading;

  const error =
    schoolsReq.error ??
    studentsReq.error ??
    waitlistReq.error ??
    staffReq.error ??
    enrollmentsReq.error ??
    attendanceReq.error ??
    searchTrendReq.error ??
    attentionReq.error;

  const chartData = useMemo(() => {
    const schools = filterSchools(schoolsReq.data ?? [], filters);
    const students = (studentsReq.data ?? []).filter(
      (s) =>
        matchesSchoolId(s.schoolId, filters) &&
        matchesStageValue(s.stage, filters) &&
        matchesShiftValue(s.shift, filters),
    );
    const waitlist = filterWaitlistEntries(waitlistReq.data ?? [], filters);
    const staff = filterStaffMembers(staffReq.data ?? [], filters, schoolsReq.data ?? []);
    const enrollments = (enrollmentsReq.data ?? []).filter(
      (e) =>
        matchesSchoolId(e.schoolId, filters) &&
        matchesStageValue(e.stage, filters) &&
        matchesShiftValue(e.shift, filters),
    );
    const intersectoral = (intersectoralReq.data ?? []).filter((i) =>
      matchesSchoolId(i.schoolId, filters),
    );
    const documents = (documentsReq.data ?? []).filter((d) => matchesSchoolId(d.schoolId, filters));

    const studentsBySchool = [...schools]
      .sort((a, b) => b.students - a.students)
      .slice(0, 8)
      .map((s) => ({
        name: s.name.replace(/^EMEF |^EMEI |^Creche /i, '').slice(0, 14),
        fullName: s.name,
        students: s.students,
      }));

    const stageCounts = countBy(students, (s) => s.stage);
    const studentsByStage = (['creche', 'infantil', 'fundamental'] as const).map((stage) => ({
      name: stageLabel(stage),
      stage,
      value: stageCounts.get(stage) ?? 0,
      fill: STAGE_COLORS[stage],
    }));

    const shiftCounts = countBy(students, (s) => s.shift);
    const studentsByShift = (['manha', 'tarde', 'noite', 'integral'] as const).map((shift) => ({
      name: shiftLabel(shift),
      value: shiftCounts.get(shift) ?? 0,
      fill: SHIFT_COLORS[shift],
    }));

    const waitlistByStage = (['creche', 'infantil', 'fundamental'] as const).map((stage) => ({
      name: stageLabel(stage),
      value: waitlist.filter((w) => w.stage === stage).length,
      fill: STAGE_COLORS[stage],
    }));

    const waitlistAging = [
      {
        name: 'Até 30 dias',
        value: waitlist.filter((w) => w.waitingDays <= 30).length,
        fill: CHART.teal,
      },
      {
        name: '31–60',
        value: waitlist.filter((w) => w.waitingDays > 30 && w.waitingDays <= 60).length,
        fill: CHART.amber,
      },
      {
        name: 'Mais de 60',
        value: waitlist.filter((w) => w.waitingDays > 60).length,
        fill: CHART.danger,
      },
    ];

    const enrollmentStatus = [
      {
        name: 'Ativas',
        value: enrollments.filter((e) => e.status === 'ativa').length,
        fill: CHART.teal,
      },
      {
        name: 'Transferidas',
        value: enrollments.filter((e) => e.status === 'transferida').length,
        fill: CHART.amber,
      },
      {
        name: 'Encerradas',
        value: enrollments.filter((e) => e.status === 'encerrada').length,
        fill: CHART.navy,
      },
    ];

    const staffMix = [
      {
        name: 'Professores',
        value: staff.filter((s) => s.isTeacher).length,
        fill: CHART.teal,
      },
      {
        name: 'Funcionários',
        value: staff.filter((s) => !s.isTeacher && s.employmentType !== 'ciop').length,
        fill: CHART.navy,
      },
      {
        name: 'CIOP',
        value: staff.filter((s) => s.employmentType === 'ciop').length,
        fill: CHART.amber,
      },
    ];

    const avgAttendance =
      schools.length > 0
        ? schools.reduce((sum, s) => sum + s.attendanceRate, 0) / schools.length
        : 0;

    const lowAttendance = students.filter((s) => s.attendanceRate < 75).length;
    const docsPending = students.filter((s) => s.documentsPending).length || documents.filter((d) => d.status === 'pendente').length;
    const waitOver60 = waitlist.filter((w) => w.waitingDays > 60).length;
    const intersectoralPending = intersectoral.filter(
      (i) => i.status === 'pendente' || i.status === 'aguardando_retorno',
    ).length;
    const inActiveSearch = students.filter((s) => s.inActiveSearch).length;
    const inTutoring = students.filter((s) => s.inTutoring).length;
    const inInclusive = students.filter((s) => s.inInclusive).length;
    const transported = students.filter((s) => s.transported).length;

    const programCoverage = [
      { name: 'Busca ativa', value: inActiveSearch, fill: CHART.danger },
      { name: 'Reforço', value: inTutoring, fill: CHART.teal },
      { name: 'Inclusão', value: inInclusive, fill: CHART.navy },
      { name: 'Transporte', value: transported, fill: CHART.amber },
    ];

    let searchTrend = searchTrendReq.data ?? [];
    if (filters.year !== 2026) {
      searchTrend = searchTrend.map((p) => ({
        ...p,
        cases: Math.max(0, Math.round(p.cases * 0.96)),
      }));
    }

    let attendance = attendanceReq.data ?? [];
    if (filters.schoolIds.length === 1 && schools[0]) {
      const delta = schools[0].attendanceRate - 94;
      attendance = attendance.map((p) => ({
        ...p,
        rate: Number((p.rate + delta * 0.15).toFixed(1)),
      }));
    }

    return {
      studentsBySchool,
      studentsByStage,
      studentsByShift,
      waitlistByStage,
      waitlistAging,
      enrollmentStatus,
      staffMix,
      programCoverage,
      searchTrend,
      attendance,
      avgAttendance,
      lowAttendance,
      docsPending,
      waitOver60,
      intersectoralPending,
      sampleStudents: students.length,
    };
  }, [
    schoolsReq.data,
    studentsReq.data,
    waitlistReq.data,
    staffReq.data,
    enrollmentsReq.data,
    attendanceReq.data,
    searchTrendReq.data,
    intersectoralReq.data,
    documentsReq.data,
    filters,
  ]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-navy)] sm:text-3xl">
          Visão geral da rede
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Indicadores, alertas e distribuição da educação municipal — números fictícios para
          validação com a Dirigente.
          {isFilterActive(filters) ? (
            <>
              {' '}
              <span className="font-semibold text-[var(--color-primary)]">
                Filtro: {describeFilters(filters, schools)}
              </span>
            </>
          ) : null}
        </p>
      </section>

      <section>
        <SectionHeader
          title="Rede e pessoal"
          description="Dimensão da rede municipal e composição do quadro"
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard
            index={0}
            label="Alunos"
            value={kpis.students}
            delta={kpis.studentsDelta}
            hint="matrículas ativas"
            accent="navy"
            size="lg"
          />
          <KpiCard
            index={1}
            label="Escolas"
            value={kpis.schools}
            hint="ativas"
            href="/schools"
            accent="navy"
          />
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
            label="Funcionários CIOP"
            value={kpis.ciop}
            hint="vínculo de pessoal"
            href="/staff?focus=ciop"
            accent="navy"
            size="lg"
          />
        </div>
      </section>

      <section>
        <SectionHeader
          title="Programas e operação"
          description="Acompanhamentos e serviços da rede"
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <KpiCard
            index={5}
            label="Busca Ativa"
            value={kpis.activeSearch}
            hint="em acompanhamento"
            href="/active-search?focus=attendance"
            accent="danger"
            size="lg"
          />
          <KpiCard
            index={6}
            label="Lista de Espera"
            value={kpis.waitlist}
            hint="aguardando vaga"
            href="/waitlist"
            accent="amber"
            size="lg"
          />
          <KpiCard
            index={7}
            label="Reforço Escolar"
            value={kpis.tutoring}
            hint="em acompanhamento"
            href="/tutoring"
            accent="navy"
          />
          <KpiCard
            index={8}
            label="Transporte Escolar"
            value={kpis.transport}
            hint="ver rotas e alunos"
            href="/transport"
            accent="navy"
          />
          <KpiCard
            index={9}
            label="Educação Inclusiva"
            value={kpis.inclusive}
            hint="acompanhamentos"
            href="/inclusive"
            accent="navy"
          />
        </div>
      </section>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}

      {!loading && !error && (
        <>
          <section>
            <SectionHeader
              title="Pontos de atenção"
              description="Indicadores que pedem acompanhamento imediato"
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <KpiCard
                index={0}
                label="Frequência média"
                value={Number(chartData.avgAttendance.toFixed(1))}
                hint="rede filtrada (%)"
                href="/attendance"
                accent="navy"
                size="lg"
              />
              <KpiCard
                index={1}
                label="Baixa frequência"
                value={chartData.lowAttendance}
                hint="amostra abaixo de 75%"
                href="/active-search?focus=attendance"
                accent="danger"
              />
              <KpiCard
                index={2}
                label="Espera longa"
                value={chartData.waitOver60}
                hint="mais de 60 dias"
                href="/waitlist?focus=long"
                accent="amber"
              />
              <KpiCard
                index={3}
                label="Docs pendentes"
                value={chartData.docsPending}
                hint="alunos / documentos"
                href="/documents?focus=pending"
                accent="amber"
              />
              <KpiCard
                index={4}
                label="Encaminhamentos"
                value={chartData.intersectoralPending}
                hint="aguardando retorno"
                href="/intersectoral"
                accent="navy"
              />
            </div>
          </section>

          <AttentionList items={attentionReq.data ?? []} />

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard title="Frequência da rede" subtitle="Evolução mensal (%)">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.attendance}>
                  <defs>
                    <linearGradient id="freqFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.teal} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={CHART.teal} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                  <XAxis dataKey="month" tick={{ fill: CHART.muted, fontSize: 12 }} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: CHART.muted, fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [
                      `${Number(value).toFixed(1).replace('.', ',')}%`,
                      'Frequência',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke={CHART.teal}
                    fill="url(#freqFill)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Busca ativa" subtitle="Casos em acompanhamento por mês">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.searchTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                  <XAxis dataKey="month" tick={{ fill: CHART.muted, fontSize: 12 }} />
                  <YAxis tick={{ fill: CHART.muted, fontSize: 12 }} />
                  <Tooltip formatter={(value) => [Number(value).toLocaleString('pt-BR'), 'Casos']} />
                  <Line
                    type="monotone"
                    dataKey="cases"
                    stroke={CHART.danger}
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: CHART.danger }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Alunos por escola" subtitle="Maiores matrículas da rede filtrada">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.studentsBySchool} margin={{ bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                  <XAxis dataKey="name" tick={{ fill: CHART.muted, fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fill: CHART.muted, fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(_, payload) =>
                      String(payload?.[0]?.payload?.fullName ?? '')
                    }
                    formatter={(value) => [Number(value).toLocaleString('pt-BR'), 'Alunos']}
                  />
                  <Bar dataKey="students" fill={CHART.navy} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Cobertura de programas" subtitle={`Amostra de ${chartData.sampleStudents} alunos`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.programCoverage} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                  <XAxis type="number" tick={{ fill: CHART.muted, fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={88}
                    tick={{ fill: CHART.muted, fontSize: 12 }}
                  />
                  <Tooltip formatter={(value) => [Number(value).toLocaleString('pt-BR'), 'Alunos']} />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                    {chartData.programCoverage.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Alunos por etapa" subtitle="Distribuição da amostra filtrada">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.studentsByStage}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {chartData.studentsByStage.map((entry) => (
                      <Cell key={entry.stage} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [Number(value).toLocaleString('pt-BR'), 'Alunos']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Alunos por turno" subtitle="Manhã, tarde, noite e integral">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.studentsByShift}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                  <XAxis dataKey="name" tick={{ fill: CHART.muted, fontSize: 12 }} />
                  <YAxis tick={{ fill: CHART.muted, fontSize: 12 }} />
                  <Tooltip formatter={(value) => [Number(value).toLocaleString('pt-BR'), 'Alunos']} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.studentsByShift.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Lista de espera por etapa" subtitle="Crianças aguardando vaga">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.waitlistByStage}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={88}
                    paddingAngle={3}
                  >
                    {chartData.waitlistByStage.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [Number(value).toLocaleString('pt-BR'), 'Crianças']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Tempo na lista de espera" subtitle="Faixas de dias aguardando">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.waitlistAging}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                  <XAxis dataKey="name" tick={{ fill: CHART.muted, fontSize: 12 }} />
                  <YAxis tick={{ fill: CHART.muted, fontSize: 12 }} />
                  <Tooltip formatter={(value) => [Number(value).toLocaleString('pt-BR'), 'Crianças']} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.waitlistAging.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Situação das matrículas" subtitle="Ativas, transferidas e encerradas">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.enrollmentStatus}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={88}
                    paddingAngle={3}
                  >
                    {chartData.enrollmentStatus.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [Number(value).toLocaleString('pt-BR'), 'Matrículas']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Composição do quadro" subtitle="Professores, funcionários e CIOP (amostra)">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.staffMix}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                  <XAxis dataKey="name" tick={{ fill: CHART.muted, fontSize: 12 }} />
                  <YAxis tick={{ fill: CHART.muted, fontSize: 12 }} />
                  <Tooltip formatter={(value) => [Number(value).toLocaleString('pt-BR'), 'Pessoas']} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.staffMix.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
