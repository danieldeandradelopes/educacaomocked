import type { CrudField } from '@/components/ui/CrudControls';

export const STAGE_OPTIONS = [
  { value: 'creche', label: 'Creche' },
  { value: 'infantil', label: 'Ed. Infantil' },
  { value: 'fundamental', label: 'Fundamental' },
] as const;

export const SHIFT_OPTIONS = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' },
  { value: 'integral', label: 'Integral' },
] as const;

export const EMPLOYMENT_OPTIONS = [
  { value: 'effective', label: 'Efetivo' },
  { value: 'contract', label: 'Contratado' },
  { value: 'ciop', label: 'CIOP' },
  { value: 'other', label: 'Outros' },
] as const;

export const ACTIVE_SEARCH_STATUS_OPTIONS = [
  { value: 'em_acompanhamento', label: 'Em acompanhamento' },
  { value: 'em_investigacao', label: 'Em investigação' },
  { value: 'aguardando_retorno', label: 'Aguardando retorno' },
  { value: 'encaminhado', label: 'Encaminhado' },
  { value: 'resolvido', label: 'Resolvido' },
  { value: 'encerrado', label: 'Encerrado' },
] as const;

export function schoolOptions(schools: readonly { id: string; name: string }[]) {
  return schools.map((school) => ({ value: school.id, label: school.name }));
}

export function studentFields(schools: readonly { id: string; name: string }[]): CrudField[] {
  return [
    { name: 'name', label: 'Nome', required: true },
    { name: 'schoolId', label: 'Escola', type: 'select', required: true, options: schoolOptions(schools) },
    { name: 'grade', label: 'Série/Turma', required: true },
    { name: 'stage', label: 'Etapa', type: 'select', required: true, options: [...STAGE_OPTIONS] },
    { name: 'shift', label: 'Turno', type: 'select', required: true, options: [...SHIFT_OPTIONS] },
    { name: 'neighborhood', label: 'Bairro', required: true },
    { name: 'attendanceRate', label: 'Frequência (%)', type: 'number', required: true },
    { name: 'birthDate', label: 'Nascimento', type: 'date', required: true },
    { name: 'guardianName', label: 'Responsável', required: true },
    { name: 'inActiveSearch', label: 'Em busca ativa', type: 'checkbox' },
    { name: 'inTutoring', label: 'Em reforço', type: 'checkbox' },
    { name: 'inInclusive', label: 'Educação inclusiva', type: 'checkbox' },
    { name: 'documentsPending', label: 'Docs pendentes', type: 'checkbox' },
    { name: 'transported', label: 'Transportado', type: 'checkbox' },
  ];
}

export function waitlistFields(schools: readonly { id: string; name: string }[]): CrudField[] {
  return [
    { name: 'childName', label: 'Nome da criança', required: true },
    { name: 'preferredSchoolId', label: 'Escola preferida', type: 'select', required: true, options: schoolOptions(schools) },
    { name: 'stage', label: 'Etapa', type: 'select', required: true, options: [...STAGE_OPTIONS] },
    { name: 'neighborhood', label: 'Bairro', required: true },
    { name: 'age', label: 'Idade', type: 'number', required: true },
    { name: 'waitingDays', label: 'Dias de espera', type: 'number', required: true },
    { name: 'requestedAt', label: 'Data do pedido', type: 'date', required: true },
  ];
}

export function activeSearchFields(
  schools: readonly { id: string; name: string }[],
  students: readonly { id: string; name: string }[],
): CrudField[] {
  return [
    {
      name: 'studentId',
      label: 'Aluno',
      type: 'select',
      required: true,
      options: students.map((s) => ({ value: s.id, label: s.name })),
    },
    { name: 'schoolId', label: 'Escola', type: 'select', required: true, options: schoolOptions(schools) },
    { name: 'grade', label: 'Série', required: true },
    { name: 'attendanceRate', label: 'Frequência (%)', type: 'number', required: true },
    {
      name: 'status',
      label: 'Situação',
      type: 'select',
      required: true,
      options: [...ACTIVE_SEARCH_STATUS_OPTIONS],
    },
    { name: 'openedAt', label: 'Abertura', type: 'date', required: true },
    { name: 'lastUpdateAt', label: 'Última atualização', type: 'date', required: true },
  ];
}

export function staffFields(schools: readonly { id: string; name: string }[]): CrudField[] {
  return [
    { name: 'name', label: 'Nome', required: true },
    { name: 'schoolId', label: 'Escola', type: 'select', required: true, options: schoolOptions(schools) },
    { name: 'role', label: 'Função', required: true },
    {
      name: 'employmentType',
      label: 'Vínculo',
      type: 'select',
      required: true,
      options: [...EMPLOYMENT_OPTIONS],
    },
    { name: 'isTeacher', label: 'É professor(a)', type: 'checkbox' },
    { name: 'shift', label: 'Turno', type: 'select', required: true, options: [...SHIFT_OPTIONS] },
  ];
}

export function tutoringFields(
  schools: readonly { id: string; name: string }[],
  students: readonly { id: string; name: string }[],
): CrudField[] {
  return [
    {
      name: 'studentId',
      label: 'Aluno',
      type: 'select',
      required: true,
      options: students.map((s) => ({ value: s.id, label: s.name })),
    },
    { name: 'studentName', label: 'Nome (exibição)', required: true },
    { name: 'schoolId', label: 'Escola', type: 'select', required: true, options: schoolOptions(schools) },
    { name: 'grade', label: 'Série', required: true },
    { name: 'subjects', label: 'Disciplinas (separadas por vírgula)', required: true, placeholder: 'Português, Matemática' },
    { name: 'bimestre', label: 'Bimestre', required: true },
    {
      name: 'status',
      label: 'Situação',
      type: 'select',
      required: true,
      options: [
        { value: 'em_acompanhamento', label: 'Em acompanhamento' },
        { value: 'evoluiu', label: 'Evoluiu' },
      ],
    },
  ];
}

export function inclusiveFields(
  schools: readonly { id: string; name: string }[],
  students: readonly { id: string; name: string }[],
): CrudField[] {
  return [
    {
      name: 'studentId',
      label: 'Aluno',
      type: 'select',
      required: true,
      options: students.map((s) => ({ value: s.id, label: s.name })),
    },
    { name: 'studentName', label: 'Nome (exibição)', required: true },
    { name: 'schoolId', label: 'Escola', type: 'select', required: true, options: schoolOptions(schools) },
    { name: 'grade', label: 'Série', required: true },
    { name: 'hasDocumentation', label: 'Documentação OK', type: 'checkbox' },
    { name: 'hasTutor', label: 'Possui tutor', type: 'checkbox' },
    { name: 'tutorName', label: 'Nome do tutor' },
    {
      name: 'status',
      label: 'Situação',
      type: 'select',
      required: true,
      options: [
        { value: 'definido', label: 'Definido' },
        { value: 'pendente', label: 'Pendente' },
      ],
    },
  ];
}

export function intersectoralFields(
  schools: readonly { id: string; name: string }[],
  students: readonly { id: string; name: string }[],
): CrudField[] {
  return [
    {
      name: 'studentId',
      label: 'Aluno',
      type: 'select',
      required: true,
      options: students.map((s) => ({ value: s.id, label: s.name })),
    },
    { name: 'studentName', label: 'Nome (exibição)', required: true },
    { name: 'schoolId', label: 'Escola', type: 'select', required: true, options: schoolOptions(schools) },
    {
      name: 'sector',
      label: 'Setor',
      type: 'select',
      required: true,
      options: [
        { value: 'Educação', label: 'Educação' },
        { value: 'Saúde', label: 'Saúde' },
        { value: 'Conselho Tutelar', label: 'Conselho Tutelar' },
        { value: 'CAPS', label: 'CAPS' },
        { value: 'Assistência Social', label: 'Assistência Social' },
      ],
    },
    {
      name: 'status',
      label: 'Situação',
      type: 'select',
      required: true,
      options: [
        { value: 'ativo', label: 'Ativo' },
        { value: 'aguardando_retorno', label: 'Aguardando retorno' },
        { value: 'pendente', label: 'Pendente' },
        { value: 'encerrado', label: 'Encerrado' },
      ],
    },
    { name: 'openedAt', label: 'Abertura', type: 'date', required: true },
    { name: 'dueAt', label: 'Prazo', type: 'date', required: true },
    { name: 'notes', label: 'Observações', type: 'textarea' },
  ];
}

export function documentFields(schools: readonly { id: string; name: string }[]): CrudField[] {
  return [
    { name: 'title', label: 'Título', required: true },
    {
      name: 'category',
      label: 'Categoria',
      type: 'select',
      required: true,
      options: [
        { value: 'escolar', label: 'Escolar' },
        { value: 'relatorio', label: 'Relatório' },
        { value: 'laudo', label: 'Laudo' },
        { value: 'administrativo', label: 'Administrativo' },
        { value: 'outro', label: 'Outro' },
      ],
    },
    { name: 'schoolId', label: 'Escola', type: 'select', required: true, options: schoolOptions(schools) },
    { name: 'updatedAt', label: 'Atualização', type: 'date', required: true },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'disponivel', label: 'Disponível' },
        { value: 'pendente', label: 'Pendente' },
        { value: 'arquivado', label: 'Arquivado' },
      ],
    },
  ];
}

export function schoolFields(): CrudField[] {
  return [
    { name: 'name', label: 'Nome', required: true },
    { name: 'neighborhood', label: 'Bairro', required: true },
    {
      name: 'stages',
      label: 'Etapas oferecidas',
      type: 'multiselect',
      required: true,
      options: [...STAGE_OPTIONS],
    },
    { name: 'students', label: 'Alunos', type: 'number', required: true },
    { name: 'teachers', label: 'Professores', type: 'number', required: true },
    { name: 'staff', label: 'Funcionários', type: 'number', required: true },
    { name: 'attendanceRate', label: 'Frequência (%)', type: 'number', required: true },
    { name: 'activeSearch', label: 'Busca ativa', type: 'number', required: true },
    { name: 'tutoring', label: 'Reforço', type: 'number', required: true },
    { name: 'inclusive', label: 'Inclusão', type: 'number', required: true },
    { name: 'transported', label: 'Transportados', type: 'number', required: true },
  ];
}

export function enrollmentFields(
  schools: readonly { id: string; name: string }[],
  students: readonly { id: string; name: string }[],
): CrudField[] {
  return [
    {
      name: 'studentId',
      label: 'Aluno',
      type: 'select',
      required: true,
      options: students.map((s) => ({ value: s.id, label: s.name })),
    },
    { name: 'schoolId', label: 'Escola', type: 'select', required: true, options: schoolOptions(schools) },
    { name: 'grade', label: 'Turma / série', required: true, placeholder: 'Ex.: 3º ano A' },
    { name: 'stage', label: 'Etapa', type: 'select', required: true, options: [...STAGE_OPTIONS] },
    { name: 'shift', label: 'Turno', type: 'select', required: true, options: [...SHIFT_OPTIONS] },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'ativa', label: 'Ativa' },
        { value: 'transferida', label: 'Transferida' },
        { value: 'encerrada', label: 'Encerrada' },
      ],
    },
    { name: 'enrolledAt', label: 'Data da matrícula', type: 'date', required: true },
  ];
}

export function transportRouteFields(): CrudField[] {
  return [
    { name: 'name', label: 'Nome da rota', required: true },
    { name: 'vehicle', label: 'Veículo', required: true },
    { name: 'driver', label: 'Motorista', required: true },
    { name: 'students', label: 'Alunos', type: 'number', required: true },
  ];
}

export function historyFields(
  schools: readonly { id: string; name: string }[],
  students: readonly { id: string; name: string }[],
): CrudField[] {
  return [
    {
      name: 'studentId',
      label: 'Aluno',
      type: 'select',
      required: true,
      options: students.map((s) => ({ value: s.id, label: s.name })),
    },
    { name: 'schoolId', label: 'Escola', type: 'select', required: true, options: schoolOptions(schools) },
    { name: 'event', label: 'Evento', required: true },
    { name: 'date', label: 'Data', type: 'date', required: true },
    { name: 'detail', label: 'Detalhe', type: 'textarea', required: true },
  ];
}
