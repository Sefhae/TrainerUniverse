import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { getAuthContext, unauthorized, forbidden } from '@/lib/supabase-auth';
import { mapPackage } from '@/lib/serialize';

type Params = { params: Promise<{ id: string; packageId: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id, packageId } = await params;
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();
  if (ctx.trainerId !== Number(id)) return forbidden();

  const { data: existing } = await supabase
    .from('pricing_packages')
    .select('id')
    .eq('id', Number(packageId))
    .eq('trainer_id', Number(id))
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: 'Package not found.' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { name, description, sessions, price, isPopular } = body || {};

  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = String(name);
  if (description !== undefined) update.description = String(description);
  if (sessions !== undefined) update.sessions = Math.max(0, Number(sessions) || 0);
  if (price !== undefined) update.price = Math.max(0, Number(price) || 0);
  if (isPopular !== undefined) update.is_popular = isPopular ? 1 : 0;

  const { data: updated, error } = await supabase
    .from('pricing_packages')
    .update(update)
    .eq('id', Number(packageId))
    .select('*')
    .single();
  if (error || !updated) return NextResponse.json({ error: 'Could not update package.' }, { status: 500 });
  return NextResponse.json(mapPackage(updated));
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id, packageId } = await params;
  const supabase = await getServerSupabase();
  const ctx = await getAuthContext(supabase);
  if (!ctx) return unauthorized();
  if (ctx.trainerId !== Number(id)) return forbidden();

  const { data: deleted } = await supabase
    .from('pricing_packages')
    .delete()
    .eq('id', Number(packageId))
    .eq('trainer_id', Number(id))
    .select('id');
  if (!deleted || deleted.length === 0)
    return NextResponse.json({ error: 'Package not found.' }, { status: 404 });
  return NextResponse.json({ success: true });
}
