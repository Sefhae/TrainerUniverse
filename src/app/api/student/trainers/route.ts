import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { verifyToken, unauthorized, forbidden } from '@/lib/auth';

// GET /api/student/trainers — trainers the authenticated student is enrolled
// with (i.e. trainers who approved their request). Drives the student's
// "My Trainer" card and messaging, independent of any scheduled sessions.
export async function GET(req: NextRequest) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();
  if (payload.role !== 'student' || !payload.studentId) return forbidden();

  const rows = await db.prepare(`
    SELECT tp.id, tp.name, tp.tagline, tp.profile_photo, ts.enrolled_at
    FROM trainer_students ts
    JOIN trainer_profiles tp ON tp.id = ts.trainer_id
    WHERE ts.student_id = ?
    ORDER BY ts.enrolled_at DESC
  `).all(payload.studentId) as Array<{
    id: number;
    name: string;
    tagline: string;
    profile_photo: string;
    enrolled_at: string;
  }>;

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      tagline: r.tagline,
      profilePhoto: r.profile_photo,
      enrolledAt: r.enrolled_at,
    }))
  );
}
