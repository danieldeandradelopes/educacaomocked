'use client';

import { useState } from 'react';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { resetLocalDb } from '@/lib/local-db';
import { useApiList } from '@/lib/use-api';

interface SettingsRow {
  id: string;
  organizationName: string;
  academicYear: number;
  attendanceThreshold: number;
  waitlistAlertDays: number;
  activeSearchStaleDays: number;
  demoMode: boolean;
  profile: string;
}

export function SettingsView() {
  const { data, loading, error, reload } = useApiList<SettingsRow>('settings');
  const settings = data?.[0];
  const toast = useToast();
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    setResetting(true);
    try {
      await resetLocalDb();
      reload();
      toast.success('Dados da demonstração restaurados');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao restaurar dados');
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Parâmetros demonstrativos — dados salvos no navegador (localStorage)."
      />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {settings && (
        <div className="grid gap-4 md:grid-cols-2">
          <article className="surface-card p-5">
            <h2 className="text-lg font-semibold text-[var(--color-navy)]">Organização</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Nome" value={settings.organizationName} />
              <Row label="Ano letivo" value={String(settings.academicYear)} />
              <Row label="Perfil da demo" value={settings.profile} />
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
                <dt className="text-[var(--color-muted)]">Modo demonstração</dt>
                <dd>
                  <StatusBadge tone={settings.demoMode ? 'success' : 'neutral'}>
                    {settings.demoMode ? 'Ativo' : 'Inativo'}
                  </StatusBadge>
                </dd>
              </div>
            </dl>
          </article>
          <article className="surface-card p-5">
            <h2 className="text-lg font-semibold text-[var(--color-navy)]">
              Regras de alerta
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row
                label="Limite de frequência (%)"
                value={String(settings.attendanceThreshold)}
              />
              <Row
                label="Alerta lista de espera (dias)"
                value={String(settings.waitlistAlertDays)}
              />
              <Row
                label="Busca ativa sem atualização (dias)"
                value={String(settings.activeSearchStaleDays)}
              />
            </dl>
          </article>
          <article className="surface-card p-5 md:col-span-2">
            <h2 className="text-lg font-semibold text-[var(--color-navy)]">
              Dados locais
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Alterações de cadastro ficam neste navegador. Restaurar volta ao seed
              original do ambiente de demonstração.
            </p>
            <button
              type="button"
              onClick={handleReset}
              disabled={resetting}
              className="mt-4 min-h-10 rounded-[var(--radius-control)] border border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-navy)] transition hover:bg-[var(--color-navy)]/5 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
            >
              {resetting ? 'Restaurando…' : 'Restaurar dados da demonstração'}
            </button>
          </article>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--color-border)] pb-2">
      <dt className="text-[var(--color-muted)]">{label}</dt>
      <dd className="font-medium text-[var(--color-navy)]">{value}</dd>
    </div>
  );
}
