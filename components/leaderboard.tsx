'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { PlayerScore } from '@/lib/types'

interface LeaderboardProps {
  scores: PlayerScore[]
}

function fmt(n: number): string {
  return parseFloat(n.toFixed(2)).toString()
}

export function Leaderboard({ scores }: LeaderboardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {scores.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No picks submitted yet — be the first!
        </p>
      ) : (
        scores.map((entry) => {
          const rank = scores.findIndex(s => fmt(s.total) === fmt(entry.total)) + 1
          const isFirst = rank === 1
          const isExpanded = expandedId === entry.player.id
          const hasBreakdown = entry.nbaBreakdown.length > 0 || entry.nhlBreakdown.length > 0

          return (
            <div
              key={entry.player.id}
              className={cn(
                'rounded-lg border transition-colors',
                isFirst
                  ? 'bg-primary/10 border-primary'
                  : 'bg-card border-border hover:border-muted-foreground/50'
              )}
            >
              {/* Main row */}
              <div
                className={cn(
                  'flex items-center gap-6 p-6 lg:p-8',
                  hasBreakdown && 'cursor-pointer select-none'
                )}
                onClick={() => hasBreakdown && setExpandedId(isExpanded ? null : entry.player.id)}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-16 lg:w-20 flex flex-col items-center">
                  {rank <= 3 && (
                    <span className="text-2xl leading-none mb-0.5">
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                    </span>
                  )}
                  <span className={cn(
                    'text-4xl lg:text-5xl font-extrabold',
                    isFirst ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {rank}
                  </span>
                </div>

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl lg:text-2xl font-bold text-foreground truncate">
                    {entry.player.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      NBA: <span className="text-foreground">{fmt(entry.nbaScore)} pts</span>
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      NHL: <span className="text-foreground">{fmt(entry.nhlScore)} pts</span>
                    </span>
                  </div>
                </div>

                {/* Total Score */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-3xl lg:text-4xl font-extrabold text-foreground">
                    {fmt(entry.total)}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground tracking-wide">
                    Total Points
                  </div>
                </div>

                {/* Chevron */}
                {hasBreakdown && (
                  <div className="flex-shrink-0 text-muted-foreground">
                    <svg
                      className={cn('w-5 h-5 transition-transform duration-200', isExpanded && 'rotate-180')}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Breakdown */}
              {isExpanded && (
                <div className={cn(
                  'px-6 pb-6 lg:px-8 lg:pb-8 border-t',
                  isFirst ? 'border-primary/30' : 'border-border'
                )}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                    {entry.nbaBreakdown.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          NBA · {fmt(entry.nbaScore)} pts
                        </h4>
                        <div className="space-y-2">
                          {entry.nbaBreakdown.map((pick, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-bold text-foreground w-9 shrink-0">{pick.teamName}</span>
                                <span className="text-muted-foreground text-xs shrink-0">#{pick.rank}</span>
                                <div className="min-w-0">
                                  <span className="text-muted-foreground">{pick.roundLabel}</span>
                                  <span className="text-muted-foreground/50 text-xs ml-1.5">
                                    {pick.base} × {16 - pick.rank} × {fmt(pick.multiplier)}
                                  </span>
                                </div>
                              </div>
                              <span className="font-medium text-foreground ml-3 shrink-0">+{fmt(pick.points)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.nhlBreakdown.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          NHL · {fmt(entry.nhlScore)} pts
                        </h4>
                        <div className="space-y-2">
                          {entry.nhlBreakdown.map((pick, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-bold text-foreground w-9 shrink-0">{pick.teamName}</span>
                                <span className="text-muted-foreground text-xs shrink-0">#{pick.rank}</span>
                                <div className="min-w-0">
                                  <span className="text-muted-foreground">{pick.roundLabel}</span>
                                  <span className="text-muted-foreground/50 text-xs ml-1.5">
                                    {pick.base} × {16 - pick.rank} × {fmt(pick.multiplier)}
                                  </span>
                                </div>
                              </div>
                              <span className="font-medium text-foreground ml-3 shrink-0">+{fmt(pick.points)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}

      {/* Scoring Info */}
      <div className="mt-8 p-6 bg-muted rounded-lg space-y-4">
        <h4 className="text-lg font-bold text-foreground">Scoring System</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Second Round</span>
            <p className="text-foreground font-bold text-lg">2 × (16 − rank)</p>
          </div>
          <div>
            <span className="text-muted-foreground">Conf. Finals</span>
            <p className="text-foreground font-bold text-lg">4 × (16 − rank)</p>
          </div>
          <div>
            <span className="text-muted-foreground">Finals</span>
            <p className="text-foreground font-bold text-lg">8 × (16 − rank)</p>
          </div>
          <div>
            <span className="text-muted-foreground">Champion</span>
            <p className="text-foreground font-bold text-lg">16 × (16 − rank)</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Points are cumulative — teams earn at each round they advance through. All points × upset multiplier (up to 2× for an 8-seed in NBA, 1.5× for a wild card in NHL).
        </p>
      </div>
    </div>
  )
}
