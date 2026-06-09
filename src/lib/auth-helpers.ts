import { NextResponse } from 'next/server';
import type { AuthError } from '@supabase/supabase-js';
import type { AuthContext } from '@/lib/supabase-auth';

/** Normalise an email the same way everywhere: trimmed + lowercased. */
export function normalizeEmail(email: unknown): string {
  return String(email ?? '').trim().toLowerCase();
}

/** Shape returned to the client after a successful sign-in / sign-up. */
export function authResponse(ctx: AuthContext, status = 200) {
  return NextResponse.json(
    {
      user: { id: ctx.userId, email: ctx.email, role: ctx.role },
      trainerId: ctx.trainerId,
      studentId: ctx.studentId,
    },
    { status }
  );
}

/** Turn a Supabase auth error into a friendly message + HTTP status. */
export function authErrorResponse(error: AuthError) {
  const msg = error.message.toLowerCase();
  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return NextResponse.json(
      { error: 'An account with that email already exists.' },
      { status: 409 }
    );
  }
  if (msg.includes('invalid login credentials')) {
    return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
  }
  return NextResponse.json({ error: error.message }, { status: 400 });
}
