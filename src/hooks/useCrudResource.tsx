'use client';

import { useCallback, useMemo, useState } from 'react';
import { apiCreate, apiRemove, apiUpdate } from '@/lib/api-client';
import { CrudActions, CrudModal, RowActions, type CrudField } from '@/components/ui/CrudControls';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

interface UseCrudOptions<T extends { id: string }> {
  collection: string;
  fields: readonly CrudField[];
  items: readonly T[];
  reload: () => void;
  createDefaults?: () => Partial<T>;
  mapCreate?: (values: Record<string, unknown>) => Record<string, unknown>;
  mapUpdate?: (values: Record<string, unknown>, current: T) => Record<string, unknown>;
  afterSave?: (ctx: {
    mode: 'create' | 'edit';
    values: Record<string, unknown>;
    item?: T;
  }) => Promise<void> | void;
  titleSingular: string;
}

export function useCrudResource<T extends { id: string }>({
  collection,
  fields,
  items,
  reload,
  createDefaults,
  mapCreate,
  mapUpdate,
  afterSave,
  titleSingular,
}: UseCrudOptions<T>) {
  const toast = useToast();
  const { ask } = useConfirm();
  const [mode, setMode] = useState<'closed' | 'create' | 'edit'>('closed');
  const [current, setCurrent] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);

  const label = titleSingular.toLowerCase();

  const openCreate = useCallback(() => {
    setCurrent(null);
    setError(null);
    setMode('create');
  }, []);

  const openEdit = useCallback((item: T) => {
    setCurrent(item);
    setError(null);
    setMode('edit');
  }, []);

  const close = useCallback(() => {
    if (busy) return;
    setMode('closed');
    setCurrent(null);
    setError(null);
  }, [busy]);

  const initialValues = useMemo(() => {
    if (mode === 'edit' && current) return current as unknown as Record<string, unknown>;
    return (createDefaults?.() ?? {}) as Record<string, unknown>;
  }, [mode, current, createDefaults]);

  async function submit(values: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    const action = mode === 'create' ? 'create' : 'edit';
    try {
      if (mode === 'create') {
        const payload = mapCreate ? mapCreate(values) : values;
        await apiCreate(collection, payload);
        await afterSave?.({ mode: 'create', values: payload });
        toast.success(
          `${capitalize(titleSingular)} criado(a)`,
          'Registro salvo e disponível na listagem.',
        );
      } else if (mode === 'edit' && current) {
        const payload = mapUpdate ? mapUpdate(values, current) : values;
        await apiUpdate(collection, current.id, payload);
        await afterSave?.({ mode: 'edit', values: payload, item: current });
        toast.success(
          `${capitalize(titleSingular)} atualizado(a)`,
          'Alterações salvas com sucesso.',
        );
      }
      reload();
      setMode('closed');
      setCurrent(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : `Falha ao ${action === 'create' ? 'criar' : 'salvar'}`;
      setError(message);
      toast.error(`Não foi possível salvar o ${label}`, message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: T) {
    const ok = await ask({
      title: `Excluir ${label}?`,
      description:
        'O registro será removido da listagem e os indicadores relacionados serão atualizados. Esta ação não pode ser desfeita neste protótipo.',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    });
    if (!ok) return;

    setRowBusyId(item.id);
    try {
      await apiRemove(collection, item.id);
      reload();
      toast.success(`${capitalize(titleSingular)} excluído(a)`, 'A listagem foi atualizada.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao excluir';
      toast.error(`Não foi possível excluir o ${label}`, message);
    } finally {
      setRowBusyId(null);
    }
  }

  const toolbar = <CrudActions onCreate={openCreate} />;

  const modal = (
    <CrudModal
      open={mode !== 'closed'}
      title={mode === 'create' ? `Novo ${titleSingular}` : `Editar ${titleSingular}`}
      fields={fields}
      initialValues={initialValues}
      busy={busy}
      error={error}
      onClose={close}
      onSubmit={submit}
      submitLabel={mode === 'create' ? 'Criar' : 'Salvar'}
    />
  );

  function rowActions(item: T) {
    return (
      <RowActions
        busy={rowBusyId === item.id}
        onEdit={() => openEdit(item)}
        onDelete={() => {
          void remove(item);
        }}
      />
    );
  }

  return {
    toolbar,
    modal,
    rowActions,
    itemCount: items.length,
  };
}

function capitalize(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}
