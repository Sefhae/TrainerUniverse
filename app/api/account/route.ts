import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../src/lib/db';
import { verifyToken, unauthorized } from '../../../src/lib/auth';
import { validatePassword } from '../../../src/lib/password';

// PUT /api/account — the logged-in user updates their own email and/or password.
// Requires the current password to authorize any change.
export async function PUT(req: NextRequest) {
  const p = verifyToken(req);
  if (!p) return unauthorized();

  const { currentPassword, email, password } = await req.json();

  const user = db.prepare('SELECT id, email, password_hash FROM users WHERE id = ?').get(p.userId) as
    | { id: number; email: string; password_hash: string }
    | undefined;
  if (!user) return unauthorized();

  if (!currentPassword) {
    return NextResponse.json({ error: 'Your current password is required.' }, { status: 400 });
  }
  const ok = await bcrypt.compare(currentPassword, user.password_hash);
  if (!ok) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 403 });

  const newEmail = (email ?? '').toString().trim().toLowerCase();
  if (newEmail && newEmail !== user.email) {
    if (!/^\S+@\S+\.\S+$/.test(newEmail)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
    }
    const conflict = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(newEmail, user.id);
    if (conflict) return NextResponse.json({ error: 'That email is already in use.' }, { status: 409 });
    db.prepare('UPDATE users SET email = ? WHERE id = ?').run(newEmail, user.id);
  }

  if (password) {
    const err = validatePassword(password);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    const hash = await bcrypt.hash(password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
  }

  return NextResponse.json({ ok: true, email: newEmail || user.email });
}
