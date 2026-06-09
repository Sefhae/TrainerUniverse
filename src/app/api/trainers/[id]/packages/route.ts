import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized, forbidden } from '@/lib/supabase-auth';
import { mapPackage } from '@/lib/serialize';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await getServerSupabase();
  const { data } = await supabase
    .from('pricing_packages')
    .select('*')
    .eq('trainer_id', Number(id))
    .order('price', { ascending: true });
  return NextResponse.json((data ?? []).map(mapPackage));
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();
  if (ctx.trainerId !== Number(id)) return forbidden();

  const body = await req.json().catch(() => ({}));
  const { name, description, sessions, price, isPopular } = body || {};
  if (!name || !String(name).trim())
    return NextResponse.json({ error: 'Package name is required.' }, { status: 400 });

  const { data: created, error } = await supabase
    .from('pricing_packages')
    .insert({
      trainer_id: Number(id),
      name: String(name).trim(),
      description: description ? String(description) : '',
      sessions: Math.max(0, Number(sessions) || 0),
      price: Math.max(0, Number(price) || 0),
      is_popular: isPopular ? 1 : 0,
    })
    .select('*')
    .single();
  if (error || !created) return NextResponse.json({ error: 'Could not create package.' }, { status: 500 });
  return NextResponse.json(mapPackage(created), { status: 201 });
}
