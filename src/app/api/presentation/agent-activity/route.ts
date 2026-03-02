import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const agent = req.nextUrl.searchParams.get("agent");
  if (!agent) return NextResponse.json({ error: "agent param required" }, { status: 400 });

  const filePath = path.join(process.cwd(), "public", "agent-runs-history.json");
  let runs: any[] = [];
  try {
    runs = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return NextResponse.json({ runs: [] });
  }

  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const filtered = runs
    .filter((r) => r.agent === agent && new Date(r.timestamp).getTime() > cutoff)
    .slice(-10)
    .reverse();

  return NextResponse.json({ runs: filtered });
}
