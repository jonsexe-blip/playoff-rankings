import type { Player, Series, PlayerScore, Team } from '@/lib/types'

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
  finalist: string | null
  conferenceFinals: string[]
  secondRound: string[]
}

/**
 * Derive scoring results (champion, finalist, conf finals, second round teams)
 * from a list of series for one league. This keeps the admin workflow simple —
 * the admin only updates series win counts and winners; scoring is derived.
 */
export function deriveResults(series: Series[]): LeagueResults {
  const results: LeagueResults = {
    champion: null,
    finalist: null,
    conferenceFinals: [],
    secondRound: [],
  }

  for (const s of series) {
    if (!s.winner) continue

    if (s.round === 4) {
      results.champion = s.winner
      // The finalist is the team that lost the finals
      const loser = s.team1Id === s.winner ? s.team2Id : s.team1Id
      if (loser) results.finalist = loser
    }

    if (s.round === 3) {
      // Both conference finals participants reached conf finals
      if (s.team1Id) results.conferenceFinals.push(s.team1Id)
      if (s.team2Id && s.team2Id !== s.team1Id) results.conferenceFinals.push(s.team2Id)
    }

    if (s.round === 2) {
      // Both second round participants reached second round
      if (s.team1Id) results.secondRound.push(s.team1Id)
      if (s.team2Id && s.team2Id !== s.team1Id) results.secondRound.push(s.team2Id)
    }
  }

  return results
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
    if (idx !== -1) {
      const pts = Math.max(0, 16 - idx)
      score += Math.round(pts * getSeedMultiplier(results.champion, teamsById))
    }
  }

  if (results.finalist) {
    const idx = rankings.indexOf(results.finalist)
    if (idx !== -1) {
      const pts = Math.max(0, 8 - Math.abs(1 - idx))
      score += Math.round(pts * getSeedMultiplier(results.finalist, teamsById))
    }
  }

  for (const teamId of results.conferenceFinals) {
    const idx = rankings.indexOf(teamId)
    if (idx !== -1 && idx < 4) {
      score += Math.round(4 * getSeedMultiplier(teamId, teamsById))
    }
  }

  for (const teamId of results.secondRound) {
    const idx = rankings.indexOf(teamId)
    if (idx !== -1 && idx < 8) {
      score += Math.round(2 * getSeedMultiplier(teamId, teamsById))
    }
  }

  return score
}

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
      return { player, nbaScore, nhlScore, total: nbaScore + nhlScore }
    })
    .sort((a, b) => b.total - a.total)
}
