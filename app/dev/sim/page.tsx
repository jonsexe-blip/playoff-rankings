// Dev-only simulation page — shows win probability + path to winning UI
// using hardcoded dummy data. Does NOT touch the database.

import { Leaderboard } from '@/components/leaderboard'
import { calculatePlayerScores } from '@/lib/scoring'
import type { Player, Series, Team } from '@/lib/types'

// ── Teams ─────────────────────────────────────────────────────────────────────

const NBA_TEAMS: Team[] = [
  { id: 'nba-e1', slug: 'nba-e1', name: 'Boston Celtics',         abbreviation: 'BOS', league: 'NBA', conference: 'East', seed: 1, division: null, points: null, eliminated: false, roundEliminated: null },
  { id: 'nba-e2', slug: 'nba-e2', name: 'New York Knicks',        abbreviation: 'NYK', league: 'NBA', conference: 'East', seed: 2, division: null, points: null, eliminated: false, roundEliminated: null },
  { id: 'nba-e3', slug: 'nba-e3', name: 'Cleveland Cavaliers',    abbreviation: 'CLE', league: 'NBA', conference: 'East', seed: 3, division: null, points: null, eliminated: false, roundEliminated: null },
  { id: 'nba-e4', slug: 'nba-e4', name: 'Indiana Pacers',         abbreviation: 'IND', league: 'NBA', conference: 'East', seed: 4, division: null, points: null, eliminated: false, roundEliminated: null },
  { id: 'nba-e5', slug: 'nba-e5', name: 'Milwaukee Bucks',        abbreviation: 'MIL', league: 'NBA', conference: 'East', seed: 5, division: null, points: null, eliminated: false, roundEliminated: null },
  { id: 'nba-e6', slug: 'nba-e6', name: 'Orlando Magic',          abbreviation: 'ORL', league: 'NBA', conference: 'East', seed: 6, division: null, points: null, eliminated: false, roundEliminated: null },
  { id: 'nba-e7', slug: 'nba-e7', name: 'Miami Heat',             abbreviation: 'MIA', league: 'NBA', conference: 'East', seed: 7, division: null, points: null, eliminated: false, roundEliminated: null },
  { id: 'nba-e8', slug: 'nba-e8', name: 'Chicago Bulls',          abbreviation: 'CHI', league: 'NBA', conference: 'East', seed: 8, division: null, points: null, eliminated: false, roundEliminated: null },
  { id: 'nba-w1', slug: 'nba-w1', name: 'Oklahoma City Thunder',  abbreviation: 'OKC', league: 'NBA', conference: 'West', seed: 1, division: null, points: null, eliminated: false, roundEliminated: null },
  { id: 'nba-w2', slug: 'nba-w2', name: 'Denver Nuggets',         abbreviation: 'DEN', league: 'NBA', conference: 'West', seed: 2, division: null, points: null, eliminated: false, roundEliminated: null },
  { id: 'nba-w3', slug: 'nba-w3', name: 'Minnesota Timberwolves', abbreviation: 'MIN', league: 'NBA', conference: 'West', seed: 3, division: null, points: null, eliminated: false, roundEliminated: null },
  { id: 'nba-w4', slug: 'nba-w4', name: 'Los Angeles Lakers',     abbreviation: 'LAL', league: 'NBA', conference: 'West', seed: 4, division: null, points: null, eliminated: false, roundEliminated: null },
  { id: 'nba-w5', slug: 'nba-w5', name: 'Sacramento Kings',       abbreviation: 'SAC', league: 'NBA', conference: 'West', seed: 5, division: null, points: null, eliminated: false, roundEliminated: null },
  { id: 'nba-w6', slug: 'nba-w6', name: 'Golden State Warriors',  abbreviation: 'GSW', league: 'NBA', conference: 'West', seed: 6, division: null, points: null, eliminated: false, roundEliminated: null },
  { id: 'nba-w7', slug: 'nba-w7', name: 'Portland Trail Blazers', abbreviation: 'POR', league: 'NBA', conference: 'West', seed: 7, division: null, points: null, eliminated: false, roundEliminated: null },
  { id: 'nba-w8', slug: 'nba-w8', name: 'Memphis Grizzlies',      abbreviation: 'MEM', league: 'NBA', conference: 'West', seed: 8, division: null, points: null, eliminated: false, roundEliminated: null },
]

const NHL_TEAMS: Team[] = [
  { id: 'nhl-atl1', slug: 'nhl-atl1', name: 'Buffalo Sabres',       abbreviation: 'BUF', league: 'NHL', conference: 'East', seed: 1, division: 'Atlantic',     points: null, eliminated: false, roundEliminated: null },
  { id: 'nhl-atl2', slug: 'nhl-atl2', name: 'Tampa Bay Lightning',  abbreviation: 'TBL', league: 'NHL', conference: 'East', seed: 2, division: 'Atlantic',     points: null, eliminated: false, roundEliminated: null },
  { id: 'nhl-atl3', slug: 'nhl-atl3', name: 'Montreal Canadiens',   abbreviation: 'MTL', league: 'NHL', conference: 'East', seed: 3, division: 'Atlantic',     points: null, eliminated: false, roundEliminated: null },
  { id: 'nhl-met1', slug: 'nhl-met1', name: 'Carolina Hurricanes',  abbreviation: 'CAR', league: 'NHL', conference: 'East', seed: 1, division: 'Metropolitan', points: null, eliminated: false, roundEliminated: null },
  { id: 'nhl-met2', slug: 'nhl-met2', name: 'Pittsburgh Penguins',  abbreviation: 'PIT', league: 'NHL', conference: 'East', seed: 2, division: 'Metropolitan', points: null, eliminated: false, roundEliminated: null },
  { id: 'nhl-met3', slug: 'nhl-met3', name: 'Philadelphia Flyers',  abbreviation: 'PHI', league: 'NHL', conference: 'East', seed: 3, division: 'Metropolitan', points: null, eliminated: false, roundEliminated: null },
  { id: 'nhl-ewc1', slug: 'nhl-ewc1', name: 'Boston Bruins',        abbreviation: 'BOS', league: 'NHL', conference: 'East', seed: 1, division: 'WC',           points: null, eliminated: false, roundEliminated: null },
  { id: 'nhl-ewc2', slug: 'nhl-ewc2', name: 'Ottawa Senators',      abbreviation: 'OTT', league: 'NHL', conference: 'East', seed: 2, division: 'WC',           points: null, eliminated: false, roundEliminated: null },
  { id: 'nhl-cen1', slug: 'nhl-cen1', name: 'Colorado Avalanche',   abbreviation: 'COL', league: 'NHL', conference: 'West', seed: 1, division: 'Central',      points: null, eliminated: false, roundEliminated: null },
  { id: 'nhl-cen2', slug: 'nhl-cen2', name: 'Dallas Stars',         abbreviation: 'DAL', league: 'NHL', conference: 'West', seed: 2, division: 'Central',      points: null, eliminated: false, roundEliminated: null },
  { id: 'nhl-cen3', slug: 'nhl-cen3', name: 'Minnesota Wild',       abbreviation: 'MIN', league: 'NHL', conference: 'West', seed: 3, division: 'Central',      points: null, eliminated: false, roundEliminated: null },
  { id: 'nhl-pac1', slug: 'nhl-pac1', name: 'Vegas Golden Knights', abbreviation: 'VGK', league: 'NHL', conference: 'West', seed: 1, division: 'Pacific',      points: null, eliminated: false, roundEliminated: null },
  { id: 'nhl-pac2', slug: 'nhl-pac2', name: 'Edmonton Oilers',      abbreviation: 'EDM', league: 'NHL', conference: 'West', seed: 2, division: 'Pacific',      points: null, eliminated: false, roundEliminated: null },
  { id: 'nhl-pac3', slug: 'nhl-pac3', name: 'Anaheim Ducks',        abbreviation: 'ANA', league: 'NHL', conference: 'West', seed: 3, division: 'Pacific',      points: null, eliminated: false, roundEliminated: null },
  { id: 'nhl-wwc1', slug: 'nhl-wwc1', name: 'Utah Hockey Club',     abbreviation: 'UTA', league: 'NHL', conference: 'West', seed: 1, division: 'WC',           points: null, eliminated: false, roundEliminated: null },
  { id: 'nhl-wwc2', slug: 'nhl-wwc2', name: 'Los Angeles Kings',    abbreviation: 'LAK', league: 'NHL', conference: 'West', seed: 2, division: 'WC',           points: null, eliminated: false, roundEliminated: null },
]

const ALL_TEAMS = [...NBA_TEAMS, ...NHL_TEAMS]

// ── R1 results ────────────────────────────────────────────────────────────────
// NBA: CHI (8) upsets BOS (1), ORL (6) upsets CLE (3), GSW (6) upsets MIN (3)
// NHL: PHI (MET3) upsets PIT (MET2), UTA (WWC1) upsets VGK (PAC1)

const NBA_R1: Series[] = [
  { id: 'nba-r1-e1', slug: 'nba-r1-e1', league: 'NBA', round: 1, conference: 'East', team1Id: 'nba-e1', team2Id: 'nba-e8', team1Wins: 2, team2Wins: 4, winner: 'nba-e8' }, // CHI upsets BOS
  { id: 'nba-r1-e2', slug: 'nba-r1-e2', league: 'NBA', round: 1, conference: 'East', team1Id: 'nba-e2', team2Id: 'nba-e7', team1Wins: 4, team2Wins: 1, winner: 'nba-e2' },
  { id: 'nba-r1-e3', slug: 'nba-r1-e3', league: 'NBA', round: 1, conference: 'East', team1Id: 'nba-e3', team2Id: 'nba-e6', team1Wins: 1, team2Wins: 4, winner: 'nba-e6' }, // ORL upsets CLE
  { id: 'nba-r1-e4', slug: 'nba-r1-e4', league: 'NBA', round: 1, conference: 'East', team1Id: 'nba-e4', team2Id: 'nba-e5', team1Wins: 4, team2Wins: 2, winner: 'nba-e4' },
  { id: 'nba-r1-w1', slug: 'nba-r1-w1', league: 'NBA', round: 1, conference: 'West', team1Id: 'nba-w1', team2Id: 'nba-w8', team1Wins: 4, team2Wins: 0, winner: 'nba-w1' },
  { id: 'nba-r1-w2', slug: 'nba-r1-w2', league: 'NBA', round: 1, conference: 'West', team1Id: 'nba-w2', team2Id: 'nba-w7', team1Wins: 4, team2Wins: 2, winner: 'nba-w2' },
  { id: 'nba-r1-w3', slug: 'nba-r1-w3', league: 'NBA', round: 1, conference: 'West', team1Id: 'nba-w3', team2Id: 'nba-w6', team1Wins: 1, team2Wins: 4, winner: 'nba-w6' }, // GSW upsets MIN
  { id: 'nba-r1-w4', slug: 'nba-r1-w4', league: 'NBA', round: 1, conference: 'West', team1Id: 'nba-w4', team2Id: 'nba-w5', team1Wins: 4, team2Wins: 3, winner: 'nba-w4' },
]

const NHL_R1: Series[] = [
  { id: 'nhl-r1-e1', slug: 'nhl-r1-e1', league: 'NHL', round: 1, conference: 'East', team1Id: 'nhl-atl1', team2Id: 'nhl-atl3', team1Wins: 4, team2Wins: 2, winner: 'nhl-atl1' },
  { id: 'nhl-r1-e2', slug: 'nhl-r1-e2', league: 'NHL', round: 1, conference: 'East', team1Id: 'nhl-atl2', team2Id: 'nhl-ewc1', team1Wins: 4, team2Wins: 3, winner: 'nhl-atl2' },
  { id: 'nhl-r1-e3', slug: 'nhl-r1-e3', league: 'NHL', round: 1, conference: 'East', team1Id: 'nhl-met1', team2Id: 'nhl-ewc2', team1Wins: 4, team2Wins: 1, winner: 'nhl-met1' },
  { id: 'nhl-r1-e4', slug: 'nhl-r1-e4', league: 'NHL', round: 1, conference: 'East', team1Id: 'nhl-met2', team2Id: 'nhl-met3', team1Wins: 2, team2Wins: 4, winner: 'nhl-met3' }, // PHI upsets PIT
  { id: 'nhl-r1-w1', slug: 'nhl-r1-w1', league: 'NHL', round: 1, conference: 'West', team1Id: 'nhl-cen1', team2Id: 'nhl-cen3', team1Wins: 4, team2Wins: 1, winner: 'nhl-cen1' },
  { id: 'nhl-r1-w2', slug: 'nhl-r1-w2', league: 'NHL', round: 1, conference: 'West', team1Id: 'nhl-cen2', team2Id: 'nhl-wwc2', team1Wins: 4, team2Wins: 2, winner: 'nhl-cen2' },
  { id: 'nhl-r1-w3', slug: 'nhl-r1-w3', league: 'NHL', round: 1, conference: 'West', team1Id: 'nhl-pac1', team2Id: 'nhl-wwc1', team1Wins: 1, team2Wins: 4, winner: 'nhl-wwc1' }, // UTA upsets VGK
  { id: 'nhl-r1-w4', slug: 'nhl-r1-w4', league: 'NHL', round: 1, conference: 'West', team1Id: 'nhl-pac2', team2Id: 'nhl-pac3', team1Wins: 4, team2Wins: 2, winner: 'nhl-pac2' },
]

// ── R2 results ────────────────────────────────────────────────────────────────
// NBA: NYK(2) beats CHI(8), ORL(6) beats IND(4), OKC(1) beats LAL(4), GSW(6) beats DEN(2)
// NHL: CAR beats BUF, PHI(3) beats TBL(2), COL beats UTA, EDM beats DAL

const NBA_R2: Series[] = [
  { id: 'nba-r2-e1', slug: 'nba-r2-e1', league: 'NBA', round: 2, conference: 'East', team1Id: 'nba-e8', team2Id: 'nba-e2', team1Wins: 2, team2Wins: 4, winner: 'nba-e2' }, // NYK beats CHI
  { id: 'nba-r2-e2', slug: 'nba-r2-e2', league: 'NBA', round: 2, conference: 'East', team1Id: 'nba-e6', team2Id: 'nba-e4', team1Wins: 4, team2Wins: 3, winner: 'nba-e6' }, // ORL beats IND
  { id: 'nba-r2-w1', slug: 'nba-r2-w1', league: 'NBA', round: 2, conference: 'West', team1Id: 'nba-w1', team2Id: 'nba-w4', team1Wins: 4, team2Wins: 1, winner: 'nba-w1' },
  { id: 'nba-r2-w2', slug: 'nba-r2-w2', league: 'NBA', round: 2, conference: 'West', team1Id: 'nba-w6', team2Id: 'nba-w2', team1Wins: 4, team2Wins: 3, winner: 'nba-w6' }, // GSW beats DEN
]

const NHL_R2: Series[] = [
  { id: 'nhl-r2-e1', slug: 'nhl-r2-e1', league: 'NHL', round: 2, conference: 'East', team1Id: 'nhl-met1', team2Id: 'nhl-atl1', team1Wins: 4, team2Wins: 2, winner: 'nhl-met1' },
  { id: 'nhl-r2-e2', slug: 'nhl-r2-e2', league: 'NHL', round: 2, conference: 'East', team1Id: 'nhl-met3', team2Id: 'nhl-atl2', team1Wins: 4, team2Wins: 3, winner: 'nhl-met3' }, // PHI beats TBL
  { id: 'nhl-r2-w1', slug: 'nhl-r2-w1', league: 'NHL', round: 2, conference: 'West', team1Id: 'nhl-cen1', team2Id: 'nhl-wwc1', team1Wins: 4, team2Wins: 2, winner: 'nhl-cen1' },
  { id: 'nhl-r2-w2', slug: 'nhl-r2-w2', league: 'NHL', round: 2, conference: 'West', team1Id: 'nhl-pac2', team2Id: 'nhl-cen2', team1Wins: 4, team2Wins: 1, winner: 'nhl-pac2' },
]

// ── State A: After R1 — R2 teams set, R3/R4 empty ────────────────────────────

const NBA_R2_PENDING: Series[] = [
  { id: 'nba-r2-e1', slug: 'nba-r2-e1', league: 'NBA', round: 2, conference: 'East', team1Id: 'nba-e8', team2Id: 'nba-e2', team1Wins: 0, team2Wins: 0, winner: null },
  { id: 'nba-r2-e2', slug: 'nba-r2-e2', league: 'NBA', round: 2, conference: 'East', team1Id: 'nba-e6', team2Id: 'nba-e4', team1Wins: 0, team2Wins: 0, winner: null },
  { id: 'nba-r2-w1', slug: 'nba-r2-w1', league: 'NBA', round: 2, conference: 'West', team1Id: 'nba-w1', team2Id: 'nba-w4', team1Wins: 0, team2Wins: 0, winner: null },
  { id: 'nba-r2-w2', slug: 'nba-r2-w2', league: 'NBA', round: 2, conference: 'West', team1Id: 'nba-w6', team2Id: 'nba-w2', team1Wins: 0, team2Wins: 0, winner: null },
]
const NBA_R3_EMPTY: Series[] = [
  { id: 'nba-r3-e', slug: 'nba-r3-e', league: 'NBA', round: 3, conference: 'East', team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null },
  { id: 'nba-r3-w', slug: 'nba-r3-w', league: 'NBA', round: 3, conference: 'West', team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null },
]
const NHL_R2_PENDING: Series[] = [
  { id: 'nhl-r2-e1', slug: 'nhl-r2-e1', league: 'NHL', round: 2, conference: 'East', team1Id: 'nhl-met1', team2Id: 'nhl-atl1', team1Wins: 0, team2Wins: 0, winner: null },
  { id: 'nhl-r2-e2', slug: 'nhl-r2-e2', league: 'NHL', round: 2, conference: 'East', team1Id: 'nhl-met3', team2Id: 'nhl-atl2', team1Wins: 0, team2Wins: 0, winner: null },
  { id: 'nhl-r2-w1', slug: 'nhl-r2-w1', league: 'NHL', round: 2, conference: 'West', team1Id: 'nhl-cen1', team2Id: 'nhl-wwc1', team1Wins: 0, team2Wins: 0, winner: null },
  { id: 'nhl-r2-w2', slug: 'nhl-r2-w2', league: 'NHL', round: 2, conference: 'West', team1Id: 'nhl-pac2', team2Id: 'nhl-cen2', team1Wins: 0, team2Wins: 0, winner: null },
]
const NHL_R3_EMPTY: Series[] = [
  { id: 'nhl-r3-e', slug: 'nhl-r3-e', league: 'NHL', round: 3, conference: 'East', team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null },
  { id: 'nhl-r3-w', slug: 'nhl-r3-w', league: 'NHL', round: 3, conference: 'West', team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null },
]

// ── State B: After R2 — CF teams set, no winners ──────────────────────────────
// NBA CF: NYK(2) vs ORL(6) East, OKC(1) vs GSW(6) West
// NHL CF: CAR(MET1) vs PHI(MET3) East, COL(CEN1) vs EDM(PAC2) West

const NBA_R3_PENDING: Series[] = [
  { id: 'nba-r3-e', slug: 'nba-r3-e', league: 'NBA', round: 3, conference: 'East', team1Id: 'nba-e2', team2Id: 'nba-e6', team1Wins: 0, team2Wins: 0, winner: null },
  { id: 'nba-r3-w', slug: 'nba-r3-w', league: 'NBA', round: 3, conference: 'West', team1Id: 'nba-w1', team2Id: 'nba-w6', team1Wins: 0, team2Wins: 0, winner: null },
]
const NBA_R4_EMPTY: Series[] = [
  { id: 'nba-r4', slug: 'nba-r4', league: 'NBA', round: 4, conference: undefined, team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null },
]
const NHL_R3_PENDING: Series[] = [
  { id: 'nhl-r3-e', slug: 'nhl-r3-e', league: 'NHL', round: 3, conference: 'East', team1Id: 'nhl-met1', team2Id: 'nhl-met3', team1Wins: 0, team2Wins: 0, winner: null },
  { id: 'nhl-r3-w', slug: 'nhl-r3-w', league: 'NHL', round: 3, conference: 'West', team1Id: 'nhl-cen1', team2Id: 'nhl-pac2', team1Wins: 0, team2Wins: 0, winner: null },
]
const NHL_R4_EMPTY: Series[] = [
  { id: 'nhl-r4', slug: 'nhl-r4', league: 'NHL', round: 4, conference: undefined, team1Id: '', team2Id: '', team1Wins: 0, team2Wins: 0, winner: null },
]

// ── State C: After R3 — Finals teams set, no winner ───────────────────────────
// NBA Finals: OKC(W1) vs ORL(E6)  NHL Finals: PHI(MET3) vs COL(CEN1)

const NBA_R3: Series[] = [
  { id: 'nba-r3-e', slug: 'nba-r3-e', league: 'NBA', round: 3, conference: 'East', team1Id: 'nba-e2', team2Id: 'nba-e6', team1Wins: 2, team2Wins: 4, winner: 'nba-e6' }, // ORL beats NYK
  { id: 'nba-r3-w', slug: 'nba-r3-w', league: 'NBA', round: 3, conference: 'West', team1Id: 'nba-w1', team2Id: 'nba-w6', team1Wins: 4, team2Wins: 1, winner: 'nba-w1' }, // OKC beats GSW
]
const NBA_R4_PENDING: Series[] = [
  { id: 'nba-r4', slug: 'nba-r4', league: 'NBA', round: 4, conference: undefined, team1Id: 'nba-e6', team2Id: 'nba-w1', team1Wins: 0, team2Wins: 0, winner: null },
]
const NHL_R3: Series[] = [
  { id: 'nhl-r3-e', slug: 'nhl-r3-e', league: 'NHL', round: 3, conference: 'East', team1Id: 'nhl-met1', team2Id: 'nhl-met3', team1Wins: 2, team2Wins: 4, winner: 'nhl-met3' }, // PHI beats CAR
  { id: 'nhl-r3-w', slug: 'nhl-r3-w', league: 'NHL', round: 3, conference: 'West', team1Id: 'nhl-cen1', team2Id: 'nhl-pac2', team1Wins: 4, team2Wins: 3, winner: 'nhl-cen1' }, // COL beats EDM
]
const NHL_R4_PENDING: Series[] = [
  { id: 'nhl-r4', slug: 'nhl-r4', league: 'NHL', round: 4, conference: undefined, team1Id: 'nhl-met3', team2Id: 'nhl-cen1', team1Wins: 0, team2Wins: 0, winner: null },
]

// ── Players ───────────────────────────────────────────────────────────────────

const PLAYERS: Player[] = [
  {
    // Chalk: top seeds first. BOS (e1) and DEN (w2) lost — hurts.
    // CAR + COL in NHL alive. Needs OKC + CAR to win everything.
    id: 'alex', name: 'Alex',
    rankings: {
      nba: ['nba-e1','nba-w1','nba-e2','nba-w2','nba-e3','nba-w3','nba-e4','nba-w4','nba-e5','nba-w5','nba-e6','nba-w6','nba-e7','nba-w7','nba-e8','nba-w8'],
      nhl: ['nhl-met1','nhl-cen1','nhl-pac1','nhl-atl1','nhl-met2','nhl-atl2','nhl-cen2','nhl-cen3','nhl-pac2','nhl-atl3','nhl-met3','nhl-ewc1','nhl-wwc1','nhl-ewc2','nhl-pac3','nhl-wwc2'],
    },
  },
  {
    // Upset hunter: GSW #1 NBA, ORL #2, OKC #3. PHI #1 NHL, EDM #2.
    // GSW and ORL alive in CF — best path. Needs GSW + PHI combo.
    id: 'jordan', name: 'Jordan',
    rankings: {
      nba: ['nba-w6','nba-e6','nba-w1','nba-e2','nba-e8','nba-w4','nba-e4','nba-w2','nba-e7','nba-w7','nba-e5','nba-w5','nba-e3','nba-w3','nba-e1','nba-w8'],
      nhl: ['nhl-met3','nhl-pac2','nhl-met1','nhl-wwc1','nhl-atl2','nhl-cen1','nhl-cen2','nhl-atl1','nhl-ewc1','nhl-pac1','nhl-met2','nhl-ewc2','nhl-atl3','nhl-cen3','nhl-pac3','nhl-wwc2'],
    },
  },
  {
    // OKC #1 NBA, NYK #2. CAR #1 NHL, COL #2, EDM #3.
    // Needs OKC + COL or OKC + EDM to clinch.
    id: 'sam', name: 'Sam',
    rankings: {
      nba: ['nba-w1','nba-e2','nba-w2','nba-e6','nba-e4','nba-w6','nba-e1','nba-w4','nba-e3','nba-w3','nba-e5','nba-w5','nba-e8','nba-e7','nba-w7','nba-w8'],
      nhl: ['nhl-met1','nhl-cen1','nhl-pac2','nhl-atl2','nhl-cen2','nhl-atl1','nhl-pac1','nhl-met2','nhl-met3','nhl-wwc1','nhl-ewc1','nhl-cen3','nhl-ewc2','nhl-atl3','nhl-pac3','nhl-wwc2'],
    },
  },
  {
    // BOS fan (both leagues). NBA BOS lost R1, NHL BOS lost R1.
    // Trails badly. Only wins if NYK (NBA) + CAR (NHL) pull through.
    id: 'taylor', name: 'Taylor',
    rankings: {
      nba: ['nba-e1','nba-e2','nba-w1','nba-e6','nba-w6','nba-e4','nba-w2','nba-w4','nba-e5','nba-w5','nba-e3','nba-w3','nba-e7','nba-w7','nba-e8','nba-w8'],
      nhl: ['nhl-ewc1','nhl-met1','nhl-cen1','nhl-atl1','nhl-atl2','nhl-cen2','nhl-pac1','nhl-pac2','nhl-met2','nhl-wwc1','nhl-met3','nhl-ewc2','nhl-cen3','nhl-atl3','nhl-pac3','nhl-wwc2'],
    },
  },
  {
    // NYK #1 NBA, ORL #2, GSW #3 — spread across CF teams.
    // PHI #1 NHL, CAR #2, EDM #3. Multiple live paths.
    id: 'morgan', name: 'Morgan',
    rankings: {
      nba: ['nba-e2','nba-e6','nba-w6','nba-w1','nba-w4','nba-e4','nba-e8','nba-w2','nba-e3','nba-w3','nba-e5','nba-w5','nba-e1','nba-e7','nba-w7','nba-w8'],
      nhl: ['nhl-met3','nhl-met1','nhl-pac2','nhl-cen1','nhl-wwc1','nhl-atl2','nhl-cen2','nhl-atl1','nhl-pac1','nhl-met2','nhl-ewc1','nhl-cen3','nhl-ewc2','nhl-atl3','nhl-pac3','nhl-wwc2'],
    },
  },
  {
    // ORL #1 NBA, NYK #2, OKC #3. EDM #1 NHL, PHI #2, COL #3.
    // Heavily dependent on ORL winning — niche but realistic path.
    id: 'riley', name: 'Riley',
    rankings: {
      nba: ['nba-e6','nba-e2','nba-w1','nba-w6','nba-e4','nba-w4','nba-e8','nba-w2','nba-e3','nba-w3','nba-e5','nba-w5','nba-e1','nba-e7','nba-w7','nba-w8'],
      nhl: ['nhl-pac2','nhl-met3','nhl-cen1','nhl-met1','nhl-wwc1','nhl-atl2','nhl-cen2','nhl-atl1','nhl-pac1','nhl-met2','nhl-ewc1','nhl-ewc2','nhl-cen3','nhl-atl3','nhl-pac3','nhl-wwc2'],
    },
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SimPage() {
  // After R1: R2 matchups set but unplayed → shows win % (R1 done), no path yet
  const nbaSeries_R1 = [...NBA_R1, ...NBA_R2_PENDING, ...NBA_R3_EMPTY, ...NBA_R4_EMPTY]
  const nhlSeries_R1 = [...NHL_R1, ...NHL_R2_PENDING, ...NHL_R3_EMPTY, ...NHL_R4_EMPTY]
  const scoresAfterR1 = calculatePlayerScores(PLAYERS, nbaSeries_R1, nhlSeries_R1, ALL_TEAMS)

  // After R2: CF matchups set but unplayed → shows win % only
  const nbaSeries_R2 = [...NBA_R1, ...NBA_R2, ...NBA_R3_PENDING, ...NBA_R4_EMPTY]
  const nhlSeries_R2 = [...NHL_R1, ...NHL_R2, ...NHL_R3_PENDING, ...NHL_R4_EMPTY]
  const scoresAfterR2 = calculatePlayerScores(PLAYERS, nbaSeries_R2, nhlSeries_R2, ALL_TEAMS)

  // After R3: Finals teams set but unplayed → shows win % + path to victory
  const nbaSeries_R3 = [...NBA_R1, ...NBA_R2, ...NBA_R3, ...NBA_R4_PENDING]
  const nhlSeries_R3 = [...NHL_R1, ...NHL_R2, ...NHL_R3, ...NHL_R4_PENDING]
  const scoresAfterR3 = calculatePlayerScores(PLAYERS, nbaSeries_R3, nhlSeries_R3, ALL_TEAMS)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
      <div>
        <h1 className="text-3xl font-extrabold mb-2">Dev Simulation</h1>
        <p className="text-muted-foreground">Dummy data only — no database involved.</p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-2">After Round 1</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Upsets: CHI over BOS, ORL over CLE, GSW over MIN (NBA) · PHI over PIT, UTA over VGK (NHL).
          R2 matchups set. Shows win probability.
        </p>
        <Leaderboard scores={scoresAfterR1} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-2">After Round 2</h2>
        <p className="text-sm text-muted-foreground mb-6">
          More upsets: ORL over IND, GSW over DEN (NBA) · PHI over TBL (NHL).
          CF: NYK vs ORL, OKC vs GSW (NBA) · CAR vs PHI, COL vs EDM (NHL). Shows win probability.
        </p>
        <Leaderboard scores={scoresAfterR2} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-2">After Round 3</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Finals: ORL vs OKC (NBA) · PHI vs COL (NHL). Shows win probability + path to victory.
        </p>
        <Leaderboard scores={scoresAfterR3} />
      </section>
    </div>
  )
}
