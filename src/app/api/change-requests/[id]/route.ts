import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { verifyToken, unauthorized, forbidden } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

// PUT /api/change-requests/[id] — approve or reject a change request
export async function PUT(req: NextRequest, { params }: Params) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();

  const { id } = await params;
  const cr = await db.prepare(`
    SELECT cr.*, s.trainer_id, s.student_id
    FROM session_change_requests cr
    JOIN training_sessions s ON s.id = cr.session_id
    WHERE cr.id = ?
  `).get(Number(id)) as
    | { id: number; session_id: number; proposed_at: string; trainer_id: number; student_id: number; requested_by: string }
    | undefined;

  if (!cr) return NextResponse.json({ error: 'Change request not found.' }, { status: 404 });

  const isTrainer = payload.role === 'trainer' && payload.trainerId === cr.trainer_id;
  const isStudent = payload.role === 'student' && payload.studentId === cr.student_id;
  if (!isTrainer && !isStudent) return forbidden();

  const { action } = await req.json(); // 'approve' | 'reject'
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: "action must be 'approve' or 'reject'." }, { status: 400 });
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  await db.prepare('UPDATE session_change_requests SET status = ? WHERE id = ?').run(newStatus, cr.id);

  if (action === 'approve') {
    await db.prepare('UPDATE training_sessions SET scheduled_at = ? WHERE id = ?').run(
      cr.proposed_at,
      cr.session_id
    );
  }

  return NextResponse.json({ success: true });
}
