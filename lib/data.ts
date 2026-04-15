// Types
export interface Team {
  id: string
  name: string
  abbreviation: string
  league: 'NBA' | 'NHL'
  seed: number
  eliminated: boolean
  roundEliminated: number | null
}

export interface Series {
  id: string
  round: 1 | 2 | 3 | 4 // 1 = First Round, 2 = Second Round, 3 = Conf Finals, 4 = Finals
  team1Id: string
  team2Id: string
  team1Wins: number
  team2Wins: number
  winner: string | null
  conference?: 'East' | 'West'
}

export interface Bracket {
  nba: Series[]
  nhl: Series[]
}

export interface Player {
  id: string
  name: string
  rankings: {
    nba: string[]
    nhl: string[]
  }
}

export interface PlayoffResults {
  nba: {
    champion: string | null
    finalist: string | null
    conferenceFinals: string[]
    secondRound: string[]
  }
  nhl: {
    champion: string | null
    finalist: string | null
    conferenceFinals: string[]
    secondRound: string[]
  }
}

// Mock NBA Teams (16 playoff teams)
export const nbaTeams: Team[] = [
  // Eastern Conference
  { id: 'bos', name: 'Boston Celtics', abbreviation: 'BOS', league: 'NBA', seed: 1, eliminated: false, roundEliminated: null },
  { id: 'cle', name: 'Cleveland Cavaliers', abbreviation: 'CLE', league: 'NBA', seed: 2, eliminated: false, roundEliminated: null },
  { id: 'nyk', name: 'New York Knicks', abbreviation: 'NYK', league: 'NBA', seed: 3, eliminated: false, roundEliminated: null },
  { id: 'mil', name: 'Milwaukee Bucks', abbreviation: 'MIL', league: 'NBA', seed: 4, eliminated: false, roundEliminated: null },
  { id: 'ind', name: 'Indiana Pacers', abbreviation: 'IND', league: 'NBA', seed: 5, eliminated: false, roundEliminated: null },
  { id: 'mia', name: 'Miami Heat', abbreviation: 'MIA', league: 'NBA', seed: 6, eliminated: false, roundEliminated: null },
  { id: 'phi', name: 'Philadelphia 76ers', abbreviation: 'PHI', league: 'NBA', seed: 7, eliminated: false, roundEliminated: null },
  { id: 'orl', name: 'Orlando Magic', abbreviation: 'ORL', league: 'NBA', seed: 8, eliminated: false, roundEliminated: null },
  // Western Conference
  { id: 'okc', name: 'Oklahoma City Thunder', abbreviation: 'OKC', league: 'NBA', seed: 1, eliminated: false, roundEliminated: null },
  { id: 'den', name: 'Denver Nuggets', abbreviation: 'DEN', league: 'NBA', seed: 2, eliminated: false, roundEliminated: null },
  { id: 'min', name: 'Minnesota Timberwolves', abbreviation: 'MIN', league: 'NBA', seed: 3, eliminated: false, roundEliminated: null },
  { id: 'lac', name: 'LA Clippers', abbreviation: 'LAC', league: 'NBA', seed: 4, eliminated: false, roundEliminated: null },
  { id: 'dal', name: 'Dallas Mavericks', abbreviation: 'DAL', league: 'NBA', seed: 5, eliminated: false, roundEliminated: null },
  { id: 'phx', name: 'Phoenix Suns', abbreviation: 'PHX', league: 'NBA', seed: 6, eliminated: false, roundEliminated: null },
  { id: 'lal', name: 'Los Angeles Lakers', abbreviation: 'LAL', league: 'NBA', seed: 7, eliminated: false, roundEliminated: null },
  { id: 'sac', name: 'Sacramento Kings', abbreviation: 'SAC', league: 'NBA', seed: 8, eliminated: false, roundEliminated: null },
]

// Mock NHL Teams (16 playoff teams)
export const nhlTeams: Team[] = [
  // Eastern Conference
  { id: 'fla', name: 'Florida Panthers', abbreviation: 'FLA', league: 'NHL', seed: 1, eliminated: false, roundEliminated: null },
  { id: 'car', name: 'Carolina Hurricanes', abbreviation: 'CAR', league: 'NHL', seed: 2, eliminated: false, roundEliminated: null },
  { id: 'nyr', name: 'New York Rangers', abbreviation: 'NYR', league: 'NHL', seed: 3, eliminated: false, roundEliminated: null },
  { id: 'bos-nhl', name: 'Boston Bruins', abbreviation: 'BOS', league: 'NHL', seed: 4, eliminated: false, roundEliminated: null },
  { id: 'tor', name: 'Toronto Maple Leafs', abbreviation: 'TOR', league: 'NHL', seed: 5, eliminated: false, roundEliminated: null },
  { id: 'tbl', name: 'Tampa Bay Lightning', abbreviation: 'TBL', league: 'NHL', seed: 6, eliminated: false, roundEliminated: null },
  { id: 'njd', name: 'New Jersey Devils', abbreviation: 'NJD', league: 'NHL', seed: 7, eliminated: false, roundEliminated: null },
  { id: 'det', name: 'Detroit Red Wings', abbreviation: 'DET', league: 'NHL', seed: 8, eliminated: false, roundEliminated: null },
  // Western Conference
  { id: 'dal-nhl', name: 'Dallas Stars', abbreviation: 'DAL', league: 'NHL', seed: 1, eliminated: false, roundEliminated: null },
  { id: 'col', name: 'Colorado Avalanche', abbreviation: 'COL', league: 'NHL', seed: 2, eliminated: false, roundEliminated: null },
  { id: 'wpg', name: 'Winnipeg Jets', abbreviation: 'WPG', league: 'NHL', seed: 3, eliminated: false, roundEliminated: null },
  { id: 'van', name: 'Vancouver Canucks', abbreviation: 'VAN', league: 'NHL', seed: 4, eliminated: false, roundEliminated: null },
  { id: 'edm', name: 'Edmonton Oilers', abbreviation: 'EDM', league: 'NHL', seed: 5, eliminated: false, roundEliminated: null },
  { id: 'vgk', name: 'Vegas Golden Knights', abbreviation: 'VGK', league: 'NHL', seed: 6, eliminated: false, roundEliminated: null },
  { id: 'nsh', name: 'Nashville Predators', abbreviation: 'NSH', league: 'NHL', seed: 7, eliminated: false, roundEliminated: null },
  { id: 'lak', name: 'Los Angeles Kings', abbreviation: 'LAK', league: 'NHL', seed: 8, eliminated: false, roundEliminated: null },
]

// Mock bracket data with series results
export const initialBracket: Bracket = {
  nba: [
    // First Round - East
    { id: 'nba-r1-e1', round: 1, team1Id: 'bos', team2Id: 'orl', team1Wins: 3, team2Wins: 1, winner: null, conference: 'East' },
    { id: 'nba-r1-e2', round: 1, team1Id: 'cle', team2Id: 'phi', team1Wins: 2, team2Wins: 2, winner: null, conference: 'East' },
    { id: 'nba-r1-e3', round: 1, team1Id: 'nyk', team2Id: 'mia', team1Wins: 3, team2Wins: 2, winner: null, conference: 'East' },
    { id: 'nba-r1-e4', round: 1, team1Id: 'mil', team2Id: 'ind', team1Wins: 1, team2Wins: 3, winner: null, conference: 'East' },
    // First Round - West
    { id: 'nba-r1-w1', round: 1, team1Id: 'okc', team2Id: 'sac', team1Wins: 3, team2Wins: 1, winner: null, conference: 'West' },
    { id: 'nba-r1-w2', round: 1, team1Id: 'den', team2Id: 'lal', team1Wins: 2, team2Wins: 3, winner: null, conference: 'West' },
    { id: 'nba-r1-w3', round: 1, team1Id: 'min', team2Id: 'phx', team1Wins: 3, team2Wins: 0, winner: null, conference: 'West' },
    { id: 'nba-r1-w4', round: 1, team1Id: 'lac', team2Id: 'dal', team1Wins: 2, team2Wins: 2, winner: null, conference: 'West' },
    // Second Round placeholders
    { id: 'nba-r2-e1', round: 2, team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null, conference: 'East' },
    { id: 'nba-r2-e2', round: 2, team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null, conference: 'East' },
    { id: 'nba-r2-w1', round: 2, team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null, conference: 'West' },
    { id: 'nba-r2-w2', round: 2, team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null, conference: 'West' },
    // Conference Finals
    { id: 'nba-cf-e', round: 3, team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null, conference: 'East' },
    { id: 'nba-cf-w', round: 3, team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null, conference: 'West' },
    // Finals
    { id: 'nba-finals', round: 4, team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null },
  ],
  nhl: [
    // First Round - East
    { id: 'nhl-r1-e1', round: 1, team1Id: 'fla', team2Id: 'det', team1Wins: 4, team2Wins: 1, winner: 'fla', conference: 'East' },
    { id: 'nhl-r1-e2', round: 1, team1Id: 'car', team2Id: 'njd', team1Wins: 3, team2Wins: 2, winner: null, conference: 'East' },
    { id: 'nhl-r1-e3', round: 1, team1Id: 'nyr', team2Id: 'tbl', team1Wins: 2, team2Wins: 3, winner: null, conference: 'East' },
    { id: 'nhl-r1-e4', round: 1, team1Id: 'bos-nhl', team2Id: 'tor', team1Wins: 1, team2Wins: 3, winner: null, conference: 'East' },
    // First Round - West
    { id: 'nhl-r1-w1', round: 1, team1Id: 'dal-nhl', team2Id: 'lak', team1Wins: 3, team2Wins: 2, winner: null, conference: 'West' },
    { id: 'nhl-r1-w2', round: 1, team1Id: 'col', team2Id: 'nsh', team1Wins: 4, team2Wins: 0, winner: 'col', conference: 'West' },
    { id: 'nhl-r1-w3', round: 1, team1Id: 'wpg', team2Id: 'vgk', team1Wins: 2, team2Wins: 2, winner: null, conference: 'West' },
    { id: 'nhl-r1-w4', round: 1, team1Id: 'van', team2Id: 'edm', team1Wins: 1, team2Wins: 3, winner: null, conference: 'West' },
    // Second Round
    { id: 'nhl-r2-e1', round: 2, team1Id: 'fla', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null, conference: 'East' },
    { id: 'nhl-r2-e2', round: 2, team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null, conference: 'East' },
    { id: 'nhl-r2-w1', round: 2, team1Id: 'col', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null, conference: 'West' },
    { id: 'nhl-r2-w2', round: 2, team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null, conference: 'West' },
    // Conference Finals
    { id: 'nhl-cf-e', round: 3, team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null, conference: 'East' },
    { id: 'nhl-cf-w', round: 3, team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null, conference: 'West' },
    // Finals
    { id: 'nhl-finals', round: 4, team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null },
  ],
}

// Mock Players with random rankings
export const players: Player[] = [
  {
    id: 'player1',
    name: 'Mike Johnson',
    rankings: {
      nba: ['bos', 'okc', 'cle', 'den', 'nyk', 'min', 'mil', 'lac', 'phi', 'dal', 'mia', 'phx', 'ind', 'sac', 'orl', 'lal'],
      nhl: ['fla', 'dal-nhl', 'car', 'col', 'nyr', 'wpg', 'bos-nhl', 'van', 'tor', 'edm', 'tbl', 'nsh', 'njd', 'vgk', 'lak', 'det'],
    },
  },
  {
    id: 'player2',
    name: 'Sarah Williams',
    rankings: {
      nba: ['okc', 'bos', 'den', 'cle', 'mil', 'nyk', 'dal', 'min', 'phx', 'lac', 'mia', 'phi', 'ind', 'lal', 'orl', 'sac'],
      nhl: ['col', 'fla', 'edm', 'dal-nhl', 'car', 'nyr', 'van', 'wpg', 'tor', 'bos-nhl', 'vgk', 'tbl', 'lak', 'nsh', 'njd', 'det'],
    },
  },
  {
    id: 'player3',
    name: 'Chris Anderson',
    rankings: {
      nba: ['cle', 'bos', 'okc', 'nyk', 'den', 'phi', 'mil', 'min', 'dal', 'lac', 'ind', 'mia', 'phx', 'orl', 'sac', 'lal'],
      nhl: ['tor', 'fla', 'car', 'nyr', 'col', 'edm', 'wpg', 'bos-nhl', 'van', 'tbl', 'dal-nhl', 'vgk', 'njd', 'nsh', 'lak', 'det'],
    },
  },
  {
    id: 'player4',
    name: 'Alex Martinez',
    rankings: {
      nba: ['den', 'okc', 'bos', 'min', 'cle', 'mil', 'nyk', 'phx', 'dal', 'lac', 'phi', 'mia', 'ind', 'lal', 'sac', 'orl'],
      nhl: ['edm', 'col', 'fla', 'dal-nhl', 'van', 'car', 'wpg', 'nyr', 'vgk', 'bos-nhl', 'tor', 'tbl', 'lak', 'nsh', 'njd', 'det'],
    },
  },
  {
    id: 'player5',
    name: 'Jordan Lee',
    rankings: {
      nba: ['bos', 'cle', 'okc', 'nyk', 'mil', 'den', 'phi', 'min', 'dal', 'mia', 'lac', 'phx', 'ind', 'orl', 'lal', 'sac'],
      nhl: ['fla', 'car', 'nyr', 'col', 'dal-nhl', 'tor', 'bos-nhl', 'wpg', 'edm', 'van', 'tbl', 'vgk', 'njd', 'nsh', 'lak', 'det'],
    },
  },
]

// Mock Results
export const initialResults: PlayoffResults = {
  nba: {
    champion: null,
    finalist: null,
    conferenceFinals: [],
    secondRound: [],
  },
  nhl: {
    champion: null,
    finalist: null,
    conferenceFinals: [],
    secondRound: [],
  },
}

// Helper functions
export function getTeamById(id: string, league: 'NBA' | 'NHL'): Team | undefined {
  const teams = league === 'NBA' ? nbaTeams : nhlTeams
  return teams.find(t => t.id === id)
}

export function getRoundName(round: number): string {
  switch (round) {
    case 1: return 'First Round'
    case 2: return 'Second Round'
    case 3: return 'Conference Finals'
    case 4: return 'Finals'
    default: return ''
  }
}

// Scoring function
export function calculatePlayerScore(
  player: Player,
  results: PlayoffResults,
  league: 'nba' | 'nhl'
): number {
  let score = 0
  const rankings = player.rankings[league]
  const leagueResults = results[league]

  if (leagueResults.champion) {
    const championIndex = rankings.indexOf(leagueResults.champion)
    if (championIndex !== -1) {
      score += Math.max(0, 16 - championIndex)
    }
  }

  if (leagueResults.finalist) {
    const finalistIndex = rankings.indexOf(leagueResults.finalist)
    if (finalistIndex !== -1) {
      score += Math.max(0, 8 - Math.abs(1 - finalistIndex))
    }
  }

  leagueResults.conferenceFinals.forEach((teamId) => {
    const teamIndex = rankings.indexOf(teamId)
    if (teamIndex !== -1 && teamIndex < 4) {
      score += 4
    }
  })

  leagueResults.secondRound.forEach((teamId) => {
    const teamIndex = rankings.indexOf(teamId)
    if (teamIndex !== -1 && teamIndex < 8) {
      score += 2
    }
  })

  return score
}

export function calculateTotalScore(player: Player, results: PlayoffResults): number {
  return calculatePlayerScore(player, results, 'nba') + calculatePlayerScore(player, results, 'nhl')
}
