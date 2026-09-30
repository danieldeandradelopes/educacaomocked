'use client';

import { Suspense, useMemo, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { FocusBanner, useFocusParam } from '@/components/ui/FocusBanner';
import { ErrorBlock, LoadingBlock, PageHeader } from '@/components/ui/PageHeader';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AggregateFilterChips } from '@/components/ui/AggregateFilterChips';
import { useAggregateFilter } from '@/hooks/useAggregateFilter';
import { useCrudResource } from '@/hooks/useCrudResource';
import { usePagination } from '@/hooks/usePagination';
import { useSortable } from '@/hooks/useSortable';
import { documentFields } from '@/lib/crud-fields';
import { useApiList } from '@/lib/use-api';
import { useFilters } from '@/lib/filter-context';
import {
  describeFilters,
  filtersResetKey,
  isFilterActive,
  matchesSchoolId,
  preferredSchoolId,
} from '@/lib/filters';
import type { School } from '@/domain/types';

interface DocumentRow {
  id: string;
  title: string;
  category: string;
  schoolId: string;
  studentId: string | null;
  updatedAt: string;
  status: string;
}

interface LegislationRow {
  id: string;
  title: string;
  type: string;
  year: number;
  subject: string;
  status: string;
}

const FOCUS_ALLOWED = ['pending'] as const;

const DOC_STATUS_OPTIONS = [
  { value: 'disponivel' as const, label: 'Disponível' },
  { value: 'pendente' as const, label: 'Pendente' },
];

function DocumentsContent() {
  const docsReq = useApiList<DocumentRow>('documents');
  const lawsReq = useApiList<LegislationRow>('legislation');
  const schoolsReq = useApiList<School>('schools');
  const { filters } = useFilters();
  const focus = useFocusParam(FOCUS_ALLOWED);
  const [query, setQuery] = useState('');
  const docStatusFilter = useAggregateFilter<'disponivel' | 'pendente'>();
  const lawStatusFilter = useAggregateFilter<string>();
  const schools = schoolsReq.data ?? [];

  const documentBase = useMemo(() => {
    let rows = docsReq.data ?? [];
    rows = rows.filter((d) => matchesSchoolId(d.schoolId, filters));
    if (focus === 'pending') rows = rows.filter((d) => d.status === 'pendente');
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((d) => d.title.toLowerCase().includes(q));
    }
    return rows;
  }, [docsReq.data, filters, focus, query]);

  const documentRows = useMemo(
    () =>
      documentBase.filter((d) =>
        docStatusFilter.matches(d.status as 'disponivel' | 'pendente'),
      ),
    [documentBase, docStatusFilter],
  );

  const lawBase = useMemo(() => {
    let rows = lawsReq.data ?? [];
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (d) => d.title.toLowerCase().includes(q) || d.subject.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [lawsReq.data, query]);

  const lawRows = useMemo(
    () => lawBase.filter((d) => lawStatusFilter.matches(d.status)),
    [lawBase, lawStatusFilter],
  );

  const schoolName = (id: string) => schools.find((s) => s.id === id)?.name ?? id;
  const docSortAccessors = useMemo(
    () => ({
      title: (d: DocumentRow) => d.title,
      category: (d: DocumentRow) => d.category,
      school: (d: DocumentRow) => schoolName(d.schoolId),
      updatedAt: (d: DocumentRow) => d.updatedAt,
      status: (d: DocumentRow) => d.status,
    }),
    [schools],
  );
  const lawSortAccessors = useMemo(
    () => ({
      title: (d: LegislationRow) => d.title,
      type: (d: LegislationRow) => d.type,
      year: (d: LegislationRow) => d.year,
      subject: (d: LegislationRow) => d.subject,
      status: (d: LegislationRow) => d.status,
    }),
    [],
  );

  const docsResetKey = `${filtersResetKey(filters)}|${focus ?? ''}|${query}|${docStatusFilter.key}`;
  const lawsResetKey = `${filtersResetKey(filters)}|${query}|${lawStatusFilter.key}`;
  const docsSorted = useSortable(documentRows, docSortAccessors, { resetKey: docsResetKey });
  const lawsSorted = useSortable(lawRows, lawSortAccessors, { resetKey: lawsResetKey });
  const documentsPagination = usePagination(docsSorted.items, {
    resetKey: `${docsResetKey}|${docsSorted.sortKey}|${docsSorted.sortDir}`,
  });
  const legislationPagination = usePagination(lawsSorted.items, {
    resetKey: `${lawsResetKey}|${lawsSorted.sortKey}|${lawsSorted.sortDir}`,
  });

  const crud = useCrudResource<DocumentRow>({
    collection: 'documents',
    titleSingular: 'documento',
    fields: documentFields(schools),
    items: documentRows,
    reload: docsReq.reload,
    createDefaults: () => ({
      category: 'escolar',
      status: 'disponivel',
      updatedAt: new Date().toISOString().slice(0, 10),
      schoolId: preferredSchoolId(filters, schools[0]?.id),
      studentId: null,
    }),
  });

  const loading = docsReq.loading || lawsReq.loading || schoolsReq.loading;
  const error = docsReq.error ?? lawsReq.error ?? schoolsReq.error;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documentos"
        description={`CRUD documental${isFilterActive(filters) ? ` · ${describeFilters(filters, schools)}` : ''}.`}
        action={crud.toolbar}
      />
      <FocusBanner allowed={FOCUS_ALLOWED} />
      <input
        className="field max-w-md"
        placeholder="Pesquisar documento…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Pesquisar documento"
      />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <KpiCard index={0} label="Documentos" value={documentBase.length} accent="navy" />
            <KpiCard
              index={1}
              label="Pendentes"
              value={documentBase.filter((d) => d.status === 'pendente').length}
              accent="amber"
            />
            <KpiCard index={2} label="Legislação" value={lawBase.length} accent="teal" />
          </section>
          <h2 className="font-display text-lg font-semibold text-[var(--color-navy)]">
            Documentos da rede
          </h2>
          <AggregateFilterChips
            label="Status"
            clearLabel="Todos"
            options={DOC_STATUS_OPTIONS.map((option) => ({
              ...option,
              count: documentBase.filter((d) => d.status === option.value).length,
            }))}
            selected={docStatusFilter.selected}
            onToggle={docStatusFilter.toggle}
            onClear={docStatusFilter.clear}
          />
          <DataTable
            caption="Documentos"
            columns={[
              { id: 'title', label: 'Título' },
              { id: 'category', label: 'Categoria' },
              { id: 'school', label: 'Escola' },
              { id: 'updatedAt', label: 'Atualização' },
              { id: 'status', label: 'Status' },
              { id: 'actions', label: 'Ações', sortable: false },
            ]}
            sort={docsSorted}
            pagination={documentsPagination}
          >
            {documentsPagination.pageItems.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-medium text-[var(--color-navy)]">{row.title}</td>
                <td className="px-4 py-3">{row.category}</td>
                <td className="px-4 py-3">
                  {schools.find((s) => s.id === row.schoolId)?.name ?? row.schoolId}
                </td>
                <td className="px-4 py-3">{row.updatedAt}</td>
                <td className="px-4 py-3">
                  <StatusBadge tone={row.status === 'pendente' ? 'warning' : 'success'}>
                    {row.status}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3">{crud.rowActions(row)}</td>
              </tr>
            ))}
          </DataTable>
          <h2 className="font-display text-lg font-semibold text-[var(--color-navy)]">
            Legislação e atos
          </h2>
          {(() => {
            const lawStatuses = [...new Set(lawBase.map((d) => d.status))].sort();
            if (lawStatuses.length <= 1) return null;
            return (
              <AggregateFilterChips
                label="Situação"
                clearLabel="Todos"
                options={lawStatuses.map((st) => ({
                  value: st,
                  label: st,
                  count: lawBase.filter((d) => d.status === st).length,
                }))}
                selected={lawStatusFilter.selected}
                onToggle={lawStatusFilter.toggle}
                onClear={lawStatusFilter.clear}
              />
            );
          })()}
          <DataTable
            caption="Legislação"
            columns={[
              { id: 'title', label: 'Título' },
              { id: 'type', label: 'Tipo' },
              { id: 'year', label: 'Ano' },
              { id: 'subject', label: 'Assunto' },
              { id: 'status', label: 'Situação' },
            ]}
            sort={lawsSorted}
            pagination={legislationPagination}
          >
            {legislationPagination.pageItems.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 font-medium text-[var(--color-navy)]">{row.title}</td>
                <td className="px-4 py-3">{row.type}</td>
                <td className="px-4 py-3">{row.year}</td>
                <td className="px-4 py-3">{row.subject}</td>
                <td className="px-4 py-3">
                  <StatusBadge tone="success">{row.status}</StatusBadge>
                </td>
              </tr>
            ))}
          </DataTable>
        </>
      )}
      {crud.modal}
    </div>
  );
}

export function DocumentsView() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <DocumentsContent />
    </Suspense>
  );
}
