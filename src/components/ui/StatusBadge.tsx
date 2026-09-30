import type { ReactNode } from 'react';

export function StatusBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}) {
  const tones = {
    neutral: 'border-[var(--color-border)] bg-[var(--color-navy)]/6 text-[var(--color-navy)]',
    success:
      'border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)]',
    warning:
      'border-[var(--color-warning)]/35 bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
    danger:
      'border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]',
    info: 'border-[var(--color-info)]/30 bg-[var(--color-info)]/10 text-[var(--color-info)]',
  };

  const dots = {
    neutral: 'bg-[var(--color-navy)]',
    success: 'bg-[var(--color-success)]',
    warning: 'bg-[var(--color-warning)]',
    danger: 'bg-[var(--color-danger)]',
    info: 'bg-[var(--color-info)]',
  };

  return (
    <span
      className={`inline-flex min-h-6 items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dots[tone]}`} aria-hidden />
      {children}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
      <h2 className="text-xl font-semibold text-[var(--color-navy)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{description}</p>
    </div>
  );
}
