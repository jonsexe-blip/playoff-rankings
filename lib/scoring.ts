import type { Player, Series, PlayerScore, PathEntry, Team } from '@/lib/types'

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

// P(team1 wins series) based on seed strength. Lower seed number = stronger team.
// NBA: strength = 9 - seed (seed 1 → 8, seed 8 → 1)
// NHL: div winner=5, div 2nd=4, div 3rd=3, WC1=2, WC2=1
function seriesWinProb(team1Slug: string, team2Slug: string, teamsById: Map<string, Team>): number {
  function strength(slug: string): number {
    const t = teamsById.get(slug)
    if (!t) return 1
    if (t.league === 'NBA') return 9 - t.seed
    if (t.division === 'WC') return t.seed === 1 ? 2 : 1
    return 6 - t.seed  // div winner=5, div 2nd=4, div 3rd=3
  }
  const s1 = strength(team1Slug), s2 = strength(team2Slug)
  return s1 / (s1 + s2)
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

// ── Win probability helpers ──────────────────────────────────────────────────

function isRoundComplete(series: Series[], round: 1 | 2 | 3 | 4): boolean {
  const roundSeries = series.filter(s => s.round === round)
  return roundSeries.length > 0 && roundSeries.every(s => s.winner !== null)
}

// Recursive enumeration: processes one unresolved series at a time so that
// propagated team IDs are picked up in subsequent recursive steps.
// Handles R2→R3 propagation (once both R2 series in a conference resolve,
// populate the R3 matchup slots) and R3→R4 propagation (CF winner → Finals).
function enumerate(
  series: Series[],
  teamsById: Map<string, Team>
): { sim: Series[], weight: number }[] {
  const next = series.find(s => s.winner === null && s.team1Id && s.team2Id)
  if (!next) return [{ sim: series, weight: 1.0 }]

  const p1 = seriesWinProb(next.team1Id, next.team2Id, teamsById)
  const results: { sim: Series[], weight: number }[] = []

  for (const [winner, p] of [[next.team1Id, p1], [next.team2Id, 1 - p1]] as const) {
    let updated = series.map(s => s.id === next.id ? { ...s, winner } : s)

    if (next.round === 2) {
      // Once both R2 series in this conference are decided, populate R3 team slots
      const confR2 = updated.filter(s => s.round === 2 && s.conference === next.conference)
      if (confR2.every(s => s.winner !== null)) {
        const [w1, w2] = confR2.map(s => s.winner!)
        updated = updated.map(s => {
          if (s.round !== 3 || s.conference !== next.conference || s.team1Id) return s
          return { ...s, team1Id: w1, team2Id: w2 }
        })
      }
    }

    if (next.round === 3) {
      // Propagate CF winner into Finals (R4) team slots
      updated = updated.map(s => {
        if (s.round !== 4) return s
        return {
          ...s,
          ...(next.conference === 'East' ? { team1Id: winner } : { team2Id: winner }),
        }
      })
    }

    for (const sub of enumerate(updated, teamsById)) {
      results.push({ sim: sub.sim, weight: p * sub.weight })
    }
  }
  return results
}

function buildAllScenarios(
  nbaSeries: Series[],
  nhlSeries: Series[],
  teamsById: Map<string, Team>
): { nba: Series[], nhl: Series[], weight: number }[] {
  const nbaScenarios = enumerate(nbaSeries, teamsById)
  const nhlScenarios = enumerate(nhlSeries, teamsById)
  return nbaScenarios.flatMap(nba =>
    nhlScenarios.map(nhl => ({ nba: nba.sim, nhl: nhl.sim, weight: nba.weight * nhl.weight }))
  )
}

function calculateWinProbabilities(
  players: Player[],
  nbaSeries: Series[],
  nhlSeries: Series[],
  teamsById: Map<string, Team>
): Map<string, number> {
  const allScenarios = buildAllScenarios(nbaSeries, nhlSeries, teamsById)
  const wins: Record<string, number> = Object.fromEntries(players.map(p => [p.id, 0]))

  for (const { nba, nhl, weight } of allScenarios) {
    const nbaRes = deriveResults(nba)
    const nhlRes = deriveResults(nhl)
    const totals = players.map(p => ({
      id: p.id,
      total: calculatePlayerScore(p, nbaRes, 'nba', teamsById)
        + calculatePlayerScore(p, nhlRes, 'nhl', teamsById),
    }))
    if (totals.length === 0) continue
    const max = Math.max(...totals.map(t => t.total))
    const scenarioWinners = totals.filter(t => t.total === max)
    scenarioWinners.forEach(w => { wins[w.id] += weight / scenarioWinners.length })
  }

  return new Map(players.map(p => [p.id, wins[p.id]]))
}

function calculateWinningPaths(
  players: Player[],
  nbaSeries: Series[],
  nhlSeries: Series[],
  teamsById: Map<string, Team>
): Map<string, PathEntry[] | 'any' | 'eliminated'> {
  const allScenarios = buildAllScenarios(nbaSeries, nhlSeries, teamsById)
  const result = new Map<string, PathEntry[] | 'any' | 'eliminated'>()

  for (const player of players) {
    const winningScenarios: PathEntry[] = []

    for (const { nba, nhl } of allScenarios) {
      const nbaRes = deriveResults(nba)
      const nhlRes = deriveResults(nhl)
      const myTotal =
        calculatePlayerScore(player, nbaRes, 'nba', teamsById) +
        calculatePlayerScore(player, nhlRes, 'nhl', teamsById)
      const allTotals = players.map(p =>
        calculatePlayerScore(p, nbaRes, 'nba', teamsById) +
        calculatePlayerScore(p, nhlRes, 'nhl', teamsById)
      )
      if (myTotal === Math.max(...allTotals)) {
        const nbaChamp = nba.find(s => s.round === 4)?.winner ?? ''
        const nhlChamp = nhl.find(s => s.round === 4)?.winner ?? ''
        winningScenarios.push({
          nbaWinner: teamsById.get(nbaChamp)?.abbreviation ?? nbaChamp,
          nhlWinner: teamsById.get(nhlChamp)?.abbreviation ?? nhlChamp,
        })
      }
    }

    if (winningScenarios.length === 0) result.set(player.id, 'eliminated')
    else if (winningScenarios.length === allScenarios.length) result.set(player.id, 'any')
    else result.set(player.id, winningScenarios)
  }

  return result
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

  const nbaR1Done = isRoundComplete(nbaSeries, 1)
  const nhlR1Done = isRoundComplete(nhlSeries, 1)
  const nbaR2Done = isRoundComplete(nbaSeries, 2)
  const nhlR2Done = isRoundComplete(nhlSeries, 2)
  const nbaR3Done = isRoundComplete(nbaSeries, 3)
  const nhlR3Done = isRoundComplete(nhlSeries, 3)
  const nbaR4Done = isRoundComplete(nbaSeries, 4)
  const nhlR4Done = isRoundComplete(nhlSeries, 4)

  const showWinProb = nbaR1Done && nhlR1Done && !(nbaR4Done && nhlR4Done)
  const showPath    = nbaR3Done && nhlR3Done && !(nbaR4Done && nhlR4Done)

  const winProbMap = showWinProb
    ? calculateWinProbabilities(players, nbaSeries, nhlSeries, teamsById)
    : null
  const pathMap = showPath
    ? calculateWinningPaths(players, nbaSeries, nhlSeries, teamsById)
    : null

  return players
    .map((player) => {
      const nbaScore = calculatePlayerScore(player, nbaResults, 'nba', teamsById)
      const nhlScore = calculatePlayerScore(player, nhlResults, 'nhl', teamsById)
      const entry: PlayerScore = { player, nbaScore, nhlScore, total: nbaScore + nhlScore }
      if (winProbMap !== null) entry.winProbability = winProbMap.get(player.id)
      if (pathMap !== null) entry.winningPaths = pathMap.get(player.id)
      return entry
    })
    .sort((a, b) => b.total - a.total)
}
