import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../src/lib/db';
import { verifyToken, unauthorized } from '../../../../../src/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  const student = db.prepare('SELECT user_id FROM student_profiles WHERE id = ?').get(Number(id)) as { user_id: number } | undefined;
  if (!student) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });

  db.prepare('DELETE FROM users WHERE id = ?').run(student.user_id);
  return NextResponse.json({ ok: true });
}
