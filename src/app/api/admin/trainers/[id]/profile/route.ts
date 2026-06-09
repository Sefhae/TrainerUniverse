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
  const { name, tagline, bio, location, yearsExperience, isRemote } = await req.json();

  await admin
    .from('trainer_profiles')
    .update({
      name,
      tagline: tagline ?? '',
      bio: bio ?? '',
      location: location ?? '',
      years_experience: Number(yearsExperience) || 0,
      is_remote: isRemote ? 1 : 0,
    })
    .eq('id', Number(id));

  return NextResponse.json({ ok: true });
}
