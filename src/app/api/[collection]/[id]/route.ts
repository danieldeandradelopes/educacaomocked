import {
  isRecord,
  jsonError,
  jsonOk,
  MUTABLE_COLLECTIONS,
  readDb,
  writeDb,
} from '@/lib/db';

export async function GET(
  _request: Request,
  context: { params: Promise<{ collection: string; id: string }> },
) {
  const { collection, id } = await context.params;
  const db = readDb();
  const rows = db[collection];
  if (!Array.isArray(rows)) {
    return jsonError(`Collection not found: ${collection}`);
  }
  const item = rows.find((row) => isRecord(row) && String(row.id) === id);
  if (!item) {
    return jsonError(`Item ${id} not found in ${collection}`);
  }
  return jsonOk(item);
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ collection: string; id: string }> },
) {
  return upsert(request, context, 'put');
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ collection: string; id: string }> },
) {
  return upsert(request, context, 'patch');
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ collection: string; id: string }> },
) {
  const { collection, id } = await context.params;
  if (!MUTABLE_COLLECTIONS.has(collection)) {
    return jsonError(`Collection is read-only: ${collection}`, 405);
  }

  const db = readDb();
  const rows = db[collection];
  if (!Array.isArray(rows)) {
    return jsonError(`Collection not found: ${collection}`);
  }

  const index = rows.findIndex((row) => isRecord(row) && String(row.id) === id);
  if (index < 0) {
    return jsonError(`Item ${id} not found in ${collection}`);
  }

  const [removed] = rows.splice(index, 1);
  db[collection] = rows;
  writeDb(db);
  return jsonOk(removed);
}

async function upsert(
  request: Request,
  context: { params: Promise<{ collection: string; id: string }> },
  mode: 'put' | 'patch',
) {
  const { collection, id } = await context.params;
  if (!MUTABLE_COLLECTIONS.has(collection)) {
    return jsonError(`Collection is read-only: ${collection}`, 405);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }
  if (!isRecord(body)) {
    return jsonError('Body must be an object', 400);
  }

  const db = readDb();
  const rows = db[collection];
  if (!Array.isArray(rows)) {
    return jsonError(`Collection not found: ${collection}`);
  }

  const index = rows.findIndex((row) => isRecord(row) && String(row.id) === id);
  if (index < 0) {
    return jsonError(`Item ${id} not found in ${collection}`);
  }

  const current = rows[index];
  if (!isRecord(current)) {
    return jsonError(`Invalid item at ${id}`, 500);
  }

  const next =
    mode === 'put'
      ? { ...body, id }
      : { ...current, ...body, id };

  rows[index] = next;
  db[collection] = rows;
  writeDb(db);
  return jsonOk(next);
}
