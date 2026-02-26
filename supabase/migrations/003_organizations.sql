-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sync_hour INT NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Ben's org (SalesEcho UGC team)
INSERT INTO organizations (id, name, slug, sync_hour)
VALUES ('00000000-0000-0000-0000-000000000001', 'SalesEcho', 'salesecho', 8)
ON CONFLICT (slug) DO NOTHING;

-- Add org_id to ugc_creators (nullable for backward compat)
ALTER TABLE ugc_creators ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id);

-- Assign all existing creators to Ben's org
UPDATE ugc_creators SET org_id = '00000000-0000-0000-0000-000000000001' WHERE org_id IS NULL;

-- Index for fast org-filtered queries
CREATE INDEX IF NOT EXISTS ugc_creators_org_id_idx ON ugc_creators(org_id);
