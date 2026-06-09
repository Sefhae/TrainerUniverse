import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// Keeps the Supabase auth session fresh on every navigation/request.
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on everything except Next.js internals and static asset files, so we
     * don't burn work refreshing the session for images/fonts/etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
