import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const firstNames = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Felipe', 'Giulia', 'Hugo', 'Isabela', 'João',
  'Karina', 'Lucas', 'Marina', 'Nicolas', 'Olivia', 'Pedro', 'Rafaela', 'Sofia', 'Tiago', 'Valentina',
  'Arthur', 'Beatriz', 'Caio', 'Daniela', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena', 'Igor', 'Julia',
];
const lastNames = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Costa', 'Pereira', 'Almeida', 'Nascimento', 'Araújo',
  'Fernandes', 'Carvalho', 'Gomes', 'Martins', 'Rocha', 'Ribeiro', 'Alves', 'Monteiro', 'Mendes', 'Barros',
];

function pick(arr, i) {
  return arr[i % arr.length];
}

function nameAt(i) {
  return `${pick(firstNames, i)} ${pick(lastNames, i * 3)} ${pick(lastNames, i * 7)}`;
}

const schools = [
  { id: 'sch-01', name: 'EMEF João XXIII', neighborhood: 'Centro', stages: ['fundamental'], students: 684, teachers: 42, staff: 26, attendanceRate: 93.2, activeSearch: 12, tutoring: 86, inclusive: 31, transported: 142 },
  { id: 'sch-02', name: 'EMEF Maria Silva', neighborhood: 'Jardim América', stages: ['infantil', 'fundamental'], students: 592, teachers: 38, staff: 22, attendanceRate: 94.1, activeSearch: 9, tutoring: 71, inclusive: 28, transported: 118 },
  { id: 'sch-03', name: 'EMEF Paulo Freire', neighborhood: 'Vila Nova', stages: ['fundamental'], students: 541, teachers: 35, staff: 20, attendanceRate: 92.8, activeSearch: 14, tutoring: 64, inclusive: 25, transported: 96 },
  { id: 'sch-04', name: 'EMEI Jardim Brasil', neighborhood: 'Jardim Brasil', stages: ['creche', 'infantil'], students: 498, teachers: 28, staff: 18, attendanceRate: 95.0, activeSearch: 6, tutoring: 42, inclusive: 22, transported: 84 },
  { id: 'sch-05', name: 'EMEF Castro Alves', neighborhood: 'Boa Vista', stages: ['fundamental'], students: 476, teachers: 31, staff: 19, attendanceRate: 93.7, activeSearch: 11, tutoring: 58, inclusive: 24, transported: 102 },
  { id: 'sch-06', name: 'EMEF Cecília Meireles', neighborhood: 'São José', stages: ['infantil', 'fundamental'], students: 452, teachers: 29, staff: 17, attendanceRate: 94.5, activeSearch: 8, tutoring: 49, inclusive: 19, transported: 88 },
  { id: 'sch-07', name: 'EMEI Pequeno Príncipe', neighborhood: 'Centro', stages: ['infantil'], students: 312, teachers: 22, staff: 14, attendanceRate: 95.4, activeSearch: 4, tutoring: 28, inclusive: 16, transported: 54 },
  { id: 'sch-08', name: 'Creche Sol Nascente', neighborhood: 'Vila Nova', stages: ['creche'], students: 186, teachers: 18, staff: 12, attendanceRate: 96.1, activeSearch: 2, tutoring: 12, inclusive: 8, transported: 36 },
  { id: 'sch-09', name: 'EMEF Dom Pedro II', neighborhood: 'Industrial', stages: ['fundamental'], students: 510, teachers: 33, staff: 21, attendanceRate: 93.0, activeSearch: 10, tutoring: 55, inclusive: 20, transported: 110 },
  { id: 'sch-10', name: 'Centro Municipal Integrado', neighborhood: 'Nova Esperança', stages: ['creche', 'infantil', 'fundamental'], students: 438, teachers: 27, staff: 16, attendanceRate: 94.8, activeSearch: 7, tutoring: 47, inclusive: 18, transported: 79 },
  { id: 'sch-11', name: 'EMEI Arco-Íris', neighborhood: 'Boa Vista', stages: ['infantil'], students: 265, teachers: 19, staff: 11, attendanceRate: 95.6, activeSearch: 3, tutoring: 22, inclusive: 12, transported: 41 },
  { id: 'sch-12', name: 'Creche Cantinho Feliz', neighborhood: 'São José', stages: ['creche', 'infantil'], students: 142, teachers: 14, staff: 9, attendanceRate: 96.4, activeSearch: 1, tutoring: 8, inclusive: 6, transported: 22 },
];

const gradesByStage = {
  creche: ['Berçário', 'Maternal I', 'Maternal II'],
  infantil: ['Pré I', 'Pré II'],
  fundamental: ['1º ano', '2º ano', '3º ano', '4º ano', '5º ano', '6º ano', '7º ano', '8º ano', '9º ano'],
};
const shifts = ['manha', 'tarde', 'integral', 'noite'];

const students = Array.from({ length: 80 }, (_, i) => {
  const school = pick(schools, i);
  const stage = pick(school.stages, i);
  const grade = pick(gradesByStage[stage], i);
  const shift = pick(shifts, i);
  return {
    id: `stu-${String(i + 1).padStart(3, '0')}`,
    name: nameAt(i),
    schoolId: school.id,
    grade,
    stage,
    shift,
    neighborhood: school.neighborhood,
    attendanceRate: Number((62 + ((i * 17) % 36) + (i % 10) * 0.1).toFixed(1)),
    birthDate: `${2012 + (i % 10)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
    guardianName: `${pick(firstNames, i + 5)} ${pick(lastNames, i + 2)}`,
    inActiveSearch: i % 5 === 0,
    inTutoring: i % 3 === 0,
    inInclusive: i % 7 === 0,
    documentsPending: i % 6 === 0,
    transported: i % 4 === 0,
  };
});

const statuses = [
  'em_acompanhamento',
  'em_investigacao',
  'aguardando_retorno',
  'encaminhado',
  'resolvido',
  'encerrado',
];

const activeSearch = students
  .filter((s) => s.inActiveSearch)
  .map((s, i) => ({
    id: `as-${String(i + 1).padStart(2, '0')}`,
    studentId: s.id,
    schoolId: s.schoolId,
    grade: s.grade,
    attendanceRate: s.attendanceRate,
    status: pick([...statuses], i),
    openedAt: `2026-${String((i % 8) + 1).padStart(2, '0')}-12`,
    lastUpdateAt: `2026-09-${String((i % 25) + 1).padStart(2, '0')}`,
  }));

const waitlist = Array.from({ length: 40 }, (_, i) => {
  const school = pick(schools, i + 3);
  const stage = pick(school.stages, i);
  return {
    id: `wl-${String(i + 1).padStart(2, '0')}`,
    childName: nameAt(i + 100),
    stage,
    preferredSchoolId: school.id,
    neighborhood: school.neighborhood,
    age: stage === 'creche' ? 1 + (i % 3) : stage === 'infantil' ? 4 + (i % 2) : 6 + (i % 5),
    waitingDays: 10 + ((i * 13) % 95),
    requestedAt: `2026-${String((i % 8) + 1).padStart(2, '0')}-${String((i % 20) + 5).padStart(2, '0')}`,
  };
});

const teacherSubjects = ['Português', 'Matemática', 'Ciências', 'História', 'Geografia', 'Educação Física', 'Artes', 'Inglês'];
const staff = [
  ...Array.from({ length: 40 }, (_, i) => ({
    id: `tch-${String(i + 1).padStart(2, '0')}`,
    name: nameAt(i + 200),
    schoolId: pick(schools, i).id,
    role: `Professor(a) — ${pick(teacherSubjects, i)}`,
    employmentType: pick(['effective', 'contract', 'effective', 'other'], i),
    isTeacher: true,
    shift: pick(shifts, i),
  })),
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `emp-${String(i + 1).padStart(2, '0')}`,
    name: nameAt(i + 300),
    schoolId: pick(schools, i).id,
    role: pick(
      ['Auxiliar de sala', 'Merendeiro(a)', 'Porteiro(a)', 'Secretário(a) escolar', 'Coordenador(a) pedagógico(a)', 'Monitor(a)'],
      i,
    ),
    employmentType: pick(['effective', 'contract', 'ciop', 'ciop', 'other'], i),
    isTeacher: false,
    shift: pick(shifts, i + 1),
  })),
];

const enrollments = students.slice(0, 50).map((s, i) => ({
  id: `enr-${String(i + 1).padStart(3, '0')}`,
  studentId: s.id,
  studentName: s.name,
  schoolId: s.schoolId,
  grade: s.grade,
  stage: s.stage,
  shift: s.shift,
  status: pick(['ativa', 'ativa', 'ativa', 'transferida', 'encerrada'], i),
  enrolledAt: `2026-02-${String((i % 20) + 1).padStart(2, '0')}`,
}));

const attendanceMonthly = [
  { month: 'Jan', rate: 94.1 },
  { month: 'Fev', rate: 93.8 },
  { month: 'Mar', rate: 94.3 },
  { month: 'Abr', rate: 93.5 },
  { month: 'Mai', rate: 92.9 },
  { month: 'Jun', rate: 94.0 },
  { month: 'Jul', rate: 93.6 },
  { month: 'Ago', rate: 93.2 },
  { month: 'Set', rate: 93.9 },
];

const attendanceBySchool = schools.map((s) => ({
  schoolId: s.id,
  schoolName: s.name,
  rate: s.attendanceRate,
  lowAttendance: s.activeSearch,
}));

const tutoring = students
  .filter((s) => s.inTutoring)
  .map((s, i) => ({
    id: `tut-${String(i + 1).padStart(2, '0')}`,
    studentId: s.id,
    studentName: s.name,
    schoolId: s.schoolId,
    grade: s.grade,
    subjects: i % 2 === 0 ? ['Português', 'Matemática'] : i % 3 === 0 ? ['Português'] : ['Matemática'],
    bimestre: `${(i % 4) + 1}º`,
    status: pick(['em_acompanhamento', 'evoluiu', 'em_acompanhamento'], i),
  }));

const inclusiveClean = students
  .filter((s, i) => s.inInclusive || i % 11 === 0)
  .slice(0, 28)
  .map((s, i) => ({
    id: `inc-${String(i + 1).padStart(2, '0')}`,
    studentId: s.id,
    studentName: s.name,
    schoolId: s.schoolId,
    grade: s.grade,
    hasDocumentation: i % 5 !== 0,
    hasTutor: i % 4 !== 0,
    tutorName: i % 4 !== 0 ? nameAt(i + 400) : null,
    status: i % 5 === 0 ? 'pendente' : 'definido',
  }));

const transportRoutes = [
  { id: 'rt-01', name: 'Rota Centro — Norte', vehicle: 'Ônibus 12', driver: 'José Almeida', students: 48 },
  { id: 'rt-02', name: 'Rota Vila Nova', vehicle: 'Van 03', driver: 'Marcos Souza', students: 22 },
  { id: 'rt-03', name: 'Rota Jardim Brasil', vehicle: 'Ônibus 07', driver: 'Paulo Mendes', students: 36 },
  { id: 'rt-04', name: 'Rota Boa Vista', vehicle: 'Van 05', driver: 'Ricardo Lima', students: 18 },
  { id: 'rt-05', name: 'Rota São José', vehicle: 'Ônibus 09', driver: 'Carlos Ribeiro', students: 41 },
];

const transportStudents = students
  .filter((s) => s.transported)
  .map((s, i) => ({
    id: `tr-${String(i + 1).padStart(2, '0')}`,
    studentId: s.id,
    studentName: s.name,
    schoolId: s.schoolId,
    routeId: pick(transportRoutes, i).id,
    neighborhood: s.neighborhood,
  }));

const intersectoral = Array.from({ length: 24 }, (_, i) => ({
  id: `is-${String(i + 1).padStart(2, '0')}`,
  studentId: pick(students, i * 2).id,
  studentName: pick(students, i * 2).name,
  schoolId: pick(students, i * 2).schoolId,
  sector: pick(['Educação', 'Saúde', 'Conselho Tutelar', 'CAPS', 'Assistência Social'], i),
  status: pick(['ativo', 'aguardando_retorno', 'encerrado', 'pendente'], i),
  openedAt: `2026-${String((i % 7) + 2).padStart(2, '0')}-10`,
  dueAt: `2026-10-${String((i % 20) + 1).padStart(2, '0')}`,
  notes: 'Acompanhamento intersetorial mockado para validação.',
}));

const documents = Array.from({ length: 30 }, (_, i) => ({
  id: `doc-${String(i + 1).padStart(2, '0')}`,
  title: pick(
    [
      'Relatório de frequência',
      'Laudo pedagógico',
      'Ata de reunião',
      'Ficha de matrícula',
      'Comprovante de residência',
      'Portaria interna',
      'Relatório de busca ativa',
    ],
    i,
  ),
  category: pick(['escolar', 'relatorio', 'laudo', 'administrativo', 'outro'], i),
  schoolId: pick(schools, i).id,
  studentId: i % 3 === 0 ? pick(students, i).id : null,
  updatedAt: `2026-09-${String((i % 28) + 1).padStart(2, '0')}`,
  status: pick(['disponivel', 'pendente', 'arquivado'], i),
}));

const legislation = Array.from({ length: 12 }, (_, i) => ({
  id: `leg-${String(i + 1).padStart(2, '0')}`,
  title: pick(
    [
      'Lei municipal de educação inclusiva',
      'Decreto de transporte escolar',
      'Portaria de busca ativa',
      'Resolução do CME',
      'Instrução normativa de matrículas',
      'Comunicado de calendário letivo',
    ],
    i,
  ),
  type: pick(['lei', 'decreto', 'portaria', 'resolucao', 'instrucao', 'comunicado'], i),
  year: 2020 + (i % 6),
  subject: pick(['matrícula', 'frequência', 'inclusão', 'transporte', 'pessoal'], i),
  status: 'vigente',
}));

const reports = [
  { id: 'rep-01', name: 'Matrículas', description: 'Total e distribuição por escola, etapa e turno', formats: ['PDF', 'Excel', 'CSV'] },
  { id: 'rep-02', name: 'Frequência', description: 'Médias da rede, baixa frequência e evolução', formats: ['PDF', 'Excel', 'CSV'] },
  { id: 'rep-03', name: 'Busca Ativa', description: 'Casos, situações e resultados', formats: ['PDF', 'Excel', 'CSV'] },
  { id: 'rep-04', name: 'Lista de Espera', description: 'Demanda por etapa, escola e tempo', formats: ['PDF', 'Excel', 'CSV'] },
  { id: 'rep-05', name: 'Reforço Escolar', description: 'Alunos e disciplinas acompanhadas', formats: ['PDF', 'Excel', 'CSV'] },
  { id: 'rep-06', name: 'Educação Inclusiva', description: 'Acompanhamentos e pendências', formats: ['PDF', 'Excel', 'CSV'] },
  { id: 'rep-07', name: 'Transporte', description: 'Alunos transportados por escola e rota', formats: ['PDF', 'Excel', 'CSV'] },
  { id: 'rep-08', name: 'Quadro de Pessoal', description: 'Professores, funcionários e vínculos', formats: ['PDF', 'Excel', 'CSV'] },
];

const settings = {
  id: 'settings-1',
  organizationName: 'Secretaria Municipal de Educação',
  academicYear: 2026,
  attendanceThreshold: 75,
  waitlistAlertDays: 60,
  activeSearchStaleDays: 30,
  demoMode: true,
  profile: 'dirigente',
};

const kpis = {
  students: 8426,
  schools: 18,
  teachers: 524,
  staff: 324,
  ciop: 52,
  activeSearch: 137,
  waitlist: 284,
  tutoring: 642,
  transport: 1186,
  inclusive: 428,
  studentsDelta: 3.2,
};

const attentionPoints = [
  { id: 'att-1', title: 'Baixa frequência', count: 137, detail: '23 novos no período', href: '/active-search?focus=attendance', severity: 'danger' },
  { id: 'att-2', title: 'Busca ativa sem atualização', count: 18, detail: 'Casos sem registro recente', href: '/active-search?focus=stale', severity: 'warning' },
  { id: 'att-3', title: 'Lista de espera > 60 dias', count: 37, detail: 'Crianças aguardando vaga', href: '/waitlist?focus=over60', severity: 'warning' },
  { id: 'att-4', title: 'Inclusão pendente', count: 12, detail: 'Aguardando definição de acompanhamento', href: '/inclusive', severity: 'info' },
  { id: 'att-5', title: 'Documentação pendente', count: 23, detail: 'Alunos com documentos incompletos', href: '/documents?focus=pending', severity: 'info' },
  { id: 'att-6', title: 'Encaminhamentos aguardando retorno', count: 9, detail: 'Acompanhamentos intersetoriais', href: '/intersectoral?focus=pending', severity: 'warning' },
];

const activeSearchTrend = [
  { month: 'Jan', cases: 98 },
  { month: 'Fev', cases: 105 },
  { month: 'Mar', cases: 112 },
  { month: 'Abr', cases: 118 },
  { month: 'Mai', cases: 124 },
  { month: 'Jun', cases: 129 },
  { month: 'Jul', cases: 131 },
  { month: 'Ago', cases: 134 },
  { month: 'Set', cases: 137 },
];

const history = students.slice(0, 25).flatMap((s, i) => [
  {
    id: `hist-${s.id}-1`,
    studentId: s.id,
    studentName: s.name,
    schoolId: s.schoolId,
    event: 'Matrícula',
    date: enrollments[i]?.enrolledAt ?? '2026-02-10',
    detail: `Ingresso em ${s.grade}`,
  },
  {
    id: `hist-${s.id}-2`,
    studentId: s.id,
    studentName: s.name,
    schoolId: s.schoolId,
    event: s.inActiveSearch ? 'Busca ativa' : 'Acompanhamento pedagógico',
    date: '2026-06-15',
    detail: s.inActiveSearch ? 'Abertura de caso' : 'Registro de evolução',
  },
]);

const db = {
  kpis: [kpis],
  attentionPoints,
  schools,
  students,
  activeSearch,
  activeSearchTrend,
  waitlist,
  staff,
  enrollments,
  attendanceMonthly,
  attendanceBySchool,
  tutoring,
  inclusive: inclusiveClean,
  transportRoutes,
  transportStudents,
  intersectoral,
  documents,
  legislation,
  reports,
  settings: [settings],
  history,
};

const out = join(process.cwd(), 'db', 'db.json');
writeFileSync(out, JSON.stringify(db, null, 2));
console.log('Wrote', out, 'collections:', Object.keys(db).join(', '));
