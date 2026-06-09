import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { requireAdmin, unauthorized } from '@/lib/supabase-auth';
import { getAdminSupabase } from '@/lib/supabase-admin';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = await getServerSupabase();
  if (!(await requireAdmin(supabase))) return unauthorized();
  const admin = getAdminSupabase();

  const { id } = await params;
  const { data } = await admin
    .from('pricing_packages')
    .select('*')
    .eq('trainer_id', Number(id))
    .order('price', { ascending: true });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest, { params }: Params) {
  const supabase = await getServerSupabase();
  if (!(await requireAdmin(supabase))) return unauthorized();
  const admin = getAdminSupabase();

  const { id } = await params;
  const { name, description, sessions, price, isPopular } = await req.json();

  const { data: created } = await admin
    .from('pricing_packages')
    .insert({
      trainer_id: Number(id),
      name,
      description: description ?? '',
      sessions: Number(sessions) || 1,
      price: Number(price) || 0,
      is_popular: isPopular ? 1 : 0,
    })
    .select('id')
    .single();

  return NextResponse.json({ id: created?.id });
}
