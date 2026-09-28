import type { ReactNode } from 'react';

export function StatusBadge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
}) {
  const tones = {
    neutral: 'bg-[var(--color-navy)]/8 text-[var(--color-navy)]',
    success: 'bg-[var(--color-primary)]/12 text-[var(--color-primary)]',
    warning: 'bg-[var(--color-warning)]/15 text-[#8a5508]',
    danger: 'bg-[var(--color-danger)]/12 text-[var(--color-danger)]',
    info: 'bg-sky-100 text-sky-800',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
      <h2 className="font-display text-xl font-semibold text-[var(--color-navy)]">
        {title}
      </h2>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{description}</p>
    </div>
  );
}
