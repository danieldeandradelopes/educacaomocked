import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NextResponse } from 'next/server';

export type DbShape = Record<string, unknown>;

const DB_PATH = join(process.cwd(), 'db', 'db.json');

export const MUTABLE_COLLECTIONS = new Set([
  'schools',
  'students',
  'activeSearch',
  'waitlist',
  'staff',
  'enrollments',
  'tutoring',
  'inclusive',
  'transportRoutes',
  'transportStudents',
  'intersectoral',
  'documents',
  'legislation',
  'history',
  'settings',
]);

export const READONLY_COLLECTIONS = new Set([
  'kpis',
  'attentionPoints',
  'activeSearchTrend',
  'attendanceMonthly',
  'attendanceBySchool',
  'reports',
]);

export function readDb(): DbShape {
  return JSON.parse(readFileSync(DB_PATH, 'utf8')) as DbShape;
}

export function writeDb(db: DbShape): void {
  writeFileSync(DB_PATH, `${JSON.stringify(db, null, 2)}\n`, 'utf8');
}

export function jsonOk(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(message: string, status = 404) {
  return NextResponse.json({ error: message }, { status });
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
