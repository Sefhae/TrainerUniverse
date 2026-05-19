import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../src/lib/db';
import { verifyToken, unauthorized } from '../../../../../src/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  const result = db.prepare('DELETE FROM training_sessions WHERE id = ?').run(Number(id));
  if (result.changes === 0) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
