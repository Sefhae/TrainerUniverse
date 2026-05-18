import { NextResponse } from 'next/server';
import db from '../../../src/lib/db';

export function GET() {
  const rows = db.prepare('SELECT id, name FROM specialties ORDER BY name').all();
  return NextResponse.json(rows);
}
