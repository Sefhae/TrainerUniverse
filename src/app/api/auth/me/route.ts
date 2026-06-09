import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { verifyToken, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();

  const user = await db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(payload.userId) as Record<string, unknown> | undefined;
  if (!user) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
  return NextResponse.json({ user, trainerId: payload.trainerId });
}
