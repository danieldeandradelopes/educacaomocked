import type { ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-navy)] sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {description}
          </p>
        )}
      </section>
      {action}
    </div>
  );
}

export function LoadingBlock({ label = 'Carregando dados…' }: { label?: string }) {
  return (
    <div
      className="surface-card p-6 text-sm text-[var(--color-muted)]"
      role="status"
      aria-live="polite"
    >
      {label}
    </div>
  );
}

export function ErrorBlock({ message }: { message: string }) {
  return (
    <div
      className="rounded-[var(--radius-card)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/8 p-6 text-sm text-[var(--color-danger)]"
      role="alert"
    >
      {message}
    </div>
  );
}
