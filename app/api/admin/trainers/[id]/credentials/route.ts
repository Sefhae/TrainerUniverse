import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../../../../src/lib/db';
import { verifyToken, unauthorized } from '../../../../../../src/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const p = verifyToken(req);
  if (!p || p.role !== 'admin') return unauthorized();

  const { id } = await params;
  const { email, password } = await req.json();

  const trainer = db.prepare('SELECT user_id FROM trainer_profiles WHERE id = ?').get(Number(id)) as { user_id: number } | undefined;
  if (!trainer) return NextResponse.json({ error: 'Trainer not found.' }, { status: 404 });

  if (email) {
    const conflict = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, trainer.user_id);
    if (conflict) return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });
    db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email, trainer.user_id);
  }

  if (password) {
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    const hash = await bcrypt.hash(password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, trainer.user_id);
  }

  return NextResponse.json({ ok: true });
}
