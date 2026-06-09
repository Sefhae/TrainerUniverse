import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../src/lib/db';
import { verifyToken, unauthorized } from '../../../../../src/lib/auth';

// POST /api/admin/student-removals/[id] — approve or reject a removal request.
// body: { action: 'approve' | 'reject' }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  const requestId = Number(id);
  const { action } = await req.json();

  const reqRow = db.prepare(
    `SELECT trainer_id, student_id, status FROM student_removal_requests WHERE id = ?`
  ).get(requestId) as { trainer_id: number; student_id: number; status: string } | undefined;

  if (!reqRow) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
  if (reqRow.status !== 'pending') {
    return NextResponse.json({ error: 'Request already handled.' }, { status: 409 });
  }

  if (action === 'approve') {
    const tx = db.transaction(() => {
      db.prepare('DELETE FROM trainer_students WHERE trainer_id = ? AND student_id = ?')
        .run(reqRow.trainer_id, reqRow.student_id);
      db.prepare(`UPDATE student_removal_requests SET status = 'approved' WHERE id = ?`).run(requestId);
    });
    tx();
  } else if (action === 'reject') {
    db.prepare(`UPDATE student_removal_requests SET status = 'rejected' WHERE id = ?`).run(requestId);
  } else {
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
