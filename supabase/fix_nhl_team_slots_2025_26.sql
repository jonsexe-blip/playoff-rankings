-- ============================================================
-- Fix: NHL team data entered into wrong positional slugs
--
-- Symptom: bracket shows wrong matchups even though series
-- table is correct. Root cause: teams were assigned to wrong
-- positional slug slots in the admin panel.
--
-- Correct assignments:
--   East WC:  nhl-ewc1 = BOS (WC1, better WC)
--             nhl-ewc2 = OTT (WC2, lesser WC)
--   West Cen: nhl-cen1 = COL, nhl-cen2 = DAL, nhl-cen3 = MIN
--   West Pac: nhl-pac1 = VGK, nhl-pac2 = EDM, nhl-pac3 = ANA
--   West WC:  nhl-wwc1 = UTA (WC1, better WC)
--             nhl-wwc2 = LAK (WC2, lesser WC)
--
-- Strategy: snapshot all current NHL team rows into a temp table,
-- then write each positional slug with the correct team's data
-- (pulling points/eliminated from wherever that team currently lives).
-- Slugs are never changed — series FKs remain valid.
-- ============================================================

BEGIN;

-- Snapshot current NHL team data before any changes
CREATE TEMP TABLE nhl_fix_snapshot AS
SELECT slug, name, abbreviation, conference, division, seed, points,
       eliminated, round_eliminated
FROM teams
WHERE league = 'NHL';

-- ── EAST WILD CARD ───────────────────────────────────────────

-- nhl-ewc1 should be BOS (currently in whichever slot BOS was entered)
UPDATE teams t SET
  name            = s.name,
  abbreviation    = s.abbreviation,
  conference      = 'East',
  division        = 'WC',
  seed            = 1,
  points          = s.points,
  eliminated      = s.eliminated,
  round_eliminated = s.round_eliminated
FROM nhl_fix_snapshot s
WHERE t.slug = 'nhl-ewc1'
  AND t.league = 'NHL'
  AND s.abbreviation = 'BOS';

-- nhl-ewc2 should be OTT
UPDATE teams t SET
  name            = s.name,
  abbreviation    = s.abbreviation,
  conference      = 'East',
  division        = 'WC',
  seed            = 2,
  points          = s.points,
  eliminated      = s.eliminated,
  round_eliminated = s.round_eliminated
FROM nhl_fix_snapshot s
WHERE t.slug = 'nhl-ewc2'
  AND t.league = 'NHL'
  AND s.abbreviation = 'OTT';

-- ── WEST CENTRAL ─────────────────────────────────────────────

-- nhl-cen1 should be COL
UPDATE teams t SET
  name            = s.name,
  abbreviation    = s.abbreviation,
  conference      = 'West',
  division        = 'Central',
  seed            = 1,
  points          = s.points,
  eliminated      = s.eliminated,
  round_eliminated = s.round_eliminated
FROM nhl_fix_snapshot s
WHERE t.slug = 'nhl-cen1'
  AND t.league = 'NHL'
  AND s.abbreviation = 'COL';

-- nhl-cen2 should be DAL
UPDATE teams t SET
  name            = s.name,
  abbreviation    = s.abbreviation,
  conference      = 'West',
  division        = 'Central',
  seed            = 2,
  points          = s.points,
  eliminated      = s.eliminated,
  round_eliminated = s.round_eliminated
FROM nhl_fix_snapshot s
WHERE t.slug = 'nhl-cen2'
  AND t.league = 'NHL'
  AND s.abbreviation = 'DAL';

-- nhl-cen3 should be MIN
UPDATE teams t SET
  name            = s.name,
  abbreviation    = s.abbreviation,
  conference      = 'West',
  division        = 'Central',
  seed            = 3,
  points          = s.points,
  eliminated      = s.eliminated,
  round_eliminated = s.round_eliminated
FROM nhl_fix_snapshot s
WHERE t.slug = 'nhl-cen3'
  AND t.league = 'NHL'
  AND s.abbreviation = 'MIN';

-- ── WEST PACIFIC ─────────────────────────────────────────────

-- nhl-pac1 should be VGK
UPDATE teams t SET
  name            = s.name,
  abbreviation    = s.abbreviation,
  conference      = 'West',
  division        = 'Pacific',
  seed            = 1,
  points          = s.points,
  eliminated      = s.eliminated,
  round_eliminated = s.round_eliminated
FROM nhl_fix_snapshot s
WHERE t.slug = 'nhl-pac1'
  AND t.league = 'NHL'
  AND s.abbreviation = 'VGK';

-- nhl-pac2 should be EDM
UPDATE teams t SET
  name            = s.name,
  abbreviation    = s.abbreviation,
  conference      = 'West',
  division        = 'Pacific',
  seed            = 2,
  points          = s.points,
  eliminated      = s.eliminated,
  round_eliminated = s.round_eliminated
FROM nhl_fix_snapshot s
WHERE t.slug = 'nhl-pac2'
  AND t.league = 'NHL'
  AND s.abbreviation = 'EDM';

-- nhl-pac3 should be ANA
UPDATE teams t SET
  name            = s.name,
  abbreviation    = s.abbreviation,
  conference      = 'West',
  division        = 'Pacific',
  seed            = 3,
  points          = s.points,
  eliminated      = s.eliminated,
  round_eliminated = s.round_eliminated
FROM nhl_fix_snapshot s
WHERE t.slug = 'nhl-pac3'
  AND t.league = 'NHL'
  AND s.abbreviation = 'ANA';

-- ── WEST WILD CARD ───────────────────────────────────────────

-- nhl-wwc1 should be UTA (Utah Hockey Club, better WC)
UPDATE teams t SET
  name            = s.name,
  abbreviation    = s.abbreviation,
  conference      = 'West',
  division        = 'WC',
  seed            = 1,
  points          = s.points,
  eliminated      = s.eliminated,
  round_eliminated = s.round_eliminated
FROM nhl_fix_snapshot s
WHERE t.slug = 'nhl-wwc1'
  AND t.league = 'NHL'
  AND s.abbreviation = 'UTA';

-- nhl-wwc2 should be LAK (Los Angeles Kings, lesser WC)
UPDATE teams t SET
  name            = s.name,
  abbreviation    = s.abbreviation,
  conference      = 'West',
  division        = 'WC',
  seed            = 2,
  points          = s.points,
  eliminated      = s.eliminated,
  round_eliminated = s.round_eliminated
FROM nhl_fix_snapshot s
WHERE t.slug = 'nhl-wwc2'
  AND t.league = 'NHL'
  AND s.abbreviation = 'LAK';

DROP TABLE nhl_fix_snapshot;

COMMIT;

-- ── Verify ───────────────────────────────────────────────────
-- Run this after committing to confirm correct assignments:
--
-- SELECT slug, abbreviation, division, seed, points, conference
-- FROM teams WHERE league = 'NHL'
-- ORDER BY conference, division, seed;
--
-- Expected result:
--   nhl-atl1  BUF  Atlantic  1   East
--   nhl-atl2  TBL  Atlantic  2   East
--   nhl-atl3  MTL  Atlantic  3   East
--   nhl-met1  CAR  Metropolitan 1  East
--   nhl-met2  PIT  Metropolitan 2  East
--   nhl-met3  PHI  Metropolitan 3  East
--   nhl-ewc1  BOS  WC  1  East
--   nhl-ewc2  OTT  WC  2  East
--   nhl-cen1  COL  Central  1  West
--   nhl-cen2  DAL  Central  2  West
--   nhl-cen3  MIN  Central  3  West
--   nhl-pac1  VGK  Pacific  1  West
--   nhl-pac2  EDM  Pacific  2  West
--   nhl-pac3  ANA  Pacific  3  West
--   nhl-wwc1  UTA  WC  1  West
--   nhl-wwc2  LAK  WC  2  West
