import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../../src/lib/db';
import { verifyToken, unauthorized } from '../../../../../../src/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  const packages = db
    .prepare('SELECT * FROM pricing_packages WHERE trainer_id = ? ORDER BY price ASC')
    .all(Number(id));
  return NextResponse.json(packages);
}

export async function POST(req: NextRequest, { params }: Params) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  const { name, description, sessions, price, isPopular } = await req.json();

  const result = db.prepare(
    'INSERT INTO pricing_packages (trainer_id, name, description, sessions, price, is_popular) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(Number(id), name, description ?? '', Number(sessions) || 1, Number(price) || 0, isPopular ? 1 : 0);

  return NextResponse.json({ id: result.lastInsertRowid });
}
