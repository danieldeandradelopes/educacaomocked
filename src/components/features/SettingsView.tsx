'use client';

import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
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
  const { data, loading, error } = useApiList<SettingsRow>('settings');
  const settings = data?.[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configurações"
        description="Parâmetros demonstrativos do protótipo — sem persistência real."
      />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {settings && (
        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="text-lg font-semibold text-[var(--color-navy)]">
              Organização
            </h2>
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
          <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
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
