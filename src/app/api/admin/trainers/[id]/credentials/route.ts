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
  const { email, password } = await req.json();

  const { data: trainer } = await admin
    .from('trainer_profiles')
    .select('user_id')
    .eq('id', Number(id))
    .maybeSingle();
  if (!trainer) return NextResponse.json({ error: 'Trainer not found.' }, { status: 404 });

  const { data: user } = await admin
    .from('users')
    .select('id, auth_id, email')
    .eq('id', trainer.user_id)
    .maybeSingle();
  if (!user) return NextResponse.json({ error: 'Trainer not found.' }, { status: 404 });

  if (email && email !== user.email) {
    const { data: conflict } = await admin
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', user.id)
      .maybeSingle();
    if (conflict) return NextResponse.json({ error: 'Email already in use.' }, { status: 409 });
    if (user.auth_id) {
      const { error } = await admin.auth.admin.updateUserById(user.auth_id, { email });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }
    await admin.from('users').update({ email }).eq('id', user.id);
  }

  if (password) {
    if (password.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    if (user.auth_id) {
      const { error } = await admin.auth.admin.updateUserById(user.auth_id, { password });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
