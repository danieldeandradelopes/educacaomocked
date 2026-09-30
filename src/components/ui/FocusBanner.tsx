'use client';

import { useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';

const LABELS: Record<string, string> = {
  teachers: 'Filtrado: professores',
  employees: 'Filtrado: funcionários',
  ciop: 'Filtrado: vínculo CIOP',
  stale: 'Filtrado: casos sem atualização',
  referrals: 'Filtrado: encaminhados / aguardando retorno',
  attendance: 'Filtrado: baixa frequência (busca ativa)',
  over60: 'Filtrado: espera acima de 60 dias',
  inclusive: 'Destaque: educação inclusiva por escola',
  transport: 'Destaque: transporte escolar por unidade',
  docs: 'Amostra: alunos com documentação pendente',
  pending: 'Filtrado: registros pendentes / aguardando retorno',
};

export function FocusBanner({ allowed }: { allowed: readonly string[] }) {
  const params = useSearchParams();
  const focus = params.get('focus');
  if (!focus || !allowed.includes(focus)) return null;

  return (
    <div
      role="status"
      className="rounded-xl border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/8 px-4 py-3 text-sm text-[var(--color-navy)]"
    >
      <span className="font-semibold">{LABELS[focus] ?? `Filtro: ${focus}`}</span>
      <span className="text-[var(--color-text-secondary)]">
        {' '}
        — origem do clique no Dashboard
      </span>
    </div>
  );
}

export function useFocusParam(allowed: readonly string[]): string | null {
  const params = useSearchParams();
  const focus = params.get('focus');
  if (!focus || !allowed.includes(focus)) return null;
  return focus;
}

export function SuspenseFocus({ children }: { children: ReactNode }) {
  return children;
}
