import type { ActiveSearchStatus, EmploymentType } from '@/domain/types';

export const ACTIVE_SEARCH_STATUS_LABEL: Record<ActiveSearchStatus, string> = {
  em_acompanhamento: 'Em acompanhamento',
  em_investigacao: 'Em investigação',
  aguardando_retorno: 'Aguardando retorno',
  encaminhado: 'Encaminhado',
  resolvido: 'Resolvido',
  encerrado: 'Encerrado',
};

export const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  effective: 'Efetivo',
  contract: 'Contratado',
  ciop: 'CIOP',
  other: 'Outros',
};
