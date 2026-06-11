import { NextRequest, NextResponse } from "next/server";
import { deriveSessionToken, SESSION_COOKIE } from "@/lib/auth/token";

// Authentication gate. Active only when APP_PASSWORD is set, so purely local
// usage keeps working with zero configuration. Designed for remote access
// scenarios (e.g. home server exposed beyond a VPN).
export async function middleware(request: NextRequest) {
  const password = process.env.APP_PASSWORD;
  if (!password) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (sessionCookie) {
    const expected = await deriveSessionToken(password);
    if (sessionCookie === expected) {
      return NextResponse.next();
    }
  }

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Exclude: login page/API, Next.js internals, and public assets needed
  // before login (PWA manifest, icons, avatars)
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico|manifest.json|icons|avatars|sw.js).*)",
  ],
};
