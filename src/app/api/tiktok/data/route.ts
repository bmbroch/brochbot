import { NextRequest, NextResponse } from "next/server";
import { getStoreData } from "@/lib/tiktok-store";

export const dynamic = "force-dynamic";

// GET /api/tiktok/data?handle={handle} — returns Supabase cached data for a handle
export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get("handle");
  if (!handle) {
    return NextResponse.json({ error: "handle is required" }, { status: 400 });
  }

  const data = await getStoreData(handle);
  if (!data) {
    return NextResponse.json({ data: null });
  }

  return NextResponse.json({ data });
}
