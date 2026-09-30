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
import { ChartCard, KpiCard } from '@/components/ui/KpiCard';
import { DataTable } from '@/components/ui/DataTable';
import { FocusBanner, useFocusParam } from '@/components/ui/FocusBanner';
import { ErrorBlock, LoadingBlock } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { usePagination } from '@/hooks/usePagination';
import { useSortable } from '@/hooks/useSortable';
import { useApiList } from '@/lib/use-api';
import { useFilters } from '@/lib/filter-context';
import {
  computeFilteredKpis,
  describeFilters,
  filterSchools,
  filterStaffMembers,
  filtersResetKey,
  formatNumber,
  isFilterActive,
  shiftLabel,
} from '@/lib/filters';
import { EMPLOYMENT_TYPE_LABEL } from '@/lib/labels';
import { CHART_SERIES, CHART_THEME } from '@/lib/chart-theme';
import type { School, StaffMember } from '@/domain/types';

const PIE_COLORS = [...CHART_SERIES];
const FOCUS_ALLOWED = ['teachers', 'employees', 'ciop'] as const;

function applyFocus(staff: readonly StaffMember[], focus: string | null): StaffMember[] {
  if (focus === 'teachers') return staff.filter((s) => s.isTeacher);
  if (focus === 'employees') return staff.filter((s) => !s.isTeacher);
  if (focus === 'ciop') return staff.filter((s) => s.employmentType === 'ciop');
  return [...staff];
}

function StaffContent() {
  const staffReq = useApiList<StaffMember>('staff');
  const schoolsReq = useApiList<School>('schools');
  const { filters } = useFilters();
  const focus = useFocusParam(FOCUS_ALLOWED);
  const schools = schoolsReq.data ?? [];
  const base = filterStaffMembers(staffReq.data ?? [], filters, schools);
  const ciopCount = base.filter((s) => s.employmentType === 'ciop').length;
  const kpis = useMemo(
    () => computeFilteredKpis(filters, { schools, ciopCount }),
    [filters, schools, ciopCount],
  );
  const staff = applyFocus(base, focus);
  const teachers = base.filter((s) => s.isTeacher).length;
  const employees = base.filter((s) => !s.isTeacher).length;
  const ciop = ciopCount;
  const effective = base.filter((s) => s.employmentType === 'effective').length;
  const contract = base.filter((s) => s.employmentType === 'contract').length;
  const schoolName = (id: string) => schools.find((s) => s.id === id)?.name ?? id;
  const sortAccessors = useMemo(
    () => ({
      name: (m: StaffMember) => m.name,
      school: (m: StaffMember) => schoolName(m.schoolId),
      role: (m: StaffMember) => m.role,
      employment: (m: StaffMember) => EMPLOYMENT_TYPE_LABEL[m.employmentType],
      shift: (m: StaffMember) => shiftLabel(m.shift),
    }),
    [schools],
  );
  const resetKey = `${filtersResetKey(filters)}|${focus ?? ''}`;
  const sorted = useSortable(staff, sortAccessors, { resetKey });
  const pagination = usePagination(sorted.items, {
    resetKey: `${resetKey}|${sorted.sortKey}|${sorted.sortDir}`,
  });

  const employmentPie = useMemo(() => {
    let effectiveN = 0;
    let contractN = 0;
    let ciopN = 0;
    let otherN = 0;
    for (const member of base) {
      if (member.employmentType === 'effective') effectiveN += 1;
      else if (member.employmentType === 'contract') contractN += 1;
      else if (member.employmentType === 'ciop') ciopN += 1;
      else otherN += 1;
    }
    return [
      { type: 'Efetivos', count: effectiveN },
      { type: 'Contratados', count: contractN },
      { type: 'CIOP', count: ciopN },
      { type: 'Outros', count: otherN },
    ].filter((row) => row.count > 0);
  }, [base]);

  const bySchool = filterSchools(schools, filters)
    .map((school) => ({
      name: school.name.replace('EMEF ', '').replace('EMEI ', '').replace('Creche ', ''),
      teachers: school.teachers,
      staff: school.staff,
    }))
    .slice(0, 6);

  const loading = staffReq.loading || schoolsReq.loading;
  const error = staffReq.error ?? schoolsReq.error;

  if (loading) {
    return <LoadingBlock />;
  }
  if (error) {
    return <ErrorBlock message={error} />;
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-navy)] sm:text-3xl">
          Quadro de Pessoal
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Professores, funcionários e distribuição por vínculo — incluindo CIOP.
          {isFilterActive(filters) ? ` · ${describeFilters(filters, schools)}` : ''}
        </p>
      </section>

      <FocusBanner allowed={FOCUS_ALLOWED} />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard index={0} label="Professores" value={kpis.teachers} accent="navy" />
        <KpiCard index={1} label="Funcionários" value={kpis.staff} accent="navy" />
        <KpiCard
          index={2}
          label="Efetivos (amostra)"
          value={effective}
          accent="navy"
        />
        <KpiCard
          index={3}
          label="Contratados (amostra)"
          value={contract}
          accent="navy"
        />
        <KpiCard index={4} label="Funcionários CIOP" value={kpis.ciop} accent="navy" size="lg" />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Distribuição por vínculo"
          subtitle={`Quadro filtrado (${base.length})`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={employmentPie}
                dataKey="count"
                nameKey="type"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {employmentPie.map((entry, index) => (
                  <Cell key={entry.type} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatNumber(Number(value)), 'Pessoas']} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Por escola (amostra)" subtitle="Professores × funcionários">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bySchool}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
              <XAxis dataKey="name" tick={{ fill: CHART_THEME.muted, fontSize: 11 }} />
              <YAxis tick={{ fill: CHART_THEME.muted, fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="teachers" name="Professores" fill={CHART_THEME.primary} radius={[6, 6, 0, 0]} />
              <Bar dataKey="staff" name="Funcionários" fill={CHART_THEME.navy} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <p className="text-sm text-[var(--color-text-secondary)]">
        Tabela: {staff.length} registro(s)
        {focus === 'teachers'
          ? ' · apenas professores'
          : focus === 'employees'
            ? ' · apenas funcionários'
            : focus === 'ciop'
              ? ' · apenas CIOP'
              : ` · amostra com ${teachers} professores, ${employees} funcionários, ${ciop} CIOP`}
      </p>

      <DataTable
        caption="Quadro de pessoal"
        columns={[
          { id: 'name', label: 'Nome' },
          { id: 'school', label: 'Escola' },
          { id: 'role', label: 'Função' },
          { id: 'employment', label: 'Vínculo' },
          { id: 'shift', label: 'Turno' },
        ]}
        sort={sorted}
        pagination={pagination}
      >
        {pagination.pageItems.map((member) => {
          const school = schools.find((s) => s.id === member.schoolId);
          return (
            <tr key={member.id} className="hover:bg-[var(--color-navy)]/[0.03]">
              <td className="px-4 py-3 font-medium text-[var(--color-navy)]">{member.name}</td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)]">{school?.name}</td>
              <td className="px-4 py-3">{member.role}</td>
              <td className="px-4 py-3">
                <StatusBadge tone={member.employmentType === 'ciop' ? 'warning' : 'neutral'}>
                  {EMPLOYMENT_TYPE_LABEL[member.employmentType]}
                </StatusBadge>
              </td>
              <td className="px-4 py-3">{shiftLabel(member.shift)}</td>
            </tr>
          );
        })}
      </DataTable>
    </div>
  );
}

export function StaffView() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--color-muted)]">Carregando…</p>}>
      <StaffContent />
    </Suspense>
  );
}
