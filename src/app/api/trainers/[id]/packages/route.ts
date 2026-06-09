import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../lib/db';
import { verifyToken, unauthorized, forbidden } from '@/lib/auth';
import { mapPackage } from '@/lib/serialize';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const rows = (await db
    .prepare('SELECT * FROM pricing_packages WHERE trainer_id = ? ORDER BY price ASC')
    .all(Number(id)) as Record<string, unknown>[]).map(mapPackage);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.trainerId !== Number(id)) return forbidden();

  const body = await req.json().catch(() => ({}));
  const { name, description, sessions, price, isPopular } = body || {};
  if (!name || !String(name).trim())
    return NextResponse.json({ error: 'Package name is required.' }, { status: 400 });

  const info = await db
    .prepare(`
      INSERT INTO pricing_packages (trainer_id, name, description, sessions, price, is_popular)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .run(
      Number(id),
      String(name).trim(),
      description ? String(description) : '',
      Math.max(0, Number(sessions) || 0),
      Math.max(0, Number(price) || 0),
      isPopular ? 1 : 0
    );
  const created = await db.prepare('SELECT * FROM pricing_packages WHERE id = ?').get(info.lastInsertRowid) as Record<string, unknown>;
  return NextResponse.json(mapPackage(created), { status: 201 });
}
