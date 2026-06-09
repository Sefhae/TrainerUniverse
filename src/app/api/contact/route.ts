import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { checkProfanity } from '@/lib/profanity';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 });
    }
    const profanity = checkProfanity(name, subject, message);
    if (profanity) return NextResponse.json({ error: profanity }, { status: 400 });

    const supabase = await getServerSupabase();
    await supabase.from('contact_messages').insert({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      subject: String(subject ?? '').trim(),
      message: String(message).trim(),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
