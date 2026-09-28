import type {
  ActiveSearchCase,
  GlobalFilters,
  School,
  Shift,
  Stage,
  StaffMember,
  WaitlistEntry,
} from '@/domain/types';
import { NETWORK_KPIS, SCHOOLS } from '@/data/mocks';

export const DEFAULT_FILTERS: GlobalFilters = {
  year: 2026,
  periodStart: '2026-01-01',
  periodEnd: '2026-09-30',
  schoolId: 'all',
  stage: 'all',
  shift: 'all',
};

/** Mock share of network metrics by shift when no row-level shift exists. */
const SHIFT_SHARE: Record<Shift, number> = {
  manha: 0.42,
  tarde: 0.33,
  noite: 0.05,
  integral: 0.2,
};

/** Prior-year mock factor when year !== 2026. */
const PRIOR_YEAR_FACTOR = 0.96;

export function filterSchools(
  schools: readonly School[],
  filters: GlobalFilters,
): School[] {
  return schools.filter((school) => {
    if (filters.schoolId !== 'all' && school.id !== filters.schoolId) {
      return false;
    }
    if (filters.stage !== 'all' && school.stage !== filters.stage) {
      return false;
    }
    return true;
  });
}

export function filterStaffMembers(
  staff: readonly StaffMember[],
  filters: GlobalFilters,
): StaffMember[] {
  const schoolIds = new Set(filterSchools(SCHOOLS, filters).map((s) => s.id));
  return staff.filter((member) => {
    if (!schoolIds.has(member.schoolId)) return false;
    if (filters.shift !== 'all' && member.shift !== filters.shift) return false;
    return true;
  });
}

export function filterWaitlistEntries(
  entries: readonly WaitlistEntry[],
  filters: GlobalFilters,
): WaitlistEntry[] {
  const schoolIds = new Set(filterSchools(SCHOOLS, filters).map((s) => s.id));
  return entries.filter((entry) => {
    if (!schoolIds.has(entry.preferredSchoolId)) return false;
    if (filters.stage !== 'all' && entry.stage !== filters.stage) return false;
    return true;
  });
}

export function filterActiveSearchCases(
  cases: readonly ActiveSearchCase[],
  filters: GlobalFilters,
): ActiveSearchCase[] {
  const schoolIds = new Set(filterSchools(SCHOOLS, filters).map((s) => s.id));
  return cases.filter((item) => schoolIds.has(item.schoolId));
}

export function applyYearFactor(value: number, year: number): number {
  if (year === 2026) return value;
  return Math.max(0, Math.round(value * PRIOR_YEAR_FACTOR));
}

export function applyShiftFactor(value: number, shift: Shift | 'all'): number {
  if (shift === 'all') return value;
  return Math.max(0, Math.round(value * SHIFT_SHARE[shift]));
}

function sumField(schools: readonly School[], field: keyof School): number {
  return schools.reduce((sum, school) => {
    const value = school[field];
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);
}

export function computeFilteredKpis(filters: GlobalFilters) {
  const filtered = filterSchools(SCHOOLS, filters);
  const empty = filtered.length === 0;

  if (empty) {
    return {
      students: 0,
      schools: 0,
      teachers: 0,
      staff: 0,
      ciop: 0,
      activeSearch: 0,
      waitlist: 0,
      tutoring: 0,
      transport: 0,
      inclusive: 0,
      studentsDelta: 0,
    };
  }

  const allSchools = filters.schoolId === 'all' && filters.stage === 'all';
  const ratio =
    allSchools
      ? 1
      : sumField(filtered, 'students') / Math.max(sumField(SCHOOLS, 'students'), 1);

  const base = allSchools
    ? { ...NETWORK_KPIS, schools: filtered.length }
    : {
        students: sumField(filtered, 'students'),
        schools: filtered.length,
        teachers: sumField(filtered, 'teachers'),
        staff: sumField(filtered, 'staff'),
        ciop: Math.round(NETWORK_KPIS.ciop * ratio),
        activeSearch: sumField(filtered, 'activeSearch'),
        waitlist: Math.round(NETWORK_KPIS.waitlist * ratio),
        tutoring: sumField(filtered, 'tutoring'),
        transport: sumField(filtered, 'transported'),
        inclusive: sumField(filtered, 'inclusive'),
        studentsDelta: NETWORK_KPIS.studentsDelta,
      };

  return {
    students: applyYearFactor(applyShiftFactor(base.students, filters.shift), filters.year),
    schools: base.schools,
    teachers: applyYearFactor(applyShiftFactor(base.teachers, filters.shift), filters.year),
    staff: applyYearFactor(applyShiftFactor(base.staff, filters.shift), filters.year),
    ciop: applyYearFactor(applyShiftFactor(base.ciop, filters.shift), filters.year),
    activeSearch: applyYearFactor(
      applyShiftFactor(base.activeSearch, filters.shift),
      filters.year,
    ),
    waitlist: applyYearFactor(base.waitlist, filters.year),
    tutoring: applyYearFactor(applyShiftFactor(base.tutoring, filters.shift), filters.year),
    transport: applyYearFactor(applyShiftFactor(base.transport, filters.shift), filters.year),
    inclusive: applyYearFactor(applyShiftFactor(base.inclusive, filters.shift), filters.year),
    studentsDelta: filters.year === 2026 ? base.studentsDelta : Number((base.studentsDelta - 0.8).toFixed(1)),
  };
}

export function isFilterActive(filters: GlobalFilters): boolean {
  return (
    filters.schoolId !== 'all' ||
    filters.stage !== 'all' ||
    filters.shift !== 'all' ||
    filters.year !== 2026
  );
}

export function describeFilters(filters: GlobalFilters): string {
  const parts: string[] = [];
  if (filters.year !== 2026) parts.push(`Ano ${filters.year}`);
  if (filters.schoolId !== 'all') {
    const school = SCHOOLS.find((s) => s.id === filters.schoolId);
    parts.push(school?.name ?? 'Escola');
  }
  if (filters.stage !== 'all') parts.push(stageLabel(filters.stage));
  if (filters.shift !== 'all') parts.push(shiftLabel(filters.shift));
  return parts.length ? parts.join(' · ') : 'Rede completa';
}

export function stageLabel(stage: Stage | 'all'): string {
  switch (stage) {
    case 'creche':
      return 'Creche';
    case 'infantil':
      return 'Ed. Infantil';
    case 'fundamental':
      return 'Fundamental';
    default:
      return 'Todas';
  }
}

export function shiftLabel(shift: Shift | 'all'): string {
  switch (shift) {
    case 'manha':
      return 'Manhã';
    case 'tarde':
      return 'Tarde';
    case 'noite':
      return 'Noite';
    case 'integral':
      return 'Integral';
    default:
      return 'Todos';
  }
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits).replace('.', ',')}%`;
}
