import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../../lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body || {};

    if (!email || !password)
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });

    const user = await db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(String(email).trim().toLowerCase()) as Record<string, unknown> | undefined;

    if (!user || !bcrypt.compareSync(String(password), user.password_hash as string))
      return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });

    if (user.role === 'student') {
      const profile = await db
        .prepare('SELECT id FROM student_profiles WHERE user_id = ?')
        .get(user.id) as { id: number } | undefined;
      const studentId = profile?.id ?? null;
      const token = signToken({ userId: user.id as number, role: 'student', trainerId: null, studentId });
      return NextResponse.json({
        token,
        user: { id: user.id, email: user.email, role: 'student' },
        studentId,
        trainerId: null,
      });
    }

    const profile = await db
      .prepare('SELECT id FROM trainer_profiles WHERE user_id = ?')
      .get(user.id) as { id: number } | undefined;
    const trainerId = profile?.id ?? null;
    const token = signToken({ userId: user.id as number, role: 'trainer', trainerId });
    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, role: 'trainer' },
      trainerId,
      studentId: null,
    });
  } catch (err) {
    console.error('[unified-login]', err);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
