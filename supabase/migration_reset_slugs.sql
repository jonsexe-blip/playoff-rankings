-- ============================================================
-- Migration: Reset team slugs to positional (stable) slugs
-- Run this in the Supabase SQL Editor if you already ran
-- the original schema.sql with team-name-based slugs.
-- WARNING: This deletes all existing teams, series, and rankings.
-- ============================================================

-- Add points column if it doesn't exist yet
ALTER TABLE teams ADD COLUMN IF NOT EXISTS points int;

-- Clear rankings first (FK → players, which FKs to teams via rankings.ordered_slugs is text[])
DELETE FROM rankings;

-- Clear series (FKs reference teams.slug)
DELETE FROM series;

-- Clear teams
DELETE FROM teams;

-- ── NBA Teams ──────────────────────────────────────────────────────────────────
INSERT INTO teams (slug, name, abbreviation, league, conference, seed) VALUES
  ('nba-e1', 'East 1 Seed', 'E1',  'NBA', 'East', 1),
  ('nba-e2', 'East 2 Seed', 'E2',  'NBA', 'East', 2),
  ('nba-e3', 'East 3 Seed', 'E3',  'NBA', 'East', 3),
  ('nba-e4', 'East 4 Seed', 'E4',  'NBA', 'East', 4),
  ('nba-e5', 'East 5 Seed', 'E5',  'NBA', 'East', 5),
  ('nba-e6', 'East 6 Seed', 'E6',  'NBA', 'East', 6),
  ('nba-e7', 'East 7 Seed', 'E7',  'NBA', 'East', 7),
  ('nba-e8', 'East 8 Seed', 'E8',  'NBA', 'East', 8),
  ('nba-w1', 'West 1 Seed', 'W1',  'NBA', 'West', 1),
  ('nba-w2', 'West 2 Seed', 'W2',  'NBA', 'West', 2),
  ('nba-w3', 'West 3 Seed', 'W3',  'NBA', 'West', 3),
  ('nba-w4', 'West 4 Seed', 'W4',  'NBA', 'West', 4),
  ('nba-w5', 'West 5 Seed', 'W5',  'NBA', 'West', 5),
  ('nba-w6', 'West 6 Seed', 'W6',  'NBA', 'West', 6),
  ('nba-w7', 'West 7 Seed', 'W7',  'NBA', 'West', 7),
  ('nba-w8', 'West 8 Seed', 'W8',  'NBA', 'West', 8);

-- ── NHL Teams ──────────────────────────────────────────────────────────────────
INSERT INTO teams (slug, name, abbreviation, league, conference, seed, division) VALUES
  ('nhl-atl1', 'Atlantic 1st',    'A1',  'NHL', 'East', 1, 'Atlantic'),
  ('nhl-atl2', 'Atlantic 2nd',    'A2',  'NHL', 'East', 2, 'Atlantic'),
  ('nhl-atl3', 'Atlantic 3rd',    'A3',  'NHL', 'East', 3, 'Atlantic'),
  ('nhl-met1', 'Metro 1st',       'M1',  'NHL', 'East', 1, 'Metropolitan'),
  ('nhl-met2', 'Metro 2nd',       'M2',  'NHL', 'East', 2, 'Metropolitan'),
  ('nhl-met3', 'Metro 3rd',       'M3',  'NHL', 'East', 3, 'Metropolitan'),
  ('nhl-ewc1', 'East Wild Card 1','EW1', 'NHL', 'East', 1, 'WC'),
  ('nhl-ewc2', 'East Wild Card 2','EW2', 'NHL', 'East', 2, 'WC'),
  ('nhl-cen1', 'Central 1st',     'C1',  'NHL', 'West', 1, 'Central'),
  ('nhl-cen2', 'Central 2nd',     'C2',  'NHL', 'West', 2, 'Central'),
  ('nhl-cen3', 'Central 3rd',     'C3',  'NHL', 'West', 3, 'Central'),
  ('nhl-pac1', 'Pacific 1st',     'P1',  'NHL', 'West', 1, 'Pacific'),
  ('nhl-pac2', 'Pacific 2nd',     'P2',  'NHL', 'West', 2, 'Pacific'),
  ('nhl-pac3', 'Pacific 3rd',     'P3',  'NHL', 'West', 3, 'Pacific'),
  ('nhl-wwc1', 'West Wild Card 1','WW1', 'NHL', 'West', 1, 'WC'),
  ('nhl-wwc2', 'West Wild Card 2','WW2', 'NHL', 'West', 2, 'WC');

-- ── NBA Series ────────────────────────────────────────────────────────────────
INSERT INTO series (slug, league, round, conference, team1_slug, team2_slug) VALUES
  ('nba-r1-e1', 'NBA', 1, 'East', 'nba-e1', 'nba-e8'),
  ('nba-r1-e2', 'NBA', 1, 'East', 'nba-e2', 'nba-e7'),
  ('nba-r1-e3', 'NBA', 1, 'East', 'nba-e3', 'nba-e6'),
  ('nba-r1-e4', 'NBA', 1, 'East', 'nba-e4', 'nba-e5'),
  ('nba-r1-w1', 'NBA', 1, 'West', 'nba-w1', 'nba-w8'),
  ('nba-r1-w2', 'NBA', 1, 'West', 'nba-w2', 'nba-w7'),
  ('nba-r1-w3', 'NBA', 1, 'West', 'nba-w3', 'nba-w6'),
  ('nba-r1-w4', 'NBA', 1, 'West', 'nba-w4', 'nba-w5');

-- NBA Later Round placeholders
INSERT INTO series (slug, league, round, conference) VALUES
  ('nba-r2-e1', 'NBA', 2, 'East'),
  ('nba-r2-e2', 'NBA', 2, 'East'),
  ('nba-r2-w1', 'NBA', 2, 'West'),
  ('nba-r2-w2', 'NBA', 2, 'West'),
  ('nba-cf-e',  'NBA', 3, 'East'),
  ('nba-cf-w',  'NBA', 3, 'West'),
  ('nba-finals','NBA', 4, NULL);

-- ── NHL Series ────────────────────────────────────────────────────────────────
INSERT INTO series (slug, league, round, conference, team1_slug, team2_slug) VALUES
  ('nhl-r1-e1', 'NHL', 1, 'East', 'nhl-atl1', 'nhl-ewc1'),
  ('nhl-r1-e2', 'NHL', 1, 'East', 'nhl-met1', 'nhl-ewc2'),
  ('nhl-r1-e3', 'NHL', 1, 'East', 'nhl-atl2', 'nhl-atl3'),
  ('nhl-r1-e4', 'NHL', 1, 'East', 'nhl-met2', 'nhl-met3'),
  ('nhl-r1-w1', 'NHL', 1, 'West', 'nhl-cen1', 'nhl-wwc2'),
  ('nhl-r1-w2', 'NHL', 1, 'West', 'nhl-pac1', 'nhl-wwc1'),
  ('nhl-r1-w3', 'NHL', 1, 'West', 'nhl-cen2', 'nhl-cen3'),
  ('nhl-r1-w4', 'NHL', 1, 'West', 'nhl-pac2', 'nhl-pac3');

-- NHL Later Round placeholders
INSERT INTO series (slug, league, round, conference) VALUES
  ('nhl-r2-e1', 'NHL', 2, 'East'),
  ('nhl-r2-e2', 'NHL', 2, 'East'),
  ('nhl-r2-w1', 'NHL', 2, 'West'),
  ('nhl-r2-w2', 'NHL', 2, 'West'),
  ('nhl-cf-e',  'NHL', 3, 'East'),
  ('nhl-cf-w',  'NHL', 3, 'West'),
  ('nhl-finals','NHL', 4, NULL);
