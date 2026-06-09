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
  const { data: row } = await admin
    .from('student_profiles')
    .select('id, name, created_at, users(id, email)')
    .eq('id', Number(id))
    .maybeSingle();
  if (!row) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });

  const u = one(row.users as { id?: number; email?: string } | { id?: number; email?: string }[] | null);
  return NextResponse.json({
    id: row.id,
    name: row.name,
    created_at: row.created_at,
    user_id: u?.id,
    email: u?.email,
  });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const supabase = await getServerSupabase();
  if (!(await requireAdmin(supabase))) return unauthorized();
  const admin = getAdminSupabase();

  const { id } = await params;
  const { name, email, password } = await req.json();

  const { data: student } = await admin
    .from('student_profiles')
    .select('user_id')
    .eq('id', Number(id))
    .maybeSingle();
  if (!student) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });

  const { data: user } = await admin
    .from('users')
    .select('id, auth_id, email')
    .eq('id', student.user_id)
    .maybeSingle();
  if (!user) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });

  if (name) {
    await admin.from('student_profiles').update({ name }).eq('id', Number(id));
  }

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

export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = await getServerSupabase();
  if (!(await requireAdmin(supabase))) return unauthorized();
  const admin = getAdminSupabase();

  const { id } = await params;
  const { data: student } = await admin
    .from('student_profiles')
    .select('user_id')
    .eq('id', Number(id))
    .maybeSingle();
  if (!student) return NextResponse.json({ error: 'Student not found.' }, { status: 404 });

  const { data: user } = await admin
    .from('users')
    .select('id, auth_id')
    .eq('id', student.user_id)
    .maybeSingle();

  // Deleting the auth user cascades to the app `users` row (auth_id FK) and its
  // profiles. Fall back to deleting the users row directly if not linked.
  if (user?.auth_id) {
    await admin.auth.admin.deleteUser(user.auth_id);
  } else if (user) {
    await admin.from('users').delete().eq('id', user.id);
  }
  return NextResponse.json({ ok: true });
}
