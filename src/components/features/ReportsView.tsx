'use client';

import { useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/Toast';
import { usePagination } from '@/hooks/usePagination';
import { useSortable } from '@/hooks/useSortable';
import { useApiList } from '@/lib/use-api';

interface ReportRow {
  id: string;
  name: string;
  description: string;
  formats: string[];
}

export function ReportsView() {
  const toast = useToast();
  const { data, loading, error } = useApiList<ReportRow>('reports');
  const rows = data ?? [];
  const sortAccessors = useMemo(
    () => ({
      name: (r: ReportRow) => r.name,
      description: (r: ReportRow) => r.description,
    }),
    [],
  );
  const sorted = useSortable(rows, sortAccessors, { resetKey: rows.length });
  const pagination = usePagination(sorted.items, {
    resetKey: `${rows.length}|${sorted.sortKey}|${sorted.sortDir}`,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Exportações demonstrativas (PDF, Excel e CSV) — mockadas para a apresentação."
      />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && (
        <DataTable
          caption="Relatórios"
          columns={[
            { id: 'name', label: 'Relatório' },
            { id: 'description', label: 'Descrição' },
            { id: 'export', label: 'Exportar', sortable: false },
          ]}
          sort={sorted}
          pagination={pagination}
        >
          {pagination.pageItems.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3 font-medium text-[var(--color-navy)]">{row.name}</td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)]">{row.description}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  {row.formats.map((format) => (
                    <button
                      key={format}
                      type="button"
                      className="rounded-lg border border-[var(--color-border)] px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-primary)]/8"
                      onClick={() => {
                        toast.info(
                          `Exportação ${format}`,
                          `${row.name} — na versão real o arquivo seria gerado aqui.`,
                        );
                      }}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </div>
  );
}
