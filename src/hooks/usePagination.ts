'use client';

import { useEffect, useMemo, useState } from 'react';

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export interface PaginationState<T> {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  pageItems: T[];
  from: number;
  to: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  pageSizeOptions: readonly number[];
}

export function usePagination<T>(
  items: readonly T[],
  options?: { pageSize?: number; resetKey?: string | number },
): PaginationState<T> {
  const initialSize = options?.pageSize ?? 10;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialSize);

  useEffect(() => {
    setPage(1);
  }, [options?.resetKey, items.length, pageSize]);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize) as T[];
  }, [items, safePage, pageSize]);

  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, total);

  function setPageSize(size: number) {
    setPageSizeState(size);
    setPage(1);
  }

  return {
    page: safePage,
    pageSize,
    total,
    totalPages,
    pageItems,
    from,
    to,
    setPage,
    setPageSize,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
  };
}
