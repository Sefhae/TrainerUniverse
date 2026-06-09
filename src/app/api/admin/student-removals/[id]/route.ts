import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { requireAdmin, unauthorized } from '@/lib/supabase-auth';
import { getAdminSupabase } from '@/lib/supabase-admin';

// POST /api/admin/student-removals/[id] — approve or reject a removal request.
// body: { action: 'approve' | 'reject' }
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await getServerSupabase();
  if (!(await requireAdmin(supabase))) return unauthorized();
  const admin = getAdminSupabase();

  const { id } = await params;
  const requestId = Number(id);
  const { action } = await req.json();

  const { data: reqRow } = await admin
    .from('student_removal_requests')
    .select('trainer_id, student_id, status')
    .eq('id', requestId)
    .maybeSingle();
  if (!reqRow) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
  if (reqRow.status !== 'pending') {
    return NextResponse.json({ error: 'Request already handled.' }, { status: 409 });
  }

  if (action === 'approve') {
    await admin
      .from('trainer_students')
      .delete()
      .eq('trainer_id', reqRow.trainer_id)
      .eq('student_id', reqRow.student_id);
    await admin.from('student_removal_requests').update({ status: 'approved' }).eq('id', requestId);
  } else if (action === 'reject') {
    await admin.from('student_removal_requests').update({ status: 'rejected' }).eq('id', requestId);
  } else {
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
