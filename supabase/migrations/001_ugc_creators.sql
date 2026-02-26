-- UGC Creators table
-- Run this in the Supabase Dashboard SQL Editor for the CLCP project

CREATE TABLE IF NOT EXISTS ugc_creators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tiktok_handle TEXT,
  ig_handle TEXT,
  status TEXT NOT NULL DEFAULT 'active',   -- 'active' | 'monitoring' | 'archived'
  sync_hour INTEGER DEFAULT 8,             -- 0–23 UTC hour for daily auto-sync (null = no auto-sync)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_synced_at TIMESTAMPTZ,
  last_counts_refresh_at TIMESTAMPTZ
);

-- Seed the 8 existing creators
INSERT INTO ugc_creators (name, tiktok_handle, ig_handle, status, sync_hour) VALUES
  ('Nick',    'sell.with.nick',  'sell.with.nick',  'active',     8),
  ('Luke',    '_lukesells',      '_lukesells',       'active',     8),
  ('Abby',    'abbysellsss',     'abbysellss',       'active',     8),
  ('Jake',    'jake_sells0',     'jake.sells0',      'monitoring', NULL),
  ('Bobby',   'bobby.salesguy',  'bobby.salesguy',   'active',     8),
  ('Sheryl',  'sher_sells',      'sher_sells',       'monitoring', NULL),
  ('Flo',     'sophiesellss',    'sophiesellss',     'active',     8),
  ('Griffin', 'griffn.sells',    'griffin.sells',    'monitoring', NULL)
ON CONFLICT DO NOTHING;
