import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '../../../../src/lib/db';
import { signToken } from '../../../../src/lib/auth';
import { validatePassword } from '../../../../src/lib/password';
import { checkProfanity } from '../../../../src/lib/profanity';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name?.trim()) return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    if (!email?.includes('@')) return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    const pwError = validatePassword(String(password ?? ''));
    if (pwError) return NextResponse.json({ error: pwError }, { status: 400 });
    const profanity = checkProfanity(name);
    if (profanity) return NextResponse.json({ error: profanity }, { status: 400 });

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });

    const hash = await bcrypt.hash(password, 10);
    const userResult = db.prepare(
      `INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'student')`
    ).run(email.toLowerCase().trim(), hash);

    const userId = userResult.lastInsertRowid as number;
    const profileResult = db.prepare(
      `INSERT INTO student_profiles (user_id, name) VALUES (?, ?)`
    ).run(userId, name.trim());

    const studentId = profileResult.lastInsertRowid as number;
    const token = signToken({ userId, role: 'student', trainerId: null, studentId });

    return NextResponse.json({
      token,
      user: { id: userId, email: email.toLowerCase().trim(), role: 'student' },
      studentId,
    });
  } catch (err) {
    console.error('student-register error', err);
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
  }
}
