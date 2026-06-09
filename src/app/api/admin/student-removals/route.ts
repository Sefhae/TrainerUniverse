import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { verifyToken, unauthorized } from '@/lib/auth';

// GET /api/admin/student-removals — list pending student removal requests
export async function GET(req: NextRequest) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const rows = await db.prepare(`
    SELECT r.id, r.reason, r.created_at, r.trainer_id, r.student_id,
           tp.name AS trainer_name,
           sp.name AS student_name,
           u.email AS student_email
    FROM student_removal_requests r
    JOIN trainer_profiles tp ON tp.id = r.trainer_id
    JOIN student_profiles sp ON sp.id = r.student_id
    JOIN users u ON u.id = sp.user_id
    WHERE r.status = 'pending'
    ORDER BY r.created_at DESC
  `).all();

  return NextResponse.json(rows);
}
