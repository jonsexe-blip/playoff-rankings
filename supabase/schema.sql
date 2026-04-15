-- ============================================================
-- Playoff Prediction Game — Supabase Schema
-- Run this in the Supabase SQL editor (Project > SQL Editor)
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE teams (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text UNIQUE NOT NULL,       -- frontend string ID, e.g. 'bos', 'okc'
  name             text NOT NULL,
  abbreviation     text NOT NULL,              -- max 3 chars, e.g. 'BOS'
  league           text NOT NULL CHECK (league IN ('NBA', 'NHL')),
  conference       text NOT NULL CHECK (conference IN ('East', 'West')),
  seed             int  NOT NULL CHECK (seed BETWEEN 1 AND 8),
  -- NHL only: division within conference; 'WC' = wild card; null for NBA
  division         text CHECK (division IN ('Atlantic', 'Metropolitan', 'Central', 'Pacific', 'WC')),
  points           int,                         -- current regular-season points (NHL only, used to assign WC matchups)
  eliminated       boolean NOT NULL DEFAULT false,
  round_eliminated int,                        -- null until eliminated; 1-4
  created_at       timestamptz DEFAULT now()
);

CREATE TABLE series (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text UNIQUE NOT NULL,           -- e.g. 'nba-r1-e1'
  league       text NOT NULL CHECK (league IN ('NBA', 'NHL')),
  round        int  NOT NULL CHECK (round IN (1, 2, 3, 4)),
  conference   text CHECK (conference IN ('East', 'West')),  -- null for Finals
  team1_slug   text REFERENCES teams(slug),
  team2_slug   text REFERENCES teams(slug),
  team1_wins   int NOT NULL DEFAULT 0,
  team2_wins   int NOT NULL DEFAULT 0,
  winner_slug  text REFERENCES teams(slug)
);

-- Players table mirrors auth.users via the same UUID primary key
CREATE TABLE players (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  is_admin     boolean NOT NULL DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE rankings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id      uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  league         text NOT NULL CHECK (league IN ('NBA', 'NHL')),
  ordered_slugs  text[] NOT NULL,              -- index 0 = rank #1 (champion pick)
  updated_at     timestamptz DEFAULT now(),
  UNIQUE (player_id, league)
);

-- Single-row config table; CHECK (id = 1) enforces exactly one row
CREATE TABLE playoff_settings (
  id                int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  nba_picks_locked  boolean NOT NULL DEFAULT false,
  nhl_picks_locked  boolean NOT NULL DEFAULT false,
  teams_finalized   boolean NOT NULL DEFAULT false,
  season_label      text NOT NULL DEFAULT '2025-26',
  updated_at        timestamptz DEFAULT now()
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Playoff settings (single row)
INSERT INTO playoff_settings (id, nba_picks_locked, nhl_picks_locked, teams_finalized, season_label)
VALUES (1, false, false, false, '2025-26');

-- ── NBA Teams ──────────────────────────────────────────────────────────────────
-- Slugs are positional (nba-e1 = East seed 1) so the admin only needs to update
-- name/abbreviation when the real playoff field is known — slugs never change.
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
-- Slugs encode conference + division + rank so they're permanently stable.
-- East: Atlantic (atl), Metropolitan (met), East Wild Card (ewc)
-- West: Central (cen), Pacific (pac), West Wild Card (wwc)
INSERT INTO teams (slug, name, abbreviation, league, conference, seed, division) VALUES
  ('nhl-atl1', 'Atlantic 1st',   'A1',  'NHL', 'East', 1, 'Atlantic'),
  ('nhl-atl2', 'Atlantic 2nd',   'A2',  'NHL', 'East', 2, 'Atlantic'),
  ('nhl-atl3', 'Atlantic 3rd',   'A3',  'NHL', 'East', 3, 'Atlantic'),
  ('nhl-met1', 'Metro 1st',      'M1',  'NHL', 'East', 1, 'Metropolitan'),
  ('nhl-met2', 'Metro 2nd',      'M2',  'NHL', 'East', 2, 'Metropolitan'),
  ('nhl-met3', 'Metro 3rd',      'M3',  'NHL', 'East', 3, 'Metropolitan'),
  ('nhl-ewc1', 'East Wild Card 1','EW1','NHL', 'East', 1, 'WC'),
  ('nhl-ewc2', 'East Wild Card 2','EW2','NHL', 'East', 2, 'WC'),
  ('nhl-cen1', 'Central 1st',    'C1',  'NHL', 'West', 1, 'Central'),
  ('nhl-cen2', 'Central 2nd',    'C2',  'NHL', 'West', 2, 'Central'),
  ('nhl-cen3', 'Central 3rd',    'C3',  'NHL', 'West', 3, 'Central'),
  ('nhl-pac1', 'Pacific 1st',    'P1',  'NHL', 'West', 1, 'Pacific'),
  ('nhl-pac2', 'Pacific 2nd',    'P2',  'NHL', 'West', 2, 'Pacific'),
  ('nhl-pac3', 'Pacific 3rd',    'P3',  'NHL', 'West', 3, 'Pacific'),
  ('nhl-wwc1', 'West Wild Card 1','WW1','NHL', 'West', 1, 'WC'),
  ('nhl-wwc2', 'West Wild Card 2','WW2','NHL', 'West', 2, 'WC');

-- ── NBA Series ────────────────────────────────────────────────────────────────
-- Standard 1v8, 2v7, 3v6, 4v5 matchups — slugs are already correct
INSERT INTO series (slug, league, round, conference, team1_slug, team2_slug) VALUES
  ('nba-r1-e1', 'NBA', 1, 'East', 'nba-e1', 'nba-e8'),
  ('nba-r1-e2', 'NBA', 1, 'East', 'nba-e2', 'nba-e7'),
  ('nba-r1-e3', 'NBA', 1, 'East', 'nba-e3', 'nba-e6'),
  ('nba-r1-e4', 'NBA', 1, 'East', 'nba-e4', 'nba-e5'),
  ('nba-r1-w1', 'NBA', 1, 'West', 'nba-w1', 'nba-w8'),
  ('nba-r1-w2', 'NBA', 1, 'West', 'nba-w2', 'nba-w7'),
  ('nba-r1-w3', 'NBA', 1, 'West', 'nba-w3', 'nba-w6'),
  ('nba-r1-w4', 'NBA', 1, 'West', 'nba-w4', 'nba-w5');

-- NBA Later Round placeholders (admin fills in team slugs as series conclude)
INSERT INTO series (slug, league, round, conference) VALUES
  ('nba-r2-e1', 'NBA', 2, 'East'),
  ('nba-r2-e2', 'NBA', 2, 'East'),
  ('nba-r2-w1', 'NBA', 2, 'West'),
  ('nba-r2-w2', 'NBA', 2, 'West'),
  ('nba-cf-e',  'NBA', 3, 'East'),
  ('nba-cf-w',  'NBA', 3, 'West'),
  ('nba-finals','NBA', 4, NULL);

-- ── NHL Series ────────────────────────────────────────────────────────────────
-- Standard NHL first round:
--   Best div winner vs EWC2, Other div winner vs EWC1
--   ATL 2nd vs ATL 3rd, MET 2nd vs MET 3rd (same for West)
-- Admin should swap team slugs here if the actual bracket differs.
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

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE teams           ENABLE ROW LEVEL SECURITY;
ALTER TABLE series          ENABLE ROW LEVEL SECURITY;
ALTER TABLE players         ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE playoff_settings ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM players WHERE id = auth.uid() AND is_admin = true
  );
$$;

-- teams: public read, admin write
CREATE POLICY "teams_select_all"    ON teams FOR SELECT USING (true);
CREATE POLICY "teams_insert_admin"  ON teams FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "teams_update_admin"  ON teams FOR UPDATE USING (is_admin());
CREATE POLICY "teams_delete_admin"  ON teams FOR DELETE USING (is_admin());

-- series: public read, admin write
CREATE POLICY "series_select_all"   ON series FOR SELECT USING (true);
CREATE POLICY "series_insert_admin" ON series FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "series_update_admin" ON series FOR UPDATE USING (is_admin());
CREATE POLICY "series_delete_admin" ON series FOR DELETE USING (is_admin());

-- players: public read; own-row insert/update (cannot self-elevate is_admin)
CREATE POLICY "players_select_all"   ON players FOR SELECT USING (true);
CREATE POLICY "players_insert_own"   ON players FOR INSERT
  WITH CHECK (id = auth.uid() AND is_admin = false);
CREATE POLICY "players_update_own"   ON players FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND is_admin = (SELECT is_admin FROM players WHERE id = auth.uid()));

-- rankings: public read; own-row insert; own-row update only when picks not locked
CREATE POLICY "rankings_select_all"  ON rankings FOR SELECT USING (true);
CREATE POLICY "rankings_insert_own"  ON rankings FOR INSERT
  WITH CHECK (player_id = auth.uid());
CREATE POLICY "rankings_update_own_unlocked" ON rankings FOR UPDATE
  USING (
    player_id = auth.uid()
    AND NOT (
      SELECT CASE
        WHEN league = 'NBA' THEN nba_picks_locked
        ELSE nhl_picks_locked
      END
      FROM playoff_settings
      WHERE id = 1
    )
  );

-- playoff_settings: public read, admin write
CREATE POLICY "settings_select_all"   ON playoff_settings FOR SELECT USING (true);
CREATE POLICY "settings_insert_admin" ON playoff_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "settings_update_admin" ON playoff_settings FOR UPDATE USING (is_admin());
