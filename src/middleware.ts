import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth",
  "/api/logout",
  "/_next/static",
  "/_next/image",
  "/favicon",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((prefix) => pathname.startsWith(prefix));
}

function getSecret(): Uint8Array {
  const secret = process.env.MC_JWT_SECRET;
  if (!secret) throw new Error("MC_JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Allow bypass token for server-side access (e.g., OpenClaw health checks)
  const bypassToken = request.nextUrl.searchParams.get('_token');
  if (bypassToken && bypassToken === process.env.MC_BYPASS_TOKEN) {
    return NextResponse.next();
  }

  const token = request.cookies.get("mc-session")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    // Invalid or expired token — clear cookie and redirect
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("mc-session");
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico / favicon.svg
     */
    "/((?!_next/static|_next/image|favicon).*)",
  ],
};
