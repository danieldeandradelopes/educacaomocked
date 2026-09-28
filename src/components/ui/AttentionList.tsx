'use client';

import Link from 'next/link';
import type { AttentionPoint } from '@/domain/types';
import { formatNumber } from '@/lib/filters';
import { AlertTriangle, Info, Siren } from 'lucide-react';

const severityStyles = {
  danger: {
    icon: Siren,
    className: 'border-[var(--color-danger)]/25 bg-[var(--color-danger)]/8 text-[var(--color-danger)]',
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
  },
  info: {
    icon: Info,
    className: 'border-[var(--color-primary)]/25 bg-[var(--color-primary)]/8 text-[var(--color-primary)]',
  },
} as const;

export function AttentionList({ items }: { items: readonly AttentionPoint[] }) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
      <h2 className="font-display text-lg font-semibold text-[var(--color-navy)]">
        Pontos de Atenção
      </h2>
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
                <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-[var(--color-navy)]">{item.title}</p>
                  <p className="mt-1 font-display font-tabular text-2xl font-semibold text-[var(--color-navy)]">
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
