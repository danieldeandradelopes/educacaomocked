'use client';

import Link from 'next/link';
import type { AttentionPoint } from '@/domain/types';
import { formatNumber } from '@/lib/filters';
import { AlertTriangle, Info, Siren } from 'lucide-react';

const severityStyles = {
  danger: {
    icon: Siren,
    label: 'Crítico',
    className:
      'border-[var(--color-danger)]/30 bg-[var(--color-surface)] shadow-[inset_3px_0_0_0_var(--color-danger)]',
    iconClass: 'text-[var(--color-danger)]',
  },
  warning: {
    icon: AlertTriangle,
    label: 'Atenção',
    className:
      'border-[var(--color-warning)]/35 bg-[var(--color-surface)] shadow-[inset_3px_0_0_0_var(--color-warning)]',
    iconClass: 'text-[var(--color-warning)]',
  },
  info: {
    icon: Info,
    label: 'Informação',
    className:
      'border-[var(--color-info)]/30 bg-[var(--color-surface)] shadow-[inset_3px_0_0_0_var(--color-info)]',
    iconClass: 'text-[var(--color-info)]',
  },
} as const;

export function AttentionList({ items }: { items: readonly AttentionPoint[] }) {
  return (
    <section className="surface-card p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-[var(--color-navy)]">Pontos de Atenção</h2>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Situações que exigem acompanhamento imediato
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const style = severityStyles[item.severity];
          const Icon = style.icon;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex gap-3 rounded-xl border p-3 transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${style.className}`}
              >
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClass}`} aria-hidden />
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                    {style.label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[var(--color-navy)]">{item.title}</p>
                  <p className="mt-1 font-tabular text-2xl font-semibold text-[var(--color-navy)]">
                    {formatNumber(item.count)}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{item.detail}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
