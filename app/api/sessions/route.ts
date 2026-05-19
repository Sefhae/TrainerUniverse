import { NextRequest, NextResponse } from 'next/server';
import db from '../../../src/lib/db';
import { verifyToken, unauthorized, forbidden } from '../../../src/lib/auth';

function sessionsForTrainer(trainerId: number) {
  return db.prepare(`
    SELECT s.*, sp.name AS student_name,
           cr.id AS cr_id, cr.requested_by, cr.proposed_at, cr.message AS cr_message,
           cr.status AS cr_status, cr.created_at AS cr_created_at
    FROM training_sessions s
    JOIN student_profiles sp ON sp.id = s.student_id
    LEFT JOIN session_change_requests cr
           ON cr.session_id = s.id AND cr.status = 'pending'
    WHERE s.trainer_id = ?
    ORDER BY s.scheduled_at ASC
  `).all(trainerId);
}

function sessionsForStudent(studentId: number) {
  return db.prepare(`
    SELECT s.*, sp.name AS student_name, tp.name AS trainer_name,
           cr.id AS cr_id, cr.requested_by, cr.proposed_at, cr.message AS cr_message,
           cr.status AS cr_status, cr.created_at AS cr_created_at
    FROM training_sessions s
    JOIN student_profiles sp ON sp.id = s.student_id
    JOIN trainer_profiles tp ON tp.id = s.trainer_id
    LEFT JOIN session_change_requests cr
           ON cr.session_id = s.id AND cr.status = 'pending'
    WHERE s.student_id = ?
    ORDER BY s.scheduled_at ASC
  `).all(studentId);
}

function mapSession(r: Record<string, unknown>) {
  return {
    id: r.id,
    trainerId: r.trainer_id,
    studentId: r.student_id,
    studentName: r.student_name,
    trainerName: r.trainer_name,
    title: r.title,
    scheduledAt: r.scheduled_at,
    durationMin: r.duration_min,
    status: r.status,
    notes: r.notes,
    createdAt: r.created_at,
    pendingChangeRequest: r.cr_id
      ? {
          id: r.cr_id,
          sessionId: r.id,
          requestedBy: r.requested_by,
          proposedAt: r.proposed_at,
          message: r.cr_message,
          status: r.cr_status,
          createdAt: r.cr_created_at,
        }
      : null,
  };
}

// GET /api/sessions — fetch sessions for the authenticated user (trainer or student)
export async function GET(req: NextRequest) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();

  if (payload.role === 'trainer' && payload.trainerId) {
    const rows = sessionsForTrainer(payload.trainerId) as Record<string, unknown>[];
    return NextResponse.json(rows.map(mapSession));
  }

  if (payload.role === 'student' && payload.studentId) {
    const rows = sessionsForStudent(payload.studentId) as Record<string, unknown>[];
    return NextResponse.json(rows.map(mapSession));
  }

  return forbidden();
}

// POST /api/sessions — create a session (trainer only)
export async function POST(req: NextRequest) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.role !== 'trainer' || !payload.trainerId) return forbidden();

  const { studentId, title, scheduledAt, durationMin, notes } = await req.json();

  if (!studentId || !scheduledAt) {
    return NextResponse.json({ error: 'studentId and scheduledAt are required.' }, { status: 400 });
  }

  const enrolled = db.prepare(
    'SELECT 1 FROM trainer_students WHERE trainer_id = ? AND student_id = ?'
  ).get(payload.trainerId, studentId);

  if (!enrolled) return NextResponse.json({ error: 'Student not enrolled with this trainer.' }, { status: 403 });

  const result = db.prepare(`
    INSERT INTO training_sessions (trainer_id, student_id, title, scheduled_at, duration_min, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    payload.trainerId,
    studentId,
    title?.trim() || 'Training Session',
    scheduledAt,
    durationMin || 60,
    notes?.trim() || ''
  );

  return NextResponse.json({ id: result.lastInsertRowid });
}
