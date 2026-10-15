import {
  localCreate,
  localGet,
  localList,
  localRemove,
  localUpdate,
} from '@/lib/local-db';

export async function apiList<T>(collection: string): Promise<T[]> {
  return localList<T>(collection);
}

export async function apiGet<T>(collection: string, id: string): Promise<T> {
  return localGet<T>(collection, id);
}

export async function apiCreate<T extends Record<string, unknown>>(
  collection: string,
  payload: T,
): Promise<T & { id: string }> {
  return localCreate(collection, payload);
}

export async function apiUpdate<T extends Record<string, unknown>>(
  collection: string,
  id: string,
  payload: Partial<T>,
): Promise<T & { id: string }> {
  return localUpdate(collection, id, payload);
}

export async function apiRemove(collection: string, id: string): Promise<void> {
  await localRemove(collection, id);
}
