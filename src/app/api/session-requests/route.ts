import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';
import { verifyToken, unauthorized, forbidden } from '../../../lib/auth';

// POST /api/session-requests — student submits a booking request
export async function POST(req: NextRequest) {
  try {
    const payload = verifyToken(req);
    if (!payload) return unauthorized();
    if (payload.role !== 'student' || !payload.studentId) return forbidden();

    const { trainerId, packageId, message } = await req.json();
    if (!trainerId) {
      return NextResponse.json({ error: 'trainerId is required.' }, { status: 400 });
    }

    // The trainer (and our own student profile) must still exist — on a fresh/
    // reset database the JWT can reference rows that are gone, which would
    // otherwise surface as an opaque 500.
    const trainerExists = await db.prepare('SELECT id FROM trainer_profiles WHERE id = ?').get(trainerId);
    if (!trainerExists) {
      return NextResponse.json({ error: 'That trainer is no longer available.' }, { status: 404 });
    }
    const meExists = await db.prepare('SELECT id FROM student_profiles WHERE id = ?').get(payload.studentId);
    if (!meExists) {
      return NextResponse.json({ error: 'Your session has expired. Please log in again.' }, { status: 401 });
    }

    // Prevent duplicate pending request
    const existing = await db.prepare(
      `SELECT id FROM session_requests WHERE trainer_id = ? AND student_id = ? AND status = 'pending'`
    ).get(trainerId, payload.studentId);
    if (existing) {
      return NextResponse.json({ error: 'You already have a pending request with this trainer.' }, { status: 409 });
    }

    const result = await db.prepare(
      `INSERT INTO session_requests (trainer_id, student_id, package_id, message) VALUES (?, ?, ?, ?)`
    ).run(trainerId, payload.studentId, packageId ?? null, message?.trim() ?? '');

    return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
  } catch (err) {
    console.error('[session-requests POST]', err);
    return NextResponse.json({ error: 'Could not send your request. Please try again.' }, { status: 500 });
  }
}

// GET /api/session-requests — trainer sees incoming requests; a student sees
// the requests they've sent (with the trainer + status).
export async function GET(req: NextRequest) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();

  if (payload.role === 'student' && payload.studentId) {
    const rows = await db.prepare(`
      SELECT sr.id, sr.trainer_id, sr.package_id, sr.message, sr.status, sr.created_at,
             tp.name AS trainer_name, tp.profile_photo AS trainer_photo,
             pp.name AS package_name
      FROM session_requests sr
      JOIN trainer_profiles tp ON tp.id = sr.trainer_id
      LEFT JOIN pricing_packages pp ON pp.id = sr.package_id
      WHERE sr.student_id = ?
      ORDER BY sr.created_at DESC
    `).all(payload.studentId) as Record<string, unknown>[];

    return NextResponse.json(rows.map((r) => ({
      id: r.id,
      trainerId: r.trainer_id,
      trainerName: r.trainer_name,
      trainerPhoto: r.trainer_photo,
      packageId: r.package_id,
      packageName: r.package_name,
      message: r.message,
      status: r.status,
      createdAt: r.created_at,
    })));
  }

  if (payload.role !== 'trainer' || !payload.trainerId) return forbidden();

  const rows = await db.prepare(`
    SELECT sr.id, sr.trainer_id, sr.student_id, sr.package_id, sr.message, sr.status, sr.created_at,
           sp.name AS student_name, u.email AS student_email,
           pp.name AS package_name
    FROM session_requests sr
    JOIN student_profiles sp ON sp.id = sr.student_id
    JOIN users u ON u.id = sp.user_id
    LEFT JOIN pricing_packages pp ON pp.id = sr.package_id
    WHERE sr.trainer_id = ?
    ORDER BY sr.created_at DESC
  `).all(payload.trainerId) as Record<string, unknown>[];

  return NextResponse.json(rows.map((r) => ({
    id: r.id,
    trainerId: r.trainer_id,
    studentId: r.student_id,
    studentName: r.student_name,
    studentEmail: r.student_email,
    packageId: r.package_id,
    packageName: r.package_name,
    message: r.message,
    status: r.status,
    createdAt: r.created_at,
  })));
}
