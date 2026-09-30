import type {
  ActiveSearchCase,
  GlobalFilters,
  School,
  Shift,
  Stage,
  StaffMember,
  WaitlistEntry,
} from '@/domain/types';

export function toggleInList<T extends string>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export const DEFAULT_FILTERS: GlobalFilters = {
  year: 2026,
  periodStart: '2026-01-01',
  periodEnd: '2026-09-30',
  schoolIds: [],
  stages: [],
  shifts: [],
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

const EMPTY_KPIS = {
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
} as const;

export function matchesSchoolId(schoolId: string, filters: GlobalFilters): boolean {
  return filters.schoolIds.length === 0 || filters.schoolIds.includes(schoolId);
}

export function matchesStageValue(stage: Stage, filters: GlobalFilters): boolean {
  return filters.stages.length === 0 || filters.stages.includes(stage);
}

export function matchesShiftValue(shift: Shift, filters: GlobalFilters): boolean {
  return filters.shifts.length === 0 || filters.shifts.includes(shift);
}

export function schoolMatchesFilters(school: School, filters: GlobalFilters): boolean {
  if (!matchesSchoolId(school.id, filters)) return false;
  if (filters.stages.length === 0) return true;
  return filters.stages.some((stage) => schoolOffersStage(school, stage));
}

/** Preferred school for create forms when one or more are selected. */
export function preferredSchoolId(filters: GlobalFilters, fallback?: string): string | undefined {
  return filters.schoolIds[0] ?? fallback;
}

export function filterSchools(schools: readonly School[], filters: GlobalFilters): School[] {
  return schools.filter((school) => schoolMatchesFilters(school, filters));
}

export function filterStaffMembers(
  staff: readonly StaffMember[],
  filters: GlobalFilters,
  schools: readonly School[] = [],
): StaffMember[] {
  return staff.filter((member) => {
    if (!matchesSchoolId(member.schoolId, filters)) return false;
    if (!matchesShiftValue(member.shift, filters)) return false;
    if (filters.stages.length > 0 && schools.length > 0) {
      const school = schools.find((s) => s.id === member.schoolId);
      if (school && !filters.stages.some((stage) => schoolOffersStage(school, stage))) return false;
    }
    return true;
  });
}

export function filterWaitlistEntries(
  entries: readonly WaitlistEntry[],
  filters: GlobalFilters,
): WaitlistEntry[] {
  return entries.filter((entry) => {
    if (!matchesSchoolId(entry.preferredSchoolId, filters)) return false;
    if (!matchesStageValue(entry.stage, filters)) return false;
    return true;
  });
}

export function filterActiveSearchCases(
  cases: readonly ActiveSearchCase[],
  filters: GlobalFilters,
  schools: readonly School[] = [],
): ActiveSearchCase[] {
  return cases.filter((item) => {
    if (!matchesSchoolId(item.schoolId, filters)) return false;
    if (filters.stages.length > 0 && schools.length > 0) {
      const school = schools.find((s) => s.id === item.schoolId);
      if (school && !filters.stages.some((stage) => schoolOffersStage(school, stage))) return false;
    }
    return true;
  });
}

export function applyYearFactor(value: number, year: number): number {
  if (year === 2026) return value;
  return Math.max(0, Math.round(value * PRIOR_YEAR_FACTOR));
}

/** Empty shifts = no reduction; multiple shifts sum their shares (capped at 1). */
export function applyShiftFactor(value: number, shifts: readonly Shift[]): number {
  if (shifts.length === 0) return value;
  const share = Math.min(
    1,
    shifts.reduce((sum, shift) => sum + SHIFT_SHARE[shift], 0),
  );
  return Math.max(0, Math.round(value * share));
}

function sumField(schools: readonly School[], field: keyof School): number {
  return schools.reduce((sum, school) => {
    const value = school[field];
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);
}

export interface KpiInput {
  schools: readonly School[];
  waitlistCount?: number;
  ciopCount?: number;
  studentsDelta?: number;
}

export function computeFilteredKpis(filters: GlobalFilters, input: KpiInput) {
  const filtered = filterSchools(input.schools, filters);
  if (filtered.length === 0) {
    return { ...EMPTY_KPIS };
  }

  const studentsDelta = input.studentsDelta ?? 3.2;
  const ciop =
    typeof input.ciopCount === 'number'
      ? input.ciopCount
      : Math.round(sumField(filtered, 'staff') * 0.16);
  const waitlist =
    typeof input.waitlistCount === 'number'
      ? input.waitlistCount
      : Math.round(sumField(filtered, 'students') * 0.034);

  const base = {
    students: sumField(filtered, 'students'),
    schools: filtered.length,
    teachers: sumField(filtered, 'teachers'),
    staff: sumField(filtered, 'staff'),
    ciop,
    activeSearch: sumField(filtered, 'activeSearch'),
    waitlist,
    tutoring: sumField(filtered, 'tutoring'),
    transport: sumField(filtered, 'transported'),
    inclusive: sumField(filtered, 'inclusive'),
    studentsDelta,
  };

  return {
    students: applyYearFactor(applyShiftFactor(base.students, filters.shifts), filters.year),
    schools: base.schools,
    teachers: applyYearFactor(applyShiftFactor(base.teachers, filters.shifts), filters.year),
    staff: applyYearFactor(applyShiftFactor(base.staff, filters.shifts), filters.year),
    ciop: applyYearFactor(applyShiftFactor(base.ciop, filters.shifts), filters.year),
    activeSearch: applyYearFactor(
      applyShiftFactor(base.activeSearch, filters.shifts),
      filters.year,
    ),
    waitlist: applyYearFactor(base.waitlist, filters.year),
    tutoring: applyYearFactor(applyShiftFactor(base.tutoring, filters.shifts), filters.year),
    transport: applyYearFactor(applyShiftFactor(base.transport, filters.shifts), filters.year),
    inclusive: applyYearFactor(applyShiftFactor(base.inclusive, filters.shifts), filters.year),
    studentsDelta:
      filters.year === 2026 ? base.studentsDelta : Number((base.studentsDelta - 0.8).toFixed(1)),
  };
}

export function isFilterActive(filters: GlobalFilters): boolean {
  return (
    filters.schoolIds.length > 0 ||
    filters.stages.length > 0 ||
    filters.shifts.length > 0 ||
    filters.year !== 2026
  );
}

export function describeFilters(
  filters: GlobalFilters,
  schools: readonly School[] = [],
): string {
  const parts: string[] = [];
  if (filters.year !== 2026) parts.push(`Ano ${filters.year}`);
  if (filters.schoolIds.length === 1) {
    parts.push(schools.find((s) => s.id === filters.schoolIds[0])?.name ?? '1 escola');
  } else if (filters.schoolIds.length > 1) {
    parts.push(`${filters.schoolIds.length} escolas`);
  }
  if (filters.stages.length) parts.push(filters.stages.map((s) => stageLabel(s)).join(' + '));
  if (filters.shifts.length) parts.push(filters.shifts.map((s) => shiftLabel(s)).join(' + '));
  return parts.length ? parts.join(' · ') : 'Rede completa';
}

export function filtersResetKey(filters: GlobalFilters): string {
  return [
    filters.year,
    filters.schoolIds.slice().sort().join(','),
    filters.stages.slice().sort().join(','),
    filters.shifts.slice().sort().join(','),
  ].join('|');
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

export function schoolStages(school: {
  stages?: readonly Stage[] | null;
  stage?: Stage | null;
}): Stage[] {
  if (Array.isArray(school.stages) && school.stages.length > 0) {
    return [...school.stages];
  }
  if (school.stage) return [school.stage];
  return [];
}

export function schoolOffersStage(
  school: { stages?: readonly Stage[] | null; stage?: Stage | null },
  stage: Stage | 'all',
): boolean {
  if (stage === 'all') return true;
  return schoolStages(school).includes(stage);
}

export function stagesLabel(stages: readonly Stage[]): string {
  if (!stages.length) return '—';
  return stages.map((s) => stageLabel(s)).join(' · ');
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
