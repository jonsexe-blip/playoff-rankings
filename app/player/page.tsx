import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTeams, getMyRankings, getPlayoffSettings } from '@/lib/supabase/queries'
import { PlayerRankings } from '@/components/player-rankings'

export default async function PlayerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check the player has completed first-time setup
  const { data: player } = await supabase
    .from('players')
    .select('id, display_name')
    .eq('id', user.id)
    .single()

  if (!player) {
    redirect('/auth/setup')
  }

  const [nbaTeams, nhlTeams, nbaRanking, nhlRanking, settings] = await Promise.all([
    getTeams('NBA'),
    getTeams('NHL'),
    getMyRankings(user.id, 'NBA'),
    getMyRankings(user.id, 'NHL'),
    getPlayoffSettings(),
  ])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16 lg:py-20 px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-foreground">
            MY PICKS
          </h1>
          <p className="mt-4 text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Rank teams by how you think they&apos;ll finish in the playoffs.
            Your champion pick should be at the top.
          </p>
        </div>
      </section>

      {/* Rankings Editor */}
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <PlayerRankings
            nbaTeams={nbaTeams}
            nhlTeams={nhlTeams}
            initialNbaRanking={nbaRanking}
            initialNhlRanking={nhlRanking}
            nbaLocked={settings.nbaPicksLocked}
            nhlLocked={settings.nhlPicksLocked}
            teamsFinalized={settings.teamsFinalized}
          />
        </div>
      </section>
    </div>
  )
}
