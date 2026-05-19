import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../src/lib/db';
import { verifyToken, unauthorized } from '../../../../src/lib/auth';

export async function GET(req: NextRequest) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const rows = db.prepare(`
    SELECT
      s.id,
      s.title,
      s.scheduled_at,
      s.duration_min,
      s.status,
      s.notes,
      s.created_at,
      tp.name AS trainer_name,
      sp.name AS student_name
    FROM training_sessions s
    JOIN trainer_profiles tp ON tp.id = s.trainer_id
    JOIN student_profiles sp ON sp.id = s.student_id
    ORDER BY s.scheduled_at DESC
  `).all();

  return NextResponse.json(rows);
}
