import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../src/lib/db';
import { verifyToken, unauthorized } from '../../../../src/lib/auth';

export async function GET(req: NextRequest) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const rows = db.prepare(`
    SELECT
      tp.id,
      tp.name,
      tp.is_published,
      tp.created_at,
      u.email,
      (SELECT GROUP_CONCAT(s.name, ', ')
       FROM trainer_specialties tspc
       JOIN specialties s ON s.id = tspc.specialty_id
       WHERE tspc.trainer_id = tp.id) AS specialties,
      (SELECT COUNT(*) FROM trainer_students ts WHERE ts.trainer_id = tp.id) AS student_count,
      (SELECT COUNT(*) FROM training_sessions sess WHERE sess.trainer_id = tp.id) AS session_count
    FROM trainer_profiles tp
    JOIN users u ON u.id = tp.user_id
    ORDER BY tp.created_at DESC
  `).all();

  return NextResponse.json(rows);
}
