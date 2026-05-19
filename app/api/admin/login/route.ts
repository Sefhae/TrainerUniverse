import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '../../../../src/lib/auth';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password || email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }
    const token = signToken({ userId: 0, role: 'admin', trainerId: null });
    return NextResponse.json({ token });
  } catch {
    return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  }
}
