'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { TeamLogo } from '@/components/team-logo'
import type { Player, Team } from '@/lib/types'

interface LeagueStandingsProps {
  players: Player[]
  teams: Team[]
}

export function LeagueStandings({ players, teams }: LeagueStandingsProps) {
  const [activeLeague, setActiveLeague] = useState<'nba' | 'nhl'>('nba')

  const leagueTeams = teams.filter(t => t.league === (activeLeague === 'nba' ? 'NBA' : 'NHL'))
  const teamsById = new Map(leagueTeams.map(t => [t.slug, t]))

  const playersWithPicks = players.filter(p => p.rankings[activeLeague].length > 0)

  return (
    <div>
      {/* League Toggle */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => setActiveLeague('nba')}
          className={cn(
            'px-6 py-3 text-lg font-bold tracking-tight rounded-lg transition-all',
            activeLeague === 'nba'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          NBA
        </button>
        <button
          onClick={() => setActiveLeague('nhl')}
          className={cn(
            'px-6 py-3 text-lg font-bold tracking-tight rounded-lg transition-all',
            activeLeague === 'nhl'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          NHL
        </button>
      </div>

      {playersWithPicks.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No picks submitted yet for this league.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground tracking-tight">
                  Rank
                </th>
                {playersWithPicks.map((player) => (
                  <th
                    key={player.id}
                    className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground tracking-tight min-w-[140px]"
                  >
                    {player.name.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 16 }, (_, i) => i + 1).map((rank) => (
                <tr
                  key={rank}
                  className={cn(
                    'border-b border-border/50 transition-colors hover:bg-secondary/50',
                    rank <= 4 && 'bg-primary/5'
                  )}
                >
                  <td className="py-4 px-4">
                    <span className={cn(
                      'text-2xl font-extrabold',
                      rank === 1 ? 'text-accent' : rank <= 4 ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {rank}
                    </span>
                  </td>
                  {playersWithPicks.map((player) => {
                    const teamSlug = player.rankings[activeLeague][rank - 1]
                    const team = teamsById.get(teamSlug)
                    return (
                      <td key={player.id} className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {team && (
                            <TeamLogo slug={team.slug} league={team.league} abbreviation={team.abbreviation} size={20} />
                          )}
                          <span className="text-lg font-bold text-foreground">
                            {team?.abbreviation || '—'}
                          </span>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary/20 rounded" />
          <span className="text-muted-foreground">Top 4 picks (Conference Finals)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-accent font-bold">1</span>
          <span className="text-muted-foreground">Champion pick</span>
        </div>
      </div>
    </div>
  )
}
