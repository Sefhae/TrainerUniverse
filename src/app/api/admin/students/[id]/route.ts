import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../../../lib/db';
import { verifyToken, unauthorized } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  const row = await db.prepare(`
    SELECT sp.id, sp.name, sp.created_at, u.id AS user_id, u.email
    FROM student_profiles sp
    JOIN users u ON u.id = sp.user_id
    WHERE sp.id = ?
  `).get(Number(id));
  if (!row) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  const { name, email, password } = await req.json();

  const student = await db.prepare('SELECT user_id FROM student_profiles WHERE id = ?').get(Number(id)) as { user_id: number } | undefined;
  if (!student) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });

  if (name) {
    await db.prepare('UPDATE student_profiles SET name = ? WHERE id = ?').run(name, Number(id));
  }

  if (email) {
    const conflict = await db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, student.user_id);
    if (conflict) return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });
    await db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email, student.user_id);
  }

  if (password) {
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    const hash = await bcrypt.hash(password, 10);
    await db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, student.user_id);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  const student = await db.prepare('SELECT user_id FROM student_profiles WHERE id = ?').get(Number(id)) as { user_id: number } | undefined;
  if (!student) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });

  await db.prepare('DELETE FROM users WHERE id = ?').run(student.user_id);
  return NextResponse.json({ ok: true });
}
