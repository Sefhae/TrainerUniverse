import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { verifyToken, unauthorized, forbidden } from '@/lib/auth';

// PUT /api/session-requests/[id] — trainer approves or rejects
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.role !== 'trainer' || !payload.trainerId) return forbidden();

  const { id } = await params;
  const requestId = Number(id);

  const row = await db.prepare(
    `SELECT * FROM session_requests WHERE id = ? AND trainer_id = ?`
  ).get(requestId, payload.trainerId) as Record<string, unknown> | undefined;

  if (!row) {
    return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
  }
  if (row.status !== 'pending') {
    return NextResponse.json({ error: 'Request has already been resolved.' }, { status: 409 });
  }

  const { action } = await req.json() as { action: 'approve' | 'reject' };
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'action must be "approve" or "reject".' }, { status: 400 });
  }

  if (action === 'approve') {
    await db.transaction(async (tx) => {
      await tx.prepare(`UPDATE session_requests SET status = 'approved' WHERE id = ?`).run(requestId);
      // Enroll student if not already enrolled
      await tx.prepare(`
        INSERT INTO trainer_students (trainer_id, student_id) VALUES (?, ?) ON CONFLICT DO NOTHING
      `).run(payload.trainerId, row.student_id);
    });
  } else {
    await db.prepare(`UPDATE session_requests SET status = 'rejected' WHERE id = ?`).run(requestId);
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/session-requests/[id] — student cancels (withdraws) their own
// still-pending request.
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.role !== 'student' || !payload.studentId) return forbidden();

  const { id } = await params;
  const requestId = Number(id);

  const row = await db.prepare(
    `SELECT status FROM session_requests WHERE id = ? AND student_id = ?`
  ).get(requestId, payload.studentId) as { status: string } | undefined;

  if (!row) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
  if (row.status !== 'pending') {
    return NextResponse.json({ error: 'Only pending requests can be cancelled.' }, { status: 409 });
  }

  await db.prepare(`DELETE FROM session_requests WHERE id = ?`).run(requestId);
  return NextResponse.json({ ok: true });
}
