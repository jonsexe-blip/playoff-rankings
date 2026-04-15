-- ============================================================
-- Patch: Explicitly set all NHL Round 1 series for 2025-26
-- Run this in the Supabase SQL Editor.
-- This directly overwrites whatever team assignments are in the
-- series table, regardless of prior migration state.
--
-- Eastern Conference bracket:
--   BUF (ATL1) vs BOS (WC1)   — weaker div winner plays better WC
--   CAR (MET1) vs OTT (WC2)   — better div winner plays lesser WC
--   TBL (ATL2) vs MTL (ATL3)
--   PIT (MET2) vs PHI (MET3)
--
-- Western Conference bracket:
--   COL (CEN1) vs LAK (WC2)   — better div winner plays lesser WC
--   VGK (PAC1) vs UTA (WC1)   — weaker div winner plays better WC
--   DAL (CEN2) vs MIN (CEN3)
--   EDM (PAC2) vs ANA (PAC3)
-- ============================================================

-- East
UPDATE series SET team1_slug = 'nhl-atl1', team2_slug = 'nhl-ewc1'  WHERE slug = 'nhl-r1-e1';  -- BUF vs BOS
UPDATE series SET team1_slug = 'nhl-met1', team2_slug = 'nhl-ewc2'  WHERE slug = 'nhl-r1-e2';  -- CAR vs OTT
UPDATE series SET team1_slug = 'nhl-atl2', team2_slug = 'nhl-atl3'  WHERE slug = 'nhl-r1-e3';  -- TBL vs MTL
UPDATE series SET team1_slug = 'nhl-met2', team2_slug = 'nhl-met3'  WHERE slug = 'nhl-r1-e4';  -- PIT vs PHI

-- West
UPDATE series SET team1_slug = 'nhl-cen1', team2_slug = 'nhl-wwc2'  WHERE slug = 'nhl-r1-w1';  -- COL vs LAK
UPDATE series SET team1_slug = 'nhl-pac1', team2_slug = 'nhl-wwc1'  WHERE slug = 'nhl-r1-w2';  -- VGK vs UTA
UPDATE series SET team1_slug = 'nhl-cen2', team2_slug = 'nhl-cen3'  WHERE slug = 'nhl-r1-w3';  -- DAL vs MIN
UPDATE series SET team1_slug = 'nhl-pac2', team2_slug = 'nhl-pac3'  WHERE slug = 'nhl-r1-w4';  -- EDM vs ANA
