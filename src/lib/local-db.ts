export type LocalDbShape = Record<string, unknown>;

const STORAGE_KEY = 'edu-dashboard-db-v1';
const CHANGED_EVENT = 'edu-local-db-changed';

const ID_PREFIX: Record<string, string> = {
  schools: 'sch',
  students: 'stu',
  activeSearch: 'as',
  waitlist: 'wl',
  staff: 'stf',
  enrollments: 'enr',
  tutoring: 'tut',
  inclusive: 'inc',
  transportRoutes: 'rt',
  transportStudents: 'tr',
  intersectoral: 'is',
  documents: 'doc',
  legislation: 'leg',
  history: 'hist',
  settings: 'cfg',
};

let memoryCache: LocalDbShape | null = null;
let seedPromise: Promise<LocalDbShape> | null = null;

function assertClient() {
  if (typeof window === 'undefined') {
    throw new Error('local-db só pode ser usado no cliente');
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function readFromStorage(): LocalDbShape | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return isRecord(parsed) ? (parsed as LocalDbShape) : null;
  } catch {
    return null;
  }
}

function persist(db: LocalDbShape) {
  memoryCache = db;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent(CHANGED_EVENT));
}

async function fetchSeed(): Promise<LocalDbShape> {
  const res = await fetch('/api/seed', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Falha ao carregar seed (${res.status})`);
  }
  const data = (await res.json()) as unknown;
  if (!isRecord(data)) {
    throw new Error('Seed inválido');
  }
  return data as LocalDbShape;
}

/** Garante DB no localStorage (seed via /api/seed na primeira visita). */
export async function ensureLocalDb(): Promise<LocalDbShape> {
  assertClient();
  if (memoryCache) return memoryCache;

  const existing = readFromStorage();
  if (existing) {
    memoryCache = existing;
    return existing;
  }

  if (!seedPromise) {
    seedPromise = fetchSeed()
      .then((db) => {
        persist(db);
        return db;
      })
      .finally(() => {
        seedPromise = null;
      });
  }
  return seedPromise;
}

export function subscribeLocalDb(onChange: () => void): () => void {
  assertClient();
  const handler = () => onChange();
  window.addEventListener(CHANGED_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CHANGED_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

/** Apaga o localStorage e recarrega o seed do servidor. */
export async function resetLocalDb(): Promise<LocalDbShape> {
  assertClient();
  memoryCache = null;
  localStorage.removeItem(STORAGE_KEY);
  const db = await fetchSeed();
  persist(db);
  return db;
}

export async function localList<T>(collection: string): Promise<T[]> {
  const db = await ensureLocalDb();
  const data = db[collection];
  if (data === undefined) {
    throw new Error(`Coleção não encontrada: ${collection}`);
  }
  return Array.isArray(data) ? (data as T[]) : [data as T];
}

export async function localGet<T>(collection: string, id: string): Promise<T> {
  const rows = await localList<Record<string, unknown>>(collection);
  const item = rows.find((row) => isRecord(row) && String(row.id) === id);
  if (!item) {
    throw new Error(`Item ${id} não encontrado em ${collection}`);
  }
  return item as T;
}

/** Aceita `students` ou `students/stu-123`. */
export async function localReadPath<T>(path: string): Promise<T> {
  const [collection, id] = path.split('/');
  if (!collection) {
    throw new Error(`Caminho inválido: ${path}`);
  }
  if (id) {
    return localGet<T>(collection, id);
  }
  const list = await localList<T>(collection);
  return list as unknown as T;
}

export async function localCreate<T extends Record<string, unknown>>(
  collection: string,
  payload: T,
): Promise<T & { id: string }> {
  const db = await ensureLocalDb();
  const rows = db[collection];
  if (!Array.isArray(rows)) {
    throw new Error(`Coleção não encontrada ou somente leitura: ${collection}`);
  }

  const id =
    typeof payload.id === 'string' && payload.id.trim()
      ? payload.id
      : newId(ID_PREFIX[collection] ?? 'item');
  const item = { ...payload, id } as T & { id: string };
  const next = [...rows, item];
  persist({ ...db, [collection]: next });
  return item;
}

export async function localUpdate<T extends Record<string, unknown>>(
  collection: string,
  id: string,
  payload: Partial<T>,
): Promise<T & { id: string }> {
  const db = await ensureLocalDb();
  const rows = db[collection];
  if (!Array.isArray(rows)) {
    throw new Error(`Coleção não encontrada: ${collection}`);
  }

  const index = rows.findIndex((row) => isRecord(row) && String(row.id) === id);
  if (index < 0) {
    throw new Error(`Item ${id} não encontrado em ${collection}`);
  }

  const current = rows[index];
  if (!isRecord(current)) {
    throw new Error(`Item inválido em ${collection}/${id}`);
  }

  const nextItem = { ...current, ...payload, id } as T & { id: string };
  const nextRows = [...rows];
  nextRows[index] = nextItem;
  persist({ ...db, [collection]: nextRows });
  return nextItem;
}

export async function localRemove(collection: string, id: string): Promise<void> {
  const db = await ensureLocalDb();
  const rows = db[collection];
  if (!Array.isArray(rows)) {
    throw new Error(`Coleção não encontrada: ${collection}`);
  }

  const index = rows.findIndex((row) => isRecord(row) && String(row.id) === id);
  if (index < 0) {
    throw new Error(`Item ${id} não encontrado em ${collection}`);
  }

  const nextRows = rows.filter((_, i) => i !== index);
  persist({ ...db, [collection]: nextRows });
}
