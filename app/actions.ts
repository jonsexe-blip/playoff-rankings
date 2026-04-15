'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  upsertRankings,
  updateSeries,
  upsertTeam,
  deleteTeam,
  updatePlayoffSettings,
  autoAssignNHLWildCardSeries,
} from '@/lib/supabase/queries'

// ── Auth helper ───────────────────────────────────────────────────────────────

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return { supabase, userId: user.id }
}

async function requireAdmin() {
  const { supabase, userId } = await requireAuth()
  const { data: player } = await supabase
    .from('players')
    .select('is_admin')
    .eq('id', userId)
    .single()
  if (!player?.is_admin) throw new Error('Not authorized')
  return { supabase, userId }
}

// ── Player Actions ────────────────────────────────────────────────────────────

export async function saveRankingsAction(
  league: 'NBA' | 'NHL',
  orderedSlugs: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await requireAuth()
    if (orderedSlugs.length !== 16) {
      return { success: false, error: 'Rankings must include exactly 16 teams' }
    }
    await upsertRankings(userId, league, orderedSlugs)
    revalidatePath('/')
    revalidatePath('/player')
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

// ── Admin Actions ─────────────────────────────────────────────────────────────

export async function updateSeriesAction(
  slug: string,
  team1Wins: number,
  team2Wins: number,
  winnerSlug: string | null,
  team1Slug?: string | null,
  team2Slug?: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    await updateSeries(slug, team1Wins, team2Wins, winnerSlug, team1Slug, team2Slug)
    revalidatePath('/')
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function upsertTeamAction(team: {
  slug: string
  oldSlug?: string
  name: string
  abbreviation: string
  league: 'NBA' | 'NHL'
  conference: 'East' | 'West'
  seed: number
  division?: import('@/lib/types').NHLDivision | null
  points?: number | null
  eliminated?: boolean
  roundEliminated?: number | null
}): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    await upsertTeam(team)
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function deleteTeamAction(
  slug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    await deleteTeam(slug)
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function autoAssignNHLSeriesAction(): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    await autoAssignNHLWildCardSeries()
    revalidatePath('/')
    revalidatePath('/admin')
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export async function updatePlayoffSettingsAction(
  settings: Partial<{
    nbaPicksLocked: boolean
    nhlPicksLocked: boolean
    teamsFinalized: boolean
    seasonLabel: string
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    await updatePlayoffSettings(settings)
    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/player')
    return { success: true }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}
