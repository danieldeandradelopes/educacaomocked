import { jsonOk, readDb } from '@/lib/db';

/** Snapshot read-only do mock para hidratar o localStorage no cliente. */
export async function GET() {
  return jsonOk(readDb());
}
