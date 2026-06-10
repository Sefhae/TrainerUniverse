import { NextRequest, NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext } from '@/lib/supabase-auth';

// Where Supabase sends the user after they click the confirmation email link.
// We establish the session from the link, then send them to the right dashboard.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  const supabase = await getServerSupabase();
  let ok = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  }

  if (ok) {
    const ctx = await getAuthContext(supabase);
    if (ctx) {
      const dest = ctx.role === 'student' ? '/student/dashboard' : '/dashboard';
      return NextResponse.redirect(`${origin}${dest}`);
    }
    // Authenticated but no app profile yet (a brand-new Google sign-in) →
    // send them to pick a role, which creates their profile.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) return NextResponse.redirect(`${origin}/welcome`);
  }

  // Link invalid or expired — bounce to login with a hint.
  return NextResponse.redirect(`${origin}/login?confirmed=error`);
}
