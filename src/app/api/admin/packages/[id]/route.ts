import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { requireAdmin, unauthorized } from '@/lib/supabase-auth';
import { getAdminSupabase } from '@/lib/supabase-admin';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const supabase = await getServerSupabase();
  if (!(await requireAdmin(supabase))) return unauthorized();
  const admin = getAdminSupabase();

  const { id } = await params;
  const { name, description, sessions, price, isPopular } = await req.json();

  await admin
    .from('pricing_packages')
    .update({
      name,
      description: description ?? '',
      sessions: Number(sessions) || 1,
      price: Number(price) || 0,
      is_popular: isPopular ? 1 : 0,
    })
    .eq('id', Number(id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = await getServerSupabase();
  if (!(await requireAdmin(supabase))) return unauthorized();
  const admin = getAdminSupabase();

  const { id } = await params;
  await admin.from('pricing_packages').delete().eq('id', Number(id));
  return NextResponse.json({ ok: true });
}
