import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { verifyToken, unauthorized, forbidden } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

// PUT /api/sessions/[id] — update a session (trainer only)
export async function PUT(req: NextRequest, { params }: Params) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.role !== 'trainer' || !payload.trainerId) return forbidden();

  const { id } = await params;
  const session = await db.prepare('SELECT * FROM training_sessions WHERE id = ?').get(Number(id)) as
    | { trainer_id: number }
    | undefined;

  if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  if (session.trainer_id !== payload.trainerId) return forbidden();

  const { title, scheduledAt, durationMin, notes, status } = await req.json();

  await db.prepare(`
    UPDATE training_sessions
    SET title = COALESCE(?, title),
        scheduled_at = COALESCE(?, scheduled_at),
        duration_min = COALESCE(?, duration_min),
        notes = COALESCE(?, notes),
        status = COALESCE(?, status)
    WHERE id = ?
  `).run(title ?? null, scheduledAt ?? null, durationMin ?? null, notes ?? null, status ?? null, Number(id));

  return NextResponse.json({ success: true });
}

// DELETE /api/sessions/[id] — delete a session (trainer only)
export async function DELETE(req: NextRequest, { params }: Params) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.role !== 'trainer' || !payload.trainerId) return forbidden();

  const { id } = await params;
  const session = await db.prepare('SELECT * FROM training_sessions WHERE id = ?').get(Number(id)) as
    | { trainer_id: number }
    | undefined;

  if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
  if (session.trainer_id !== payload.trainerId) return forbidden();

  await db.prepare('DELETE FROM training_sessions WHERE id = ?').run(Number(id));
  return NextResponse.json({ success: true });
}
