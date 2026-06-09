import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../../lib/db';
import { signToken } from '@/lib/auth';
import { validatePassword } from '@/lib/password';
import { checkProfanity } from '@/lib/profanity';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export async function POST(req: NextRequest) {
  try {
  const body = await req.json().catch(() => ({}));
  const { name, email, password, specialties } = body || {};

  if (!name || !String(name).trim())
    return NextResponse.json({ error: 'Your name is required.' }, { status: 400 });
  if (!email || !EMAIL_RE.test(String(email)))
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
  const pwError = validatePassword(String(password ?? ''));
  if (pwError)
    return NextResponse.json({ error: pwError }, { status: 400 });

  const profanity = checkProfanity(name);
  if (profanity)
    return NextResponse.json({ error: profanity }, { status: 400 });

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing)
    return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });

  const passwordHash = bcrypt.hashSync(String(password), 10);

  const { userId, trainerId } = await db.transaction(async (tx) => {
    const newUserId = (await tx
      .prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
      .run(normalizedEmail, passwordHash, 'trainer')).lastInsertRowid as number;

    // Publish new trainers immediately so students can find and request them
    // right after signup (matches admin-created trainers and the schema default).
    // A trainer can still hide their profile from the dashboard afterwards.
    const newTrainerId = (await tx
      .prepare('INSERT INTO trainer_profiles (user_id, name, is_published) VALUES (?, ?, 1)')
      .run(newUserId, String(name).trim())).lastInsertRowid as number;

    if (Array.isArray(specialties)) {
      const findSpec = tx.prepare('SELECT id FROM specialties WHERE name = ?');
      const link = tx.prepare('INSERT INTO trainer_specialties (trainer_id, specialty_id) VALUES (?, ?) ON CONFLICT DO NOTHING');
      for (const s of specialties) {
        const row = (await findSpec.get(s)) as { id: number } | undefined;
        if (row) await link.run(newTrainerId, row.id);
      }
    }
    return { userId: newUserId, trainerId: newTrainerId };
  });
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
