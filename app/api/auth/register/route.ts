import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../../src/lib/db';
import { signToken } from '../../../../src/lib/auth';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export async function POST(req: NextRequest) {
  try {
  const body = await req.json().catch(() => ({}));
  const { name, email, password, specialties } = body || {};

  if (!name || !String(name).trim())
    return NextResponse.json({ error: 'Your name is required.' }, { status: 400 });
  if (!email || !EMAIL_RE.test(String(email)))
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
  if (!password || String(password).length < 6)
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing)
    return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });

  const passwordHash = bcrypt.hashSync(String(password), 10);

  const create = db.transaction(() => {
    const userId = db
      .prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
      .run(normalizedEmail, passwordHash, 'trainer').lastInsertRowid as number;

    const trainerId = db
      .prepare('INSERT INTO trainer_profiles (user_id, name, is_published) VALUES (?, ?, 0)')
      .run(userId, String(name).trim()).lastInsertRowid as number;

    if (Array.isArray(specialties)) {
      const findSpec = db.prepare('SELECT id FROM specialties WHERE name = ?');
      const link = db.prepare('INSERT OR IGNORE INTO trainer_specialties (trainer_id, specialty_id) VALUES (?, ?)');
      for (const s of specialties) {
        const row = findSpec.get(s) as { id: number } | undefined;
        if (row) link.run(trainerId, row.id);
      }
    }
    return { userId, trainerId };
  });

  const { userId, trainerId } = create();
  const token = signToken({ userId, role: 'trainer', trainerId });
  return NextResponse.json(
    { token, user: { id: userId, email: normalizedEmail, role: 'trainer' }, trainerId },
    { status: 201 }
  );
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
