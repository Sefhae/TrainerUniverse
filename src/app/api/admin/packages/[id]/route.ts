import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../lib/db';
import { verifyToken, unauthorized } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  const { name, description, sessions, price, isPopular } = await req.json();

  await db.prepare(
    'UPDATE pricing_packages SET name = ?, description = ?, sessions = ?, price = ?, is_popular = ? WHERE id = ?'
  ).run(name, description ?? '', Number(sessions) || 1, Number(price) || 0, isPopular ? 1 : 0, Number(id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  await db.prepare('DELETE FROM pricing_packages WHERE id = ?').run(Number(id));
  return NextResponse.json({ ok: true });
}
