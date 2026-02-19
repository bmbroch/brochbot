import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import crypto from "crypto";

// ── Rate limiter: 5 attempts per minute per IP ──────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  entry.count += 1;
  if (entry.count > 5) return true;
  return false;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function timingSafeEqual(a: string, b: string): boolean {
  // Pad to same length before comparing to avoid length leakage
  const aBytes = Buffer.from(a, "utf8");
  const bBytes = Buffer.from(b, "utf8");
  if (aBytes.length !== bBytes.length) {
    // Still do a dummy compare to consume constant time, then return false
    const padded = Buffer.alloc(aBytes.length);
    crypto.timingSafeEqual(aBytes, padded);
    return false;
  }
  return crypto.timingSafeEqual(aBytes, bBytes);
}

function getSecret(): Uint8Array {
  const secret = process.env.MC_JWT_SECRET;
  if (!secret) throw new Error("MC_JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

// ── POST /api/auth — Login ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  // Determine client IP (Vercel forwards in x-forwarded-for)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment." },
      { status: 429 }
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const submitted = body.password ?? "";
  const expected = process.env.MC_PASSWORD ?? "";

  if (!expected) {
    console.error("MC_PASSWORD env var is not set");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  if (!timingSafeEqual(submitted, expected)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Issue JWT — 30 day expiry
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());

  const response = NextResponse.json({ ok: true });
  response.cookies.set("mc-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
    path: "/",
  });

  return response;
}
