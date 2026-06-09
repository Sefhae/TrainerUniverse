import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../lib/db';
import { verifyToken, unauthorized } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  const { title, scheduledAt, durationMin, status, notes } = await req.json();

  await db.prepare(
    'UPDATE training_sessions SET title = ?, scheduled_at = ?, duration_min = ?, status = ?, notes = ? WHERE id = ?'
  ).run(title, scheduledAt, Number(durationMin) || 60, status, notes ?? '', Number(id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  const result = await db.prepare('DELETE FROM training_sessions WHERE id = ?').run(Number(id));
  if (result.changes === 0) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
