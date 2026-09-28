export type Stage = 'creche' | 'infantil' | 'fundamental';
export type Shift = 'manha' | 'tarde' | 'noite' | 'integral';
export type EmploymentType = 'effective' | 'contract' | 'ciop' | 'other';

export type ActiveSearchStatus =
  | 'em_acompanhamento'
  | 'em_investigacao'
  | 'aguardando_retorno'
  | 'encaminhado'
  | 'resolvido'
  | 'encerrado';

export interface School {
  readonly id: string;
  readonly name: string;
  readonly neighborhood: string;
  readonly stage: Stage;
  readonly students: number;
  readonly teachers: number;
  readonly staff: number;
  readonly attendanceRate: number;
  readonly activeSearch: number;
  readonly tutoring: number;
  readonly inclusive: number;
  readonly transported: number;
}

export interface Student {
  readonly id: string;
  readonly name: string;
  readonly schoolId: string;
  readonly grade: string;
  readonly stage: Stage;
  readonly shift: Shift;
  readonly neighborhood: string;
  readonly attendanceRate: number;
  readonly birthDate: string;
  readonly guardianName: string;
  readonly inActiveSearch: boolean;
  readonly inTutoring: boolean;
  readonly inInclusive: boolean;
  readonly documentsPending: boolean;
}

export interface ActiveSearchCase {
  readonly id: string;
  readonly studentId: string;
  readonly schoolId: string;
  readonly grade: string;
  readonly attendanceRate: number;
  readonly status: ActiveSearchStatus;
  readonly openedAt: string;
  readonly lastUpdateAt: string;
}

export interface WaitlistEntry {
  readonly id: string;
  readonly childName: string;
  readonly stage: Stage;
  readonly preferredSchoolId: string;
  readonly neighborhood: string;
  readonly age: number;
  readonly waitingDays: number;
  readonly requestedAt: string;
}

export interface StaffMember {
  readonly id: string;
  readonly name: string;
  readonly schoolId: string;
  readonly role: string;
  readonly employmentType: EmploymentType;
  readonly isTeacher: boolean;
  readonly shift: Shift;
}

export interface TimelineEvent {
  readonly id: string;
  readonly date: string;
  readonly title: string;
  readonly description: string;
  readonly kind: 'enrollment' | 'attendance' | 'active_search' | 'referral' | 'update' | 'document';
}

export interface AttentionPoint {
  readonly id: string;
  readonly title: string;
  readonly count: number;
  readonly detail: string;
  readonly href: string;
  readonly severity: 'warning' | 'danger' | 'info';
}

export interface GlobalFilters {
  readonly year: number;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly schoolId: string | 'all';
  readonly stage: Stage | 'all';
  readonly shift: Shift | 'all';
}

export interface NetworkKpis {
  readonly students: number;
  readonly schools: number;
  readonly teachers: number;
  readonly staff: number;
  readonly ciop: number;
  readonly activeSearch: number;
  readonly waitlist: number;
  readonly tutoring: number;
  readonly transport: number;
  readonly inclusive: number;
  readonly studentsDelta: number;
}
