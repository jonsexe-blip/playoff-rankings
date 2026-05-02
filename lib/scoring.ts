import type { Player, Series, PlayerScore, Team, PickResult } from '@/lib/types'

const NBA_MULTIPLIERS: Record<number, number> = {
  1: 1.0, 2: 1.1, 3: 1.2, 4: 1.3,
  5: 1.5, 6: 1.6, 7: 1.8, 8: 2.0,
}

function getSeedMultiplier(slug: string, teamsById: Map<string, Team>): number {
  const team = teamsById.get(slug)
  if (!team) return 1.0
  if (team.league === 'NBA') return NBA_MULTIPLIERS[team.seed] ?? 1.0
  // NHL: division winner=1.0, div 2nd=1.15, div 3rd=1.3, WC1=1.4, WC2=1.5
  if (team.division === 'WC') return team.seed === 1 ? 1.4 : 1.5
  return team.seed === 1 ? 1.0 : team.seed === 2 ? 1.15 : 1.3
}

interface LeagueResults {
  champion: string | null
  finalists: string[]      // R3 winners — both teams that reached the finals
  conferenceFinals: string[]
  secondRound: string[]
}

export function deriveResults(series: Series[]): LeagueResults {
  const results: LeagueResults = {
    champion: null,
    finalists: [],
    conferenceFinals: [],
    secondRound: [],
  }

  for (const s of series) {
    if (!s.winner) continue
    if (s.round === 4) results.champion = s.winner
    if (s.round === 3) results.finalists.push(s.winner)
    if (s.round === 2) results.conferenceFinals.push(s.winner)
    if (s.round === 1) results.secondRound.push(s.winner)
  }

  return results
}

// Points formula: roundBase * (16 - ranking) * upsetMultiplier
// ranking is 1-indexed (rank 1 = most pts, rank 16 = 0 pts)
// Rounds: R1=2, R2=4, R3=8, R4=16 — doubles each round
// Teams earn points at each round they advance through (cumulative)
function roundScore(idx: number, base: number, slug: string, teamsById: Map<string, Team>): number {
  const pts = Math.max(0, 16 - (idx + 1)) // 16 - ranking, 1-indexed
  return base * pts * getSeedMultiplier(slug, teamsById)
}

export function calculatePlayerScore(
  player: Player,
  results: LeagueResults,
  league: 'nba' | 'nhl',
  teamsById: Map<string, Team> = new Map()
): number {
  let score = 0
  const rankings = player.rankings[league]

  if (results.champion) {
    const idx = rankings.indexOf(results.champion)
    if (idx !== -1) score += roundScore(idx, 16, results.champion, teamsById)
  }

  for (const teamId of results.finalists) {
    const idx = rankings.indexOf(teamId)
    if (idx !== -1) score += roundScore(idx, 8, teamId, teamsById)
  }

  for (const teamId of results.conferenceFinals) {
    const idx = rankings.indexOf(teamId)
    if (idx !== -1) score += roundScore(idx, 4, teamId, teamsById)
  }

  for (const teamId of results.secondRound) {
    const idx = rankings.indexOf(teamId)
    if (idx !== -1) score += roundScore(idx, 2, teamId, teamsById)
  }

  return score
}

function calculatePickBreakdown(
  player: Player,
  results: LeagueResults,
  league: 'nba' | 'nhl',
  teamsById: Map<string, Team>
): PickResult[] {
  const rankings = player.rankings[league]
  const picks: PickResult[] = []

  const add = (teamId: string | null, base: number, roundLabel: PickResult['roundLabel']) => {
    if (!teamId) return
    const idx = rankings.indexOf(teamId)
    if (idx === -1) return
    const points = roundScore(idx, base, teamId, teamsById)
    if (points <= 0) return
    const team = teamsById.get(teamId)
    const multiplier = getSeedMultiplier(teamId, teamsById)
    picks.push({ teamId, teamName: team?.abbreviation ?? teamId, rank: idx + 1, roundLabel, base, multiplier, points })
  }

  add(results.champion, 16, 'Champion')
  for (const t of results.finalists) add(t, 8, 'Finals')
  for (const t of results.conferenceFinals) add(t, 4, 'Conf. Finals')
  for (const t of results.secondRound) add(t, 2, 'Second Round')

  return picks.sort((a, b) => b.points - a.points)
}

// ── Main entry point ─────────────────────────────────────────────────────────

export function calculatePlayerScores(
  players: Player[],
  nbaSeries: Series[],
  nhlSeries: Series[],
  teams: Team[] = []
): PlayerScore[] {
  const nbaResults = deriveResults(nbaSeries)
  const nhlResults = deriveResults(nhlSeries)
  const teamsById = new Map(teams.map(t => [t.slug, t]))

  return players
    .map((player) => {
      const nbaScore = calculatePlayerScore(player, nbaResults, 'nba', teamsById)
      const nhlScore = calculatePlayerScore(player, nhlResults, 'nhl', teamsById)
      const nbaBreakdown = calculatePickBreakdown(player, nbaResults, 'nba', teamsById)
      const nhlBreakdown = calculatePickBreakdown(player, nhlResults, 'nhl', teamsById)
      return { player, nbaScore, nhlScore, total: nbaScore + nhlScore, nbaBreakdown, nhlBreakdown }
    })
    .sort((a, b) => b.total - a.total)
}
