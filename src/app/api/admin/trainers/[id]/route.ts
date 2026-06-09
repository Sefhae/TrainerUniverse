import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { requireAdmin, unauthorized } from '@/lib/supabase-auth';
import { getAdminSupabase } from '@/lib/supabase-admin';

type Params = { params: Promise<{ id: string }> };

function one<T>(v: T | T[] | null | undefined): T | undefined {
  return Array.isArray(v) ? v[0] : v ?? undefined;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = await getServerSupabase();
  if (!(await requireAdmin(supabase))) return unauthorized();
  const admin = getAdminSupabase();

  const { id } = await params;
  const { data: profile } = await admin
    .from('trainer_profiles')
    .select('id, name, tagline, bio, location, is_remote, years_experience, is_published, is_verified, response_time, profile_photo, cover_photo, users(email)')
    .eq('id', Number(id))
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { users, ...rest } = profile as Record<string, unknown> & { users?: unknown };
  return NextResponse.json({
    ...rest,
    email: one(users as { email?: string } | { email?: string }[] | null)?.email,
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = await getServerSupabase();
  if (!(await requireAdmin(supabase))) return unauthorized();
  const admin = getAdminSupabase();

  const { id } = await params;
  const { data: trainer } = await admin
    .from('trainer_profiles')
    .select('user_id')
    .eq('id', Number(id))
    .maybeSingle();
  if (!trainer) return NextResponse.json({ error: 'Trainer not found.' }, { status: 404 });

  const { data: user } = await admin
    .from('users')
    .select('id, auth_id')
    .eq('id', trainer.user_id)
    .maybeSingle();
  if (user?.auth_id) {
    await admin.auth.admin.deleteUser(user.auth_id);
  } else if (user) {
    await admin.from('users').delete().eq('id', user.id);
  }
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const supabase = await getServerSupabase();
  if (!(await requireAdmin(supabase))) return unauthorized();
  const admin = getAdminSupabase();

  const { id } = await params;
  const { isPublished, isVerified, responseTime } = await req.json();

  const update: Record<string, unknown> = {};
  if (isPublished !== undefined) update.is_published = isPublished ? 1 : 0;
  if (isVerified !== undefined) update.is_verified = isVerified ? 1 : 0;
  if (responseTime !== undefined) update.response_time = String(responseTime);
  if (Object.keys(update).length) {
    await admin.from('trainer_profiles').update(update).eq('id', Number(id));
  }
  return NextResponse.json({ ok: true });
}
