'use client';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { PaginationBar } from '@/components/ui/PaginationBar';
import type { PaginationState } from '@/hooks/usePagination';
import type { SortState } from '@/hooks/useSortable';

export interface DataTableColumn {
  id: string;
  label: string;
  /** Default true when `sort` is provided, except for actions-like columns. */
  sortable?: boolean;
}

function normalizeColumns(
  headersOrColumns: readonly string[] | readonly DataTableColumn[],
): DataTableColumn[] {
  return headersOrColumns.map((entry) => {
    if (typeof entry === 'string') {
      const id = entry
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      return {
        id,
        label: entry,
        sortable: !['acoes', 'ações', 'exportar'].includes(entry.toLowerCase()),
      };
    }
    return {
      ...entry,
      sortable: entry.sortable ?? !['actions', 'acoes', 'ações'].includes(entry.id),
    };
  });
}

export function DataTable({
  headers,
  columns,
  children,
  caption,
  pagination,
  sort,
}: {
  /** @deprecated Prefer `columns` with stable ids for sorting. */
  headers?: readonly string[];
  columns?: readonly DataTableColumn[];
  children: ReactNode;
  caption?: string;
  pagination?: PaginationState<unknown>;
  sort?: SortState;
}) {
  const cols = normalizeColumns(columns ?? headers ?? []);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="min-w-full border-collapse text-left text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead className="bg-[var(--color-navy)]/[0.04]">
            <tr>
              {cols.map((column) => {
                const canSort = Boolean(sort) && column.sortable !== false;
                const active = sort?.sortKey === column.id;
                return (
                  <th
                    key={column.id}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]"
                    aria-sort={
                      canSort && active
                        ? sort?.sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : canSort
                          ? 'none'
                          : undefined
                    }
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={() => sort?.onSort(column.id)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-1 py-0.5 transition hover:bg-[var(--color-navy)]/5 hover:text-[var(--color-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
                          active ? 'text-[var(--color-primary)]' : ''
                        }`}
                      >
                        {column.label}
                        {active ? (
                          sort?.sortDir === 'asc' ? (
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden />
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">{children}</tbody>
        </table>
      </div>
      {pagination && <PaginationBar {...pagination} />}
    </div>
  );
}
