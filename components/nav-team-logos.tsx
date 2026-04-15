'use client'

import { TeamLogo } from '@/components/team-logo'
import type { Team } from '@/lib/types'

interface NavTeamLogosProps {
  nbaTeams: Team[]
  nhlTeams: Team[]
}

export function NavTeamLogos({ nbaTeams, nhlTeams }: NavTeamLogosProps) {
  if (nbaTeams.length === 0 && nhlTeams.length === 0) return null

  return (
    <div className="overflow-x-auto scrollbar-none pb-2">
      <div className="flex items-center gap-2 min-w-max">
        {nbaTeams.map(team => (
          <TeamLogo
            key={team.slug}
            slug={team.slug}
            league={team.league}
            abbreviation={team.abbreviation}
            size={28}
            className={team.eliminated ? 'opacity-30 grayscale' : undefined}
          />
        ))}
        {nbaTeams.length > 0 && nhlTeams.length > 0 && (
          <div className="w-px h-6 bg-border mx-1 shrink-0" />
        )}
        {nhlTeams.map(team => (
          <TeamLogo
            key={team.slug}
            slug={team.slug}
            league={team.league}
            abbreviation={team.abbreviation}
            size={28}
            className={team.eliminated ? 'opacity-30 grayscale' : undefined}
          />
        ))}
      </div>
    </div>
  )
}
