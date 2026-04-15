import type { Player, Series, PlayerScore } from '@/lib/types'

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
  league: 'nba' | 'nhl'
): number {
  let score = 0
  const rankings = player.rankings[league]

  if (results.champion) {
    const idx = rankings.indexOf(results.champion)
    if (idx !== -1) score += Math.max(0, 16 - idx)
  }

  if (results.finalist) {
    const idx = rankings.indexOf(results.finalist)
    if (idx !== -1) score += Math.max(0, 8 - Math.abs(1 - idx))
  }

  for (const teamId of results.conferenceFinals) {
    const idx = rankings.indexOf(teamId)
    if (idx !== -1 && idx < 4) score += 4
  }

  for (const teamId of results.secondRound) {
    const idx = rankings.indexOf(teamId)
    if (idx !== -1 && idx < 8) score += 2
  }

  return score
}

export function calculatePlayerScores(
  players: Player[],
  nbaSeries: Series[],
  nhlSeries: Series[]
): PlayerScore[] {
  const nbaResults = deriveResults(nbaSeries)
  const nhlResults = deriveResults(nhlSeries)

  return players
    .map((player) => {
      const nbaScore = calculatePlayerScore(player, nbaResults, 'nba')
      const nhlScore = calculatePlayerScore(player, nhlResults, 'nhl')
      return { player, nbaScore, nhlScore, total: nbaScore + nhlScore }
    })
    .sort((a, b) => b.total - a.total)
}
