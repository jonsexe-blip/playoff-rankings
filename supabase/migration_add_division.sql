-- ============================================================
-- Migration: Add NHL division field to teams
-- Run this in Supabase SQL Editor if you already ran schema.sql
-- ============================================================

ALTER TABLE teams ADD COLUMN IF NOT EXISTS division text
  CHECK (division IN ('Atlantic', 'Metropolitan', 'Central', 'Pacific', 'WC'));

-- Set NHL divisions on placeholder seed data
-- Eastern Conference
UPDATE teams SET division = 'Atlantic',      seed = 1 WHERE slug = 'fla';
UPDATE teams SET division = 'Metropolitan',  seed = 1 WHERE slug = 'car';
UPDATE teams SET division = 'Metropolitan',  seed = 2 WHERE slug = 'nyr';
UPDATE teams SET division = 'Atlantic',      seed = 2 WHERE slug = 'bos-nhl';
UPDATE teams SET division = 'Atlantic',      seed = 3 WHERE slug = 'tor';
UPDATE teams SET division = 'Atlantic',      seed = 3 WHERE slug = 'tbl';  -- adjust when real field known
UPDATE teams SET division = 'Metropolitan',  seed = 3 WHERE slug = 'njd';
UPDATE teams SET division = 'WC',            seed = 1 WHERE slug = 'det';

-- Western Conference
UPDATE teams SET division = 'Central',  seed = 1 WHERE slug = 'dal-nhl';
UPDATE teams SET division = 'Central',  seed = 2 WHERE slug = 'col';
UPDATE teams SET division = 'Central',  seed = 3 WHERE slug = 'wpg';
UPDATE teams SET division = 'Pacific',  seed = 1 WHERE slug = 'van';
UPDATE teams SET division = 'Pacific',  seed = 2 WHERE slug = 'edm';
UPDATE teams SET division = 'Pacific',  seed = 3 WHERE slug = 'vgk';
UPDATE teams SET division = 'WC',       seed = 1 WHERE slug = 'nsh';
UPDATE teams SET division = 'WC',       seed = 2 WHERE slug = 'lak';
