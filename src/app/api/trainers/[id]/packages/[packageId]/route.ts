import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../../lib/db';
import { verifyToken, unauthorized, forbidden } from '@/lib/auth';
import { mapPackage } from '@/lib/serialize';

type Params = { params: Promise<{ id: string; packageId: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id, packageId } = await params;
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.trainerId !== Number(id)) return forbidden();

  const existing = await db
    .prepare('SELECT * FROM pricing_packages WHERE id = ? AND trainer_id = ?')
    .get(Number(packageId), Number(id)) as Record<string, unknown> | undefined;
  if (!existing) return NextResponse.json({ error: 'Package not found.' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { name, description, sessions, price, isPopular } = body || {};

  await db.prepare(`
    UPDATE pricing_packages SET name = ?, description = ?, sessions = ?, price = ?, is_popular = ?
    WHERE id = ?
  `).run(
    name !== undefined ? String(name) : existing.name,
    description !== undefined ? String(description) : existing.description,
    sessions !== undefined ? Math.max(0, Number(sessions) || 0) : existing.sessions,
    price !== undefined ? Math.max(0, Number(price) || 0) : existing.price,
    isPopular !== undefined ? (isPopular ? 1 : 0) : existing.is_popular,
    Number(packageId)
  );

  const updated = await db.prepare('SELECT * FROM pricing_packages WHERE id = ?').get(Number(packageId)) as Record<string, unknown>;
  return NextResponse.json(mapPackage(updated));
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, packageId } = await params;
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.trainerId !== Number(id)) return forbidden();

  const info = await db
    .prepare('DELETE FROM pricing_packages WHERE id = ? AND trainer_id = ?')
    .run(Number(packageId), Number(id));
  if (!info.changes) return NextResponse.json({ error: 'Package not found.' }, { status: 404 });
  return NextResponse.json({ success: true });
}
