function apiUrl(path: string): string {
  const external = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  return external ? `${external}/${path}` : `/api/${path}`;
}

async function parse<T>(res: Response, action: string): Promise<T> {
  if (!res.ok) {
    let detail = '';
    try {
      const body = (await res.json()) as { error?: string };
      detail = body.error ? `: ${body.error}` : '';
    } catch {
      detail = '';
    }
    throw new Error(`${action} falhou (${res.status})${detail}`);
  }
  return (await res.json()) as T;
}

export async function apiList<T>(collection: string): Promise<T[]> {
  const res = await fetch(apiUrl(collection), { cache: 'no-store' });
  const data = await parse<T[] | T>(res, `Listar ${collection}`);
  return Array.isArray(data) ? data : [data];
}

export async function apiGet<T>(collection: string, id: string): Promise<T> {
  const res = await fetch(apiUrl(`${collection}/${id}`), { cache: 'no-store' });
  return parse<T>(res, `Buscar ${collection}/${id}`);
}

export async function apiCreate<T extends Record<string, unknown>>(
  collection: string,
  payload: T,
): Promise<T & { id: string }> {
  const res = await fetch(apiUrl(collection), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parse<T & { id: string }>(res, `Criar ${collection}`);
}

export async function apiUpdate<T extends Record<string, unknown>>(
  collection: string,
  id: string,
  payload: Partial<T>,
): Promise<T & { id: string }> {
  const res = await fetch(apiUrl(`${collection}/${id}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parse<T & { id: string }>(res, `Atualizar ${collection}/${id}`);
}

export async function apiRemove(collection: string, id: string): Promise<void> {
  const res = await fetch(apiUrl(`${collection}/${id}`), { method: 'DELETE' });
  await parse(res, `Excluir ${collection}/${id}`);
}
