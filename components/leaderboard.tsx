import { cn } from '@/lib/utils'
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
        scores.map((entry, index) => (
          <div
            key={entry.player.id}
            className={cn(
              'flex items-center gap-6 p-6 lg:p-8 rounded-lg border transition-colors',
              index === 0
                ? 'bg-primary/10 border-primary'
                : 'bg-card border-border hover:border-muted-foreground/50'
            )}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-16 lg:w-20">
              <span className={cn(
                'text-4xl lg:text-5xl font-extrabold',
                index === 0 ? 'text-primary' : 'text-muted-foreground'
              )}>
                {index + 1}
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
        ))
      )}

      {/* Scoring Info */}
      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h4 className="text-lg font-bold text-foreground mb-4">Scoring System</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Champion Pick</span>
            <p className="text-foreground font-bold text-lg">Up to 16 pts</p>
          </div>
          <div>
            <span className="text-muted-foreground">Finalist Pick</span>
            <p className="text-foreground font-bold text-lg">Up to 8 pts</p>
          </div>
          <div>
            <span className="text-muted-foreground">Conf. Finals</span>
            <p className="text-foreground font-bold text-lg">4 pts each</p>
          </div>
          <div>
            <span className="text-muted-foreground">Second Round</span>
            <p className="text-foreground font-bold text-lg">2 pts each</p>
          </div>
        </div>
      </div>
    </div>
  )
}
