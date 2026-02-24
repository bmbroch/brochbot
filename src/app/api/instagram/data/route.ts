import { NextRequest, NextResponse } from "next/server";
import { getInstagramStoreData } from "@/lib/instagram-store";

export const dynamic = "force-dynamic";

// GET /api/instagram/data?igHandle={igHandle} — returns Supabase cached data
export async function GET(req: NextRequest) {
  const igHandle = req.nextUrl.searchParams.get("igHandle");
  if (!igHandle) {
    return NextResponse.json({ error: "igHandle is required" }, { status: 400 });
  }

  const data = await getInstagramStoreData(igHandle);
  if (!data) {
    return NextResponse.json({ data: null });
  }

  return NextResponse.json({ data });
}
