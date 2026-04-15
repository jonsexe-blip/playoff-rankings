-- ============================================================
-- Patch: Fix East wild card series matchups for 2025-26
-- Run this if you already ran migration_reset_slugs.sql.
--
-- 2025-26 reality:
--   ATL 1 (BUF) plays EWC 1 (OTT)   — ATL is the weaker division winner
--   MET 1 (CAR) plays EWC 2 (BOS)   — MET is the stronger division winner
--
-- West is correct as-is:
--   CEN 1 (COL) plays WWC 2 (LAK)
--   PAC 1 (VGK) plays WWC 1 (UTA)
-- ============================================================

UPDATE series SET team2_slug = 'nhl-ewc1' WHERE slug = 'nhl-r1-e1';
UPDATE series SET team2_slug = 'nhl-ewc2' WHERE slug = 'nhl-r1-e2';
