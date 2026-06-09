import { NextResponse } from 'next/server';
import type { ServerSupabase } from '@/lib/supabase-server';

/**
 * Who the current request is, resolved from the Supabase session cookie.
 * This replaces the old JWT `verifyToken` payload.
 */
export interface AuthContext {
  authId: string;          // Supabase auth.users UUID
  userId: number;          // app users.id
  email: string;
  role: string;            // 'trainer' | 'student' | 'admin'
  trainerId: number | null;
  studentId: number | null;
}

/**
 * Resolve the logged-in user from the Supabase session, then map them to the
 * app's `users` row plus their trainer/student profile id. Returns null when
 * there is no valid session.
 */
export async function getAuthContext(supabase: ServerSupabase): Promise<AuthContext | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: appUser } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('auth_id', user.id)
    .maybeSingle();
  if (!appUser) return null;

  let trainerId: number | null = null;
  let studentId: number | null = null;

  if (appUser.role === 'student') {
    const { data: sp } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('user_id', appUser.id)
      .maybeSingle();
    studentId = sp?.id ?? null;
  } else {
    const { data: tp } = await supabase
      .from('trainer_profiles')
      .select('id')
      .eq('user_id', appUser.id)
      .maybeSingle();
    trainerId = tp?.id ?? null;
  }

  return {
    authId: user.id,
    userId: appUser.id,
    email: appUser.email,
    role: appUser.role,
    trainerId,
    studentId,
  };
}

/**
 * Verify the request belongs to an admin. Returns the auth context on success,
 * or null (the caller should respond with unauthorized()). The check runs on
 * the cookie-bound client; admin *operations* should use getAdminSupabase().
 */
export async function requireAdmin(supabase: ServerSupabase): Promise<AuthContext | null> {
  const ctx = await getAuthContext(supabase);
  return ctx && ctx.role === 'admin' ? ctx : null;
}

export function unauthorized(message = 'Authentication required.') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = 'You can only manage your own profile.') {
  return NextResponse.json({ error: message }, { status: 403 });
}
