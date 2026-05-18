import jwt from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const JWT_SECRET = process.env.JWT_SECRET || 'fitconnect-dev-secret-change-me';
const TOKEN_TTL = '7d';

export interface JwtPayload {
  userId: number;
  role: string;
  trainerId: number | null;
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(req: NextRequest): JwtPayload | null {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function unauthorized(message = 'Authentication required.') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = 'You can only manage your own profile.') {
  return NextResponse.json({ error: message }, { status: 403 });
}
