import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../src/lib/db';
import { verifyToken, unauthorized, forbidden } from '../../../../src/lib/auth';

// GET /api/trainer/students — list all students enrolled with the auth'd trainer
export async function GET(req: NextRequest) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.role !== 'trainer' || !payload.trainerId) return forbidden();

  const rows = db.prepare(`
    SELECT sp.id, sp.name, u.email, ts_rel.enrolled_at,
           COUNT(sess.id) AS session_count,
           (SELECT COUNT(*) FROM student_removal_requests r
             WHERE r.trainer_id = ts_rel.trainer_id AND r.student_id = sp.id AND r.status = 'pending')
             AS removal_pending
    FROM trainer_students ts_rel
    JOIN student_profiles sp ON sp.id = ts_rel.student_id
    JOIN users u ON u.id = sp.user_id
    LEFT JOIN training_sessions sess
           ON sess.student_id = sp.id AND sess.trainer_id = ts_rel.trainer_id
    WHERE ts_rel.trainer_id = ?
    GROUP BY sp.id
    ORDER BY ts_rel.enrolled_at DESC
  `).all(payload.trainerId) as Array<{
    id: number;
    name: string;
    email: string;
    enrolled_at: string;
    session_count: number;
    removal_pending: number;
  }>;

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      enrolledAt: r.enrolled_at,
      sessionCount: r.session_count,
      removalPending: r.removal_pending > 0,
    }))
  );
}

// POST /api/trainer/students — enroll a student by email
export async function POST(req: NextRequest) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.role !== 'trainer' || !payload.trainerId) return forbidden();

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });

  const user = db.prepare(`SELECT id FROM users WHERE email = ? AND role = 'student'`).get(
    email.toLowerCase().trim()
  ) as { id: number } | undefined;

  if (!user) return NextResponse.json({ error: 'No student found with that email.' }, { status: 404 });

  const profile = db.prepare('SELECT id FROM student_profiles WHERE user_id = ?').get(user.id) as
    | { id: number }
    | undefined;

  if (!profile) return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });

  const existing = db.prepare(
    'SELECT 1 FROM trainer_students WHERE trainer_id = ? AND student_id = ?'
  ).get(payload.trainerId, profile.id);

  if (existing) return NextResponse.json({ error: 'Student is already enrolled.' }, { status: 409 });

  db.prepare(
    'INSERT INTO trainer_students (trainer_id, student_id) VALUES (?, ?)'
  ).run(payload.trainerId, profile.id);

  return NextResponse.json({ success: true, studentId: profile.id });
}

// Direct removal is no longer allowed — trainers must request removal and a
// TrainerUniverse admin approves it (see app/api/trainer/students/removal).
