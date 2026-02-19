import { NextResponse } from 'next/server';

export const revalidate = 0; // never cache

export async function GET() {
  const url = process.env.SUPABASE_CLC_URL;
  const key = process.env.SUPABASE_CLC_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: 'no supabase config' }, { status: 500 });
  }

  const res = await fetch(`${url}/rest/v1/mc_realtime?key=eq.mc-data&select=data`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json({ error: `supabase error: ${res.status}` }, { status: 502 });
  }

  const rows = await res.json();
  const data = rows?.[0]?.data ?? {};
  return NextResponse.json(data);
}
