import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NavLinks } from '@/components/nav-links'
import { AuthButton } from '@/components/auth-button'
import { NavTeamLogos } from '@/components/nav-team-logos'
import type { Team } from '@/lib/types'

function rowToTeam(row: Record<string, unknown>): Team {
  return {
    id: row.slug as string,
    slug: row.slug as string,
    name: row.name as string,
    abbreviation: row.abbreviation as string,
    league: row.league as 'NBA' | 'NHL',
    conference: row.conference as 'East' | 'West',
    seed: row.seed as number,
    division: (row.division as Team['division']) ?? null,
    points: (row.points as number) ?? null,
    eliminated: row.eliminated as boolean,
    roundEliminated: row.round_eliminated as number | null,
  }
}

export async function Navigation() {
  const supabase = await createClient()

  const [{ data: { user } }, { data: teamsData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('teams').select('*').order('league').order('conference').order('seed'),
  ])

  let isAdmin = false
  let displayName: string | null = null

  if (user) {
    const { data: player } = await supabase
      .from('players')
      .select('display_name, is_admin')
      .eq('id', user.id)
      .single()

    isAdmin = player?.is_admin ?? false
    displayName = player?.display_name ?? null
  }

  const teams: Team[] = (teamsData ?? []).map(rowToTeam)
  const nbaTeams = teams.filter(t => t.league === 'NBA')
  const nhlTeams = teams.filter(t => t.league === 'NHL')

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 lg:px-8">

        {/* Top row: title + nav links */}
        <div className="relative flex items-center justify-between h-12">
          <Link href="/" className="text-lg lg:text-2xl font-black tracking-tight text-foreground shrink-0">
            Playoff Predictor
          </Link>
          <div className="flex items-center gap-2 lg:gap-8">
            <NavLinks isAdmin={isAdmin} isLoggedIn={!!user} />
            <AuthButton user={user ? { displayName } : null} />
          </div>
        </div>

        {/* Bottom row: team logos — horizontally scrollable on mobile */}
        <NavTeamLogos nbaTeams={nbaTeams} nhlTeams={nhlTeams} />

      </nav>
    </header>
  )
}
