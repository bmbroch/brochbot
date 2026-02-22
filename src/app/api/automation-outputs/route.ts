import { NextResponse } from 'next/server';

export const revalidate = 0;

const SUPABASE_URL = () => process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = () => process.env.SUPABASE_CLC_KEY!;

function supabaseHeaders(extra?: Record<string, string>) {
  const key = SUPABASE_KEY();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

export async function GET(req: Request) {
  const url = SUPABASE_URL();
  const key = SUPABASE_KEY();

  if (!url || !key) {
    return NextResponse.json({ error: 'no supabase config' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const agent = searchParams.get('agent');
  const limit = searchParams.get('limit') ?? '30';

  let endpoint = `${url}/rest/v1/automation_outputs?select=*&order=run_date.desc&limit=${encodeURIComponent(limit)}`;
  if (agent) {
    endpoint += `&agent=eq.${encodeURIComponent(agent)}`;
  }

  const res = await fetch(endpoint, {
    headers: supabaseHeaders(),
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json({ error: `supabase error: ${res.status}` }, { status: 502 });
  }

  const rows = await res.json();
  return NextResponse.json(rows ?? []);
}

export async function POST(req: Request) {
  const url = SUPABASE_URL();
  const key = SUPABASE_KEY();

  if (!url || !key) {
    return NextResponse.json({ error: 'no supabase config' }, { status: 500 });
  }

  const body = await req.json();
  const { agent, job_slug, run_date, output_text, tokens, cost, model } = body ?? {};

  if (!agent || !job_slug || !run_date) {
    return NextResponse.json(
      { error: 'invalid body: agent, job_slug, and run_date are required' },
      { status: 400 }
    );
  }

  const row = { agent, job_slug, run_date, output_text, tokens, cost, model };

  const res = await fetch(`${url}/rest/v1/automation_outputs`, {
    method: 'POST',
    headers: supabaseHeaders({ Prefer: 'resolution=merge-duplicates' }),
    body: JSON.stringify(row),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `supabase error: ${res.status}`, detail: text }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
