-- ============================================================
-- Migration: Add points column to teams
-- Run this in the Supabase SQL Editor if you already ran
-- migration_reset_slugs.sql (it adds the column safely).
-- ============================================================

ALTER TABLE teams ADD COLUMN IF NOT EXISTS points int;
