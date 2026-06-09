import { NextResponse } from 'next/server';
import db from '../../../lib/db';

// DB-backed and must not be evaluated at build time (no live DB during build).
export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await db.prepare('SELECT id, name FROM specialties ORDER BY name').all();
  return NextResponse.json(rows);
}
