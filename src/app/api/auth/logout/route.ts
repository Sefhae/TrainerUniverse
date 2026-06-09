import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

// Clears the Supabase session cookies.
export async function POST() {
  const supabase = await getServerSupabase();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
