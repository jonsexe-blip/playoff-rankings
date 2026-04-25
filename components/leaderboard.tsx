import { cn } from '@/lib/utils'
import { PathToVictory } from '@/components/path-to-victory'
import type { PlayerScore } from '@/lib/types'

interface LeaderboardProps {
  scores: PlayerScore[]
}

export function Leaderboard({ scores }: LeaderboardProps) {
  return (
    <div className="space-y-4">
      {scores.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No picks submitted yet — be the first!
        </p>
      ) : (
        scores.map((entry, index) => {
          const rank = scores.findIndex(s => s.total === entry.total) + 1
          const isFirst = rank === 1
          return (
          <div
            key={entry.player.id}
            className={cn(
              'flex items-center gap-6 p-6 lg:p-8 rounded-lg border transition-colors',
              isFirst
                ? 'bg-primary/10 border-primary'
                : 'bg-card border-border hover:border-muted-foreground/50'
            )}
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
                  NBA: <span className="text-foreground">{entry.nbaScore} pts</span>
                </span>
                <span className="text-sm font-medium text-muted-foreground">
                  NHL: <span className="text-foreground">{entry.nhlScore} pts</span>
                </span>
              </div>
              {entry.winProbability !== undefined && (
                <div className="mt-1">
                  <span className="text-xs text-muted-foreground">
                    Win probability:{' '}
                    <span className="text-primary font-semibold">
                      {(entry.winProbability * 100).toFixed(1)}%
                    </span>
                  </span>
                </div>
              )}
              {entry.winningPaths !== undefined && (
                <div className="mt-2">
                  <PathToVictory winningPaths={entry.winningPaths} />
                </div>
              )}
            </div>

            {/* Total Score */}
            <div className="flex-shrink-0 text-right">
              <div className="text-3xl lg:text-4xl font-extrabold text-foreground">
                {entry.total}
              </div>
              <div className="text-sm font-medium text-muted-foreground tracking-wide">
                Total Points
              </div>
            </div>
          </div>
        )})
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
