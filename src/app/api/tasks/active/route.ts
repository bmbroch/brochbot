import { NextResponse } from 'next/server';

export const revalidate = 0;

const SUPABASE_URL = () => process.env.SUPABASE_CLC_URL!;
const SUPABASE_KEY = () => process.env.SUPABASE_CLC_KEY!;

function supabaseHeaders() {
  const key = SUPABASE_KEY();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
}

export async function GET() {
  const url = SUPABASE_URL();
  const key = SUPABASE_KEY();

  if (!url || !key) {
    return NextResponse.json({ error: 'no supabase config' }, { status: 500 });
  }

  const res = await fetch(
    `${url}/rest/v1/tasks?select=*&status=eq.in_progress&order=updated_at.desc`,
    {
      headers: supabaseHeaders(),
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: `supabase error: ${res.status}` }, { status: 502 });
  }

  const rows: Array<Record<string, unknown>> = await res.json();

  if (!rows || rows.length === 0) {
    return NextResponse.json([]);
  }

  const mapped = rows.map((row) => ({
    ...row,
    _id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return NextResponse.json(mapped);
}
