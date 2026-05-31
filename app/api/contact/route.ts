import { NextRequest, NextResponse } from 'next/server';
import db from '../../../src/lib/db';
import { checkProfanity } from '../../../src/lib/profanity';

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email and message are required.' }, { status: 400 });
    }
    const profanity = checkProfanity(name, subject, message);
    if (profanity) return NextResponse.json({ error: profanity }, { status: 400 });
    db.prepare(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)'
    ).run(String(name).trim(), String(email).trim().toLowerCase(), String(subject ?? '').trim(), String(message).trim());
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
