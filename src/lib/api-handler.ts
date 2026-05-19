import { NextRequest, NextResponse } from 'next/server';

type Ctx = { params: Promise<Record<string, string>> };
type Handler = (req: NextRequest, ctx: Ctx) => Promise<NextResponse> | NextResponse;

export function route(fn: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      console.error('[API]', req.method, req.nextUrl.pathname, err);
      return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
  };
}
