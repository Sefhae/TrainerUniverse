import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../lib/db';
import { verifyToken, unauthorized, forbidden } from '@/lib/auth';

// POST /api/trainer/students/removal — trainer requests removal of a student.
// The student stays enrolled until a TrainerUniverse admin approves the request.
export async function POST(req: NextRequest) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.role !== 'trainer' || !payload.trainerId) return forbidden();

  const { studentId, reason } = await req.json();
  if (!studentId) return NextResponse.json({ error: 'studentId required.' }, { status: 400 });

  const enrolled = await db.prepare(
    'SELECT 1 FROM trainer_students WHERE trainer_id = ? AND student_id = ?'
  ).get(payload.trainerId, studentId);
  if (!enrolled) return NextResponse.json({ error: 'Student is not enrolled with you.' }, { status: 404 });

  const existing = await db.prepare(
    `SELECT 1 FROM student_removal_requests
      WHERE trainer_id = ? AND student_id = ? AND status = 'pending'`
  ).get(payload.trainerId, studentId);
  if (existing) {
    return NextResponse.json({ error: 'A removal request is already pending for this student.' }, { status: 409 });
  }

  await db.prepare(
    'INSERT INTO student_removal_requests (trainer_id, student_id, reason) VALUES (?, ?, ?)'
  ).run(payload.trainerId, studentId, (reason ?? '').toString().trim());

  return NextResponse.json({ success: true });
}
