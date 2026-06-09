import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../lib/db';
import { verifyToken, unauthorized, forbidden } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

// POST /api/sessions/[id]/change-requests — submit a reschedule request
export async function POST(req: NextRequest, { params }: Params) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();

  const { id } = await params;
  const sessionId = Number(id);

  const session = await db.prepare('SELECT * FROM training_sessions WHERE id = ?').get(sessionId) as
    | { id: number; trainer_id: number; student_id: number }
    | undefined;

  if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 });

  const isTrainer = payload.role === 'trainer' && payload.trainerId === session.trainer_id;
  const isStudent = payload.role === 'student' && payload.studentId === session.student_id;
  if (!isTrainer && !isStudent) return forbidden();

  const { proposedAt, message } = await req.json();
  if (!proposedAt) return NextResponse.json({ error: 'proposedAt is required.' }, { status: 400 });

  // Cancel any existing pending request first
  await db.prepare(
    `UPDATE session_change_requests SET status = 'rejected' WHERE session_id = ? AND status = 'pending'`
  ).run(sessionId);

  const result = await db.prepare(`
    INSERT INTO session_change_requests (session_id, requested_by, proposed_at, message)
    VALUES (?, ?, ?, ?)
  `).run(sessionId, payload.role, proposedAt, message?.trim() || '');

  return NextResponse.json({ id: result.lastInsertRowid });
}
