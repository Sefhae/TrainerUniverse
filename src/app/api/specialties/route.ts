import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

// DB-backed and must not be evaluated at build time (no live DB during build).
export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await getServerSupabase();
  const { data } = await supabase.from('specialties').select('id, name').order('name');
  return NextResponse.json(data ?? []);
}
