import { createClient } from '@/lib/supabase/server'
import type { Team, Series, Player, PlayoffSettings, NHLDivision } from '@/lib/types'

// ── Teams ─────────────────────────────────────────────────────────────────────

export async function getTeams(league: 'NBA' | 'NHL'): Promise<Team[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('league', league)
    .order('conference')
    .order('seed')

  if (error) throw error
  return (data ?? []).map(rowToTeam)
}

export async function getAllTeams(): Promise<Team[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('league')
    .order('conference')
    .order('seed')

  if (error) throw error
  return (data ?? []).map(rowToTeam)
}

// ── Series ────────────────────────────────────────────────────────────────────

export async function getSeries(league: 'NBA' | 'NHL'): Promise<Series[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .eq('league', league)
    .order('round')

  if (error) throw error
  return (data ?? []).map(rowToSeries)
}

export async function getAllSeries(): Promise<Series[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .order('league')
    .order('round')

  if (error) throw error
  return (data ?? []).map(rowToSeries)
}

// ── Players + Rankings ────────────────────────────────────────────────────────

export async function getPlayersWithRankings(): Promise<Player[]> {
  const supabase = await createClient()

  const [playersRes, rankingsRes] = await Promise.all([
    supabase.from('players').select('id, display_name').order('display_name'),
    supabase.from('rankings').select('player_id, league, ordered_slugs'),
  ])

  if (playersRes.error) throw playersRes.error
  if (rankingsRes.error) throw rankingsRes.error

  const rankingsByPlayer: Record<string, { nba: string[]; nhl: string[] }> = {}
  for (const r of rankingsRes.data ?? []) {
    if (!rankingsByPlayer[r.player_id]) {
      rankingsByPlayer[r.player_id] = { nba: [], nhl: [] }
    }
    const key = r.league.toLowerCase() as 'nba' | 'nhl'
    rankingsByPlayer[r.player_id][key] = r.ordered_slugs
  }

  return (playersRes.data ?? []).map((p) => ({
    id: p.id,
    name: p.display_name,
    rankings: rankingsByPlayer[p.id] ?? { nba: [], nhl: [] },
  }))
}

export async function getMyRankings(
  playerId: string,
  league: 'NBA' | 'NHL'
): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rankings')
    .select('ordered_slugs')
    .eq('player_id', playerId)
    .eq('league', league)
    .single()

  if (error && error.code !== 'PGRST116') throw error  // PGRST116 = not found
  return data?.ordered_slugs ?? []
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getPlayoffSettings(): Promise<PlayoffSettings> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('playoff_settings')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) throw error
  return {
    nbaPicksLocked: data.nba_picks_locked,
    nhlPicksLocked: data.nhl_picks_locked,
    teamsFinalized: data.teams_finalized,
    seasonLabel: data.season_label,
  }
}

// ── Admin mutations (called via Server Actions) ───────────────────────────────

export async function upsertTeam(team: {
  slug: string
  oldSlug?: string   // NBA only: the slot this team is moving FROM (triggers a swap)
  name: string
  abbreviation: string
  league: 'NBA' | 'NHL'
  conference: 'East' | 'West'
  seed: number
  division?: NHLDivision | null
  points?: number | null
  eliminated?: boolean
  roundEliminated?: number | null
}) {
  const supabase = await createClient()

  // NBA slot swap: when seed/conference changes, the team moves to a new positional slot.
  // Read whoever is currently occupying the target slot and write them back to the old slot,
  // so no team data is lost and all series FK references stay valid.
  if (team.league === 'NBA' && team.oldSlug && team.oldSlug !== team.slug) {
    const { data: displaced } = await supabase
      .from('teams')
      .select('name, abbreviation, conference, seed, division, points, eliminated, round_eliminated')
      .eq('slug', team.slug)
      .eq('league', 'NBA')
      .maybeSingle()

    if (displaced) {
      const { error: swapErr } = await supabase.from('teams').update({
        name: displaced.name,
        abbreviation: displaced.abbreviation,
        conference: displaced.conference,
        seed: displaced.seed,
        division: displaced.division,
        points: displaced.points,
        eliminated: displaced.eliminated,
        round_eliminated: displaced.round_eliminated,
      }).eq('slug', team.oldSlug).eq('league', 'NBA')
      if (swapErr) throw swapErr
    }
  }

  const { error } = await supabase.from('teams').upsert({
    slug: team.slug,
    name: team.name,
    abbreviation: team.abbreviation,
    league: team.league,
    conference: team.conference,
    seed: team.seed,
    division: team.division ?? null,
    points: team.points ?? null,
    eliminated: team.eliminated ?? false,
    round_eliminated: team.roundEliminated ?? null,
  }, { onConflict: 'slug' })
  if (error) throw error
}

export async function autoAssignNHLWildCardSeries(): Promise<void> {
  const supabase = await createClient()

  // Fetch the four division winners (seed=1, not WC)
  const { data: divWinners, error } = await supabase
    .from('teams')
    .select('slug, division, conference, points')
    .eq('league', 'NHL')
    .eq('seed', 1)
    .neq('division', 'WC')

  if (error) throw error

  const atl1 = divWinners?.find(t => t.division === 'Atlantic')
  const met1 = divWinners?.find(t => t.division === 'Metropolitan')
  const cen1 = divWinners?.find(t => t.division === 'Central')
  const pac1 = divWinners?.find(t => t.division === 'Pacific')

  if (!atl1 || !met1 || !cen1 || !pac1)
    throw new Error('All four division winners (ATL1, MET1, CEN1, PAC1) must be set first')
  if (atl1.points == null || met1.points == null || cen1.points == null || pac1.points == null)
    throw new Error('Set points for all four division winners before auto-assigning')

  // Rule: best record division winner plays lesser WC (WC2); other plays WC1
  const atlIsBest = atl1.points >= met1.points
  const cenIsBest = cen1.points >= pac1.points

  const updates = await Promise.all([
    supabase.from('series').update({ team2_slug: atlIsBest ? 'nhl-ewc2' : 'nhl-ewc1' }).eq('slug', 'nhl-r1-e1'),
    supabase.from('series').update({ team2_slug: atlIsBest ? 'nhl-ewc1' : 'nhl-ewc2' }).eq('slug', 'nhl-r1-e2'),
    supabase.from('series').update({ team2_slug: cenIsBest ? 'nhl-wwc2' : 'nhl-wwc1' }).eq('slug', 'nhl-r1-w1'),
    supabase.from('series').update({ team2_slug: cenIsBest ? 'nhl-wwc1' : 'nhl-wwc2' }).eq('slug', 'nhl-r1-w2'),
  ])

  for (const { error: e } of updates) {
    if (e) throw e
  }
}

export async function deleteTeam(slug: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('teams').delete().eq('slug', slug)
  if (error) throw error
}

export async function updateSeries(
  slug: string,
  team1Wins: number,
  team2Wins: number,
  winnerSlug: string | null,
  team1Slug?: string | null,
  team2Slug?: string | null
) {
  const supabase = await createClient()
  const update: Record<string, unknown> = {
    team1_wins: team1Wins,
    team2_wins: team2Wins,
    winner_slug: winnerSlug,
  }
  if (team1Slug !== undefined) update.team1_slug = team1Slug
  if (team2Slug !== undefined) update.team2_slug = team2Slug

  const { error } = await supabase
    .from('series')
    .update(update)
    .eq('slug', slug)
  if (error) throw error
}

export async function upsertRankings(
  playerId: string,
  league: 'NBA' | 'NHL',
  orderedSlugs: string[]
) {
  const supabase = await createClient()
  const { error } = await supabase.from('rankings').upsert(
    { player_id: playerId, league, ordered_slugs: orderedSlugs, updated_at: new Date().toISOString() },
    { onConflict: 'player_id,league' }
  )
  if (error) throw error
}

export async function updatePlayoffSettings(settings: Partial<{
  nbaPicksLocked: boolean
  nhlPicksLocked: boolean
  teamsFinalized: boolean
  seasonLabel: string
}>) {
  const supabase = await createClient()
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (settings.nbaPicksLocked !== undefined) update.nba_picks_locked = settings.nbaPicksLocked
  if (settings.nhlPicksLocked !== undefined) update.nhl_picks_locked = settings.nhlPicksLocked
  if (settings.teamsFinalized !== undefined) update.teams_finalized = settings.teamsFinalized
  if (settings.seasonLabel !== undefined) update.season_label = settings.seasonLabel

  const { error } = await supabase
    .from('playoff_settings')
    .update(update)
    .eq('id', 1)
  if (error) throw error
}

// ── Row mappers ───────────────────────────────────────────────────────────────

function rowToTeam(row: Record<string, unknown>): Team {
  return {
    id: row.slug as string,
    slug: row.slug as string,
    name: row.name as string,
    abbreviation: row.abbreviation as string,
    league: row.league as 'NBA' | 'NHL',
    conference: row.conference as 'East' | 'West',
    seed: row.seed as number,
    division: (row.division as NHLDivision) ?? null,
    points: (row.points as number) ?? null,
    eliminated: row.eliminated as boolean,
    roundEliminated: row.round_eliminated as number | null,
  }
}

function rowToSeries(row: Record<string, unknown>): Series {
  return {
    id: row.slug as string,
    slug: row.slug as string,
    league: row.league as 'NBA' | 'NHL',
    round: row.round as 1 | 2 | 3 | 4,
    conference: row.conference as 'East' | 'West' | undefined,
    team1Id: (row.team1_slug as string) ?? '',
    team2Id: (row.team2_slug as string) ?? '',
    team1Wins: row.team1_wins as number,
    team2Wins: row.team2_wins as number,
    winner: (row.winner_slug as string) ?? null,
  }
}
