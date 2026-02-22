import { NextResponse } from 'next/server';

export const revalidate = 0;

const SUPABASE_URL = () => process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = () => process.env.SUPABASE_CLC_KEY!;

function supabaseHeaders() {
  const key = SUPABASE_KEY();
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
}

export async function GET() {
  const url = SUPABASE_URL();
  const key = SUPABASE_KEY();

  if (!url || !key) {
    return NextResponse.json({ error: 'no supabase config' }, { status: 500 });
  }

  const res = await fetch(`${url}/rest/v1/mc_realtime?key=eq.tasks&select=data`, {
    headers: supabaseHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json({ error: `supabase error: ${res.status}` }, { status: 502 });
  }

  const rows = await res.json();
  const data = rows?.[0]?.data ?? null;

  // Return null/empty so the client falls back to tasks.json
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return NextResponse.json(null);
  }

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const url = SUPABASE_URL();
  const key = SUPABASE_KEY();

  if (!url || !key) {
    return NextResponse.json({ error: 'no supabase config' }, { status: 500 });
  }

  const body = await req.json();
  const tasks = body?.tasks;

  if (!Array.isArray(tasks)) {
    return NextResponse.json({ error: 'invalid body: expected { tasks: Task[] }' }, { status: 400 });
  }

  const res = await fetch(`${url}/rest/v1/mc_realtime`, {
    method: 'POST',
    headers: {
      ...supabaseHeaders(),
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ key: 'tasks', data: tasks }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `supabase error: ${res.status}`, detail: text }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
