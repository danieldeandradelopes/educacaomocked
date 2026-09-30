'use client';

import type { PaginationState } from '@/hooks/usePagination';

type PaginationBarProps = Pick<
  PaginationState<unknown>,
  | 'page'
  | 'pageSize'
  | 'total'
  | 'totalPages'
  | 'from'
  | 'to'
  | 'setPage'
  | 'setPageSize'
  | 'pageSizeOptions'
>;

export function PaginationBar({
  page,
  pageSize,
  total,
  totalPages,
  from,
  to,
  setPage,
  setPageSize,
  pageSizeOptions,
}: PaginationBarProps) {
  if (total === 0) {
    return (
      <p className="px-1 text-sm text-[var(--color-muted)]">Nenhum registro para exibir.</p>
    );
  }

  const pages = visiblePages(page, totalPages);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--color-muted)]">
        Mostrando <span className="font-medium text-[var(--color-navy)]">{from}</span>
        {'–'}
        <span className="font-medium text-[var(--color-navy)]">{to}</span> de{' '}
        <span className="font-medium text-[var(--color-navy)]">{total}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          Por página
          <select
            className="field !w-auto !py-1.5"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            aria-label="Itens por página"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1" role="navigation" aria-label="Paginação">
          <PageButton
            label="Anterior"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          />
          {pages.map((entry, index) =>
            entry === '…' ? (
              <span key={`ellipsis-${index}`} className="px-1 text-sm text-[var(--color-muted)]">
                …
              </span>
            ) : (
              <PageButton
                key={entry}
                label={String(entry)}
                active={entry === page}
                onClick={() => setPage(entry)}
              />
            ),
          )}
          <PageButton
            label="Próxima"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          />
        </div>
      </div>
    </div>
  );
}

function PageButton({
  label,
  onClick,
  disabled,
  active,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      className={[
        'min-w-9 rounded-xl border px-2.5 py-1.5 text-sm font-medium transition',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
        'disabled:cursor-not-allowed disabled:opacity-40',
        active
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
          : 'border-[var(--color-border)] text-[var(--color-navy)] hover:bg-[var(--color-navy)]/5',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function visiblePages(page: number, totalPages: number): Array<number | '…'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  if (page <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (page >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result: Array<number | '…'> = [];
  for (const current of sorted) {
    const prev = result[result.length - 1];
    if (typeof prev === 'number' && current - prev > 1) {
      result.push('…');
    }
    result.push(current);
  }
  return result;
}
