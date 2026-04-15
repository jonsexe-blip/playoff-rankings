export type NHLDivision = 'Atlantic' | 'Metropolitan' | 'Central' | 'Pacific' | 'WC'

export interface Team {
  id: string          // slug, e.g. 'bos', 'okc'
  slug: string
  name: string
  abbreviation: string
  league: 'NBA' | 'NHL'
  conference: 'East' | 'West'
  seed: number
  // NHL only: division within conference ('WC' = wild card)
  division: NHLDivision | null
  // NHL only: current regular-season points, used to auto-assign wild card matchups
  points: number | null
  eliminated: boolean
  roundEliminated: number | null
}

/**
 * Returns the display label for a team's playoff position.
 * NBA: just the seed number (e.g. "3")
 * NHL division team: "ATL 1", "MET 2", "CEN 3", "PAC 1"
 * NHL wild card: "WC 1", "WC 2"
 */
export function teamSeedLabel(team: Team): string {
  if (team.league === 'NBA' || !team.division) return String(team.seed)
  if (team.division === 'WC') return `WC ${team.seed}`
  const abbr: Record<NHLDivision, string> = {
    Atlantic: 'ATL',
    Metropolitan: 'MET',
    Central: 'CEN',
    Pacific: 'PAC',
    WC: 'WC',
  }
  return `${abbr[team.division]} ${team.seed}`
}

export interface Series {
  id: string          // slug, e.g. 'nba-r1-e1'
  slug: string
  league: 'NBA' | 'NHL'
  round: 1 | 2 | 3 | 4
  conference?: 'East' | 'West'
  team1Id: string     // team slug
  team2Id: string     // team slug
  team1Wins: number
  team2Wins: number
  winner: string | null  // team slug
}

export interface Player {
  id: string
  name: string
  rankings: {
    nba: string[]   // ordered team slugs, index 0 = rank #1
    nhl: string[]
  }
}

export interface PlayoffSettings {
  nbaPicksLocked: boolean
  nhlPicksLocked: boolean
  teamsFinalized: boolean
  seasonLabel: string
}

// Derived type used for leaderboard display
export interface PlayerScore {
  player: Player
  nbaScore: number
  nhlScore: number
  total: number
}
