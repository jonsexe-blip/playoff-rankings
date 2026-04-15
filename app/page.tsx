import { Suspense } from 'react'
import { Leaderboard } from '@/components/leaderboard'
import { LeagueStandings } from '@/components/league-standings'
import { PlayoffBracket } from '@/components/playoff-bracket'
import { getAllTeams, getSeries, getPlayersWithRankings } from '@/lib/supabase/queries'
import { calculatePlayerScores } from '@/lib/scoring'

export const revalidate = 60 // ISR: revalidate every 60 seconds

async function HomeContent() {
  const [teams, nbaSeries, nhlSeries, players] = await Promise.all([
    getAllTeams(),
    getSeries('NBA'),
    getSeries('NHL'),
    getPlayersWithRankings(),
  ])

  const scores = calculatePlayerScores(players, nbaSeries, nhlSeries)

  return (
    <>
      <section className="py-8 lg:py-12 px-4 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-6 lg:mb-10">
            Playoff Brackets
          </h2>
          <PlayoffBracket nbaSeries={nbaSeries} nhlSeries={nhlSeries} teams={teams} />
        </div>
      </section>

      <section className="py-8 lg:py-12 px-4 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-6 lg:mb-10">
            Leaderboard
          </h2>
          <Leaderboard scores={scores} />
        </div>
      </section>

      <section className="py-8 lg:py-12 px-4 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl lg:text-4xl font-extrabold tracking-tight text-foreground mb-6 lg:mb-10">
            Player Picks
          </h2>
          <LeagueStandings players={players} teams={teams} />
        </div>
      </section>
    </>
  )
}

function LoadingSkeleton() {
  return (
    <div className="py-12 px-6 lg:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="py-6 lg:py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground text-balance">
            2026 Playoff
            <br />
            <span className="text-primary">Predictor</span>
          </h1>
          <p className="mt-6 text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
            Compete against friends to predict the NBA and NHL playoff champions.
            Earn points for correct picks at each round.
          </p>
        </div>
      </section>

      <Suspense fallback={<LoadingSkeleton />}>
        <HomeContent />
      </Suspense>
    </div>
  )
}
