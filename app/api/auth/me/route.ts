import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../src/lib/db';
import { verifyToken, unauthorized } from '../../../../src/lib/auth';

export function GET(req: NextRequest) {
  const payload = verifyToken(req);
  if (!payload) return unauthorized();

  const user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(payload.userId) as Record<string, unknown> | undefined;
  if (!user) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
  return NextResponse.json({ user, trainerId: payload.trainerId });
}
