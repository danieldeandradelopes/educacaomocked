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
  size?: 'lg' | 'md' | 'sm';
  index?: number;
}

const accentBar: Record<NonNullable<KpiCardProps['accent']>, string> = {
  teal: 'bg-[var(--color-primary)]',
  navy: 'bg-[var(--color-navy)]',
  amber: 'bg-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]',
};

const sizeValue: Record<NonNullable<KpiCardProps['size']>, string> = {
  lg: 'text-4xl sm:text-5xl font-bold',
  md: 'text-3xl sm:text-4xl font-semibold',
  sm: 'text-2xl sm:text-3xl font-semibold',
};

export function KpiCard({
  label,
  value,
  hint,
  href,
  delta,
  accent = 'navy',
  size = 'md',
  index = 0,
}: KpiCardProps) {
  const showSemanticAccent = accent === 'amber' || accent === 'danger';

  const content = (
    <div
      className={`kpi-enter surface-card relative overflow-hidden p-4 ${
        href
          ? 'group transition duration-200 hover:-translate-y-0.5 hover:shadow-md'
          : ''
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {showSemanticAccent && (
        <span
          className={`absolute inset-y-0 left-0 w-1 ${accentBar[accent]}`}
          aria-hidden
        />
      )}
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
        {label}
      </p>
      <p
        className={`mt-2 font-tabular text-[var(--color-navy)] ${sizeValue[size]}`}
      >
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
        <span className="mt-3 inline-flex min-h-6 items-center text-xs font-semibold text-[var(--color-primary)] opacity-90 group-hover:opacity-100">
          Ver detalhe →
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-[var(--radius-card)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
      >
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
    <section className="surface-card p-4 sm:p-5">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-navy)]">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
        )}
      </header>
      <div className="h-64 w-full">{children}</div>
    </section>
  );
}

export function SectionHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
      )}
    </header>
  );
}
