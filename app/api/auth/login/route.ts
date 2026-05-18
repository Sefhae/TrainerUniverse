import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../../src/lib/db';
import { signToken } from '../../../../src/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body || {};
  if (!email || !password)
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim().toLowerCase()) as Record<string, unknown> | undefined;
  if (!user || !bcrypt.compareSync(String(password), user.password_hash as string))
    return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });

  const profile = db.prepare('SELECT id FROM trainer_profiles WHERE user_id = ?').get(user.id) as { id: number } | undefined;
  const trainerId = profile ? profile.id : null;
  const token = signToken({ userId: user.id as number, role: user.role as string, trainerId });
  return NextResponse.json({
    token,
    user: { id: user.id, email: user.email, role: user.role },
    trainerId,
  });
}
