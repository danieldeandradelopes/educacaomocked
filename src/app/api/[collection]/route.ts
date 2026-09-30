import {
  isRecord,
  jsonError,
  jsonOk,
  MUTABLE_COLLECTIONS,
  newId,
  READONLY_COLLECTIONS,
  readDb,
  writeDb,
} from '@/lib/db';

const ALLOWED = new Set([...MUTABLE_COLLECTIONS, ...READONLY_COLLECTIONS]);

const PREFIX: Record<string, string> = {
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ collection: string }> },
) {
  const { collection } = await context.params;
  if (!ALLOWED.has(collection)) {
    return jsonError(`Unknown collection: ${collection}`);
  }
  const db = readDb();
  const data = db[collection];
  if (data === undefined) {
    return jsonError(`Collection not found: ${collection}`);
  }
  return jsonOk(data);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ collection: string }> },
) {
  const { collection } = await context.params;
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

  const id =
    typeof body.id === 'string' && body.id.trim()
      ? body.id
      : newId(PREFIX[collection] ?? 'item');
  const item = { ...body, id };
  rows.push(item);
  db[collection] = rows;
  writeDb(db);
  return jsonOk(item, { status: 201 });
}
