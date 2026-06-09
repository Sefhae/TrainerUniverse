import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../../lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await db.prepare(`SELECT * FROM users WHERE email = ? AND role = 'student'`).get(
      email.toLowerCase().trim()
    ) as { id: number; email: string; password_hash: string; role: string } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const profile = await db.prepare('SELECT id FROM student_profiles WHERE user_id = ?').get(user.id) as
      | { id: number }
      | undefined;

    const studentId = profile?.id ?? null;
    const token = signToken({ userId: user.id, role: 'student', trainerId: null, studentId });

    return NextResponse.json({
      token,
      user: { id: user.id, email: user.email, role: 'student' },
      studentId,
    });
  } catch (err) {
    console.error('student-login error', err);
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 });
  }
}
