'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { formatNumber } from '@/lib/filters';

interface KpiCardProps {
  label: string;
  value: number;
  hint?: string;
  href?: string;
  delta?: number;
  accent?: 'teal' | 'navy' | 'amber' | 'danger';
  index?: number;
}

const accentClass: Record<NonNullable<KpiCardProps['accent']>, string> = {
  teal: 'from-[var(--color-primary)]/15 to-transparent border-[var(--color-primary)]/25',
  navy: 'from-[var(--color-navy)]/10 to-transparent border-[var(--color-navy)]/20',
  amber: 'from-[var(--color-warning)]/15 to-transparent border-[var(--color-warning)]/30',
  danger: 'from-[var(--color-danger)]/12 to-transparent border-[var(--color-danger)]/25',
};

export function KpiCard({
  label,
  value,
  hint,
  href,
  delta,
  accent = 'teal',
  index = 0,
}: KpiCardProps) {
  const content = (
    <div
      className={`kpi-enter relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-[0_1px_0_rgba(27,42,74,0.04)] ${
        href
          ? 'group transition duration-200 hover:-translate-y-0.5 hover:shadow-md'
          : ''
      } ${accentClass[accent]}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
        {label}
      </p>
      <p className="mt-2 font-display font-tabular text-3xl font-semibold text-[var(--color-navy)] sm:text-4xl">
        {formatNumber(value)}
      </p>
      {(hint || typeof delta === 'number') && (
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {typeof delta === 'number' && (
            <span className="mr-2 font-medium text-[var(--color-primary)]">
              {delta > 0 ? '+' : ''}
              {delta.toFixed(1).replace('.', ',')}%
            </span>
          )}
          {hint}
        </p>
      )}
      {href && (
        <span className="mt-3 inline-flex text-xs font-semibold text-[var(--color-primary)] opacity-80 group-hover:opacity-100">
          Ver detalhe →
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] rounded-2xl">
        {content}
      </Link>
    );
  }

  return content;
}

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_1px_0_rgba(27,42,74,0.04)] sm:p-5">
      <header className="mb-4">
        <h2 className="font-display text-lg font-semibold text-[var(--color-navy)]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
        )}
      </header>
      <div className="h-64 w-full">{children}</div>
    </section>
  );
}
