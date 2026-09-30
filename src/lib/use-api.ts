'use client';

import { useEffect, useState } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useApi<T>(path: string): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const external = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    const url = external ? `${external}/${path}` : `/api/${path}`;

    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Falha ao carregar ${path} (${res.status})`);
        }
        return (await res.json()) as T;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro desconhecido');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path, tick]);

  return {
    data,
    loading,
    error,
    reload: () => setTick((v) => v + 1),
  };
}

export function useApiList<T>(collection: string): UseApiState<T[]> {
  const state = useApi<T[]>(collection);
  return {
    ...state,
    data: Array.isArray(state.data) ? state.data : state.loading ? null : [],
  };
}
