import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { verifyToken, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const rows = await db.prepare(`
    SELECT
      sp.id,
      sp.name,
      sp.created_at,
      u.email,
      (SELECT tp.name
       FROM trainer_students ts
       JOIN trainer_profiles tp ON tp.id = ts.trainer_id
       WHERE ts.student_id = sp.id
       LIMIT 1) AS trainer_name,
      (SELECT COUNT(*) FROM training_sessions sess WHERE sess.student_id = sp.id) AS session_count
    FROM student_profiles sp
    JOIN users u ON u.id = sp.user_id
    ORDER BY sp.created_at DESC
  `).all();

  return NextResponse.json(rows);
}
