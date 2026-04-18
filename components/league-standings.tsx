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
      <div className="flex items-center gap-2 mb-6">
        {(['nba', 'nhl'] as const).map(l => (
          <button
            key={l}
            onClick={() => setActiveLeague(l)}
            className={cn(
              'px-6 py-3 text-lg font-bold tracking-tight rounded-lg transition-all',
              activeLeague === l
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {playersWithPicks.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No picks submitted yet for this league.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {playersWithPicks.map(player => (
            <div key={player.id} className="bg-card border border-border rounded-lg overflow-hidden">
              {/* Card header */}
              <div className="px-4 py-3 border-b border-border">
                <h3 className="text-base font-bold text-foreground">{player.name}</h3>
              </div>

              {/* Ranked rows */}
              <div className="divide-y divide-border">
                {player.rankings[activeLeague].map((slug, i) => {
                  const rank = i + 1
                  const team = teamsById.get(slug)
                  return (
                    <div
                      key={slug}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2',
                        rank === 1 && 'bg-yellow-500/10',
                        rank > 1 && rank <= 4 && 'bg-primary/10',
                      )}
                    >
                      <span className={cn(
                        'text-sm font-bold tabular-nums w-5 shrink-0',
                        rank === 1 ? 'text-yellow-500' : rank <= 4 ? 'text-primary' : 'text-muted-foreground'
                      )}>
                        {rank}
                      </span>
                      {team ? (
                        <>
                          <TeamLogo slug={team.slug} league={team.league} abbreviation={team.abbreviation} size={20} />
                          <span className={cn(
                            'text-sm font-bold',
                            team.eliminated && 'line-through text-muted-foreground'
                          )}>
                            {team.abbreviation}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
