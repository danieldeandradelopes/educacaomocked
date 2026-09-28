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
import { SCHOOLS, STAFF, STAFF_BY_EMPLOYMENT } from '@/data/mocks';
import { useFilters } from '@/lib/filter-context';
import {
  computeFilteredKpis,
  describeFilters,
  filterSchools,
  filterStaffMembers,
  formatNumber,
  isFilterActive,
  shiftLabel,
} from '@/lib/filters';
import { EMPLOYMENT_TYPE_LABEL } from '@/lib/labels';
import type { StaffMember } from '@/domain/types';

const PIE_COLORS = ['#0F6B5C', '#1B2A4A', '#C47A11', '#5b6b7c'];
const FOCUS_ALLOWED = ['teachers', 'employees', 'ciop'] as const;

function applyFocus(staff: readonly StaffMember[], focus: string | null): StaffMember[] {
  if (focus === 'teachers') return staff.filter((s) => s.isTeacher);
  if (focus === 'employees') return staff.filter((s) => !s.isTeacher);
  if (focus === 'ciop') return staff.filter((s) => s.employmentType === 'ciop');
  return [...staff];
}

function StaffContent() {
  const { filters } = useFilters();
  const focus = useFocusParam(FOCUS_ALLOWED);
  const kpis = computeFilteredKpis(filters);
  const base = filterStaffMembers(STAFF, filters);
  const staff = applyFocus(base, focus);
  const teachers = base.filter((s) => s.isTeacher).length;
  const employees = base.filter((s) => !s.isTeacher).length;
  const ciop = base.filter((s) => s.employmentType === 'ciop').length;
  const effective = base.filter((s) => s.employmentType === 'effective').length;
  const contract = base.filter((s) => s.employmentType === 'contract').length;

  const bySchool = filterSchools(SCHOOLS, filters)
    .map((school) => ({
      name: school.name.replace('EMEF ', '').replace('EMEI ', '').replace('Creche ', ''),
      teachers: school.teachers,
      staff: school.staff,
    }))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-2xl font-semibold text-[var(--color-navy)] sm:text-3xl">
          Quadro de Pessoal
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Professores, funcionários e distribuição por vínculo — incluindo CIOP.
          {isFilterActive(filters) ? ` · ${describeFilters(filters)}` : ''}
        </p>
      </section>

      <FocusBanner allowed={FOCUS_ALLOWED} />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard index={0} label="Professores" value={kpis.teachers} accent="teal" />
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
          accent="amber"
        />
        <KpiCard index={4} label="CIOP" value={kpis.ciop} accent="teal" />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Distribuição por vínculo" subtitle="Quadro geral (324)">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[...STAFF_BY_EMPLOYMENT]}
                dataKey="count"
                nameKey="type"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {STAFF_BY_EMPLOYMENT.map((entry, index) => (
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
              <CartesianGrid strokeDasharray="3 3" stroke="#d7e0ea" />
              <XAxis dataKey="name" tick={{ fill: '#5b6b7c', fontSize: 11 }} />
              <YAxis tick={{ fill: '#5b6b7c', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="teachers" name="Professores" fill="#0F6B5C" radius={[6, 6, 0, 0]} />
              <Bar dataKey="staff" name="Funcionários" fill="#1B2A4A" radius={[6, 6, 0, 0]} />
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
        headers={['Nome', 'Escola', 'Função', 'Vínculo', 'Turno']}
      >
        {staff.map((member) => {
          const school = SCHOOLS.find((s) => s.id === member.schoolId);
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
