'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { ChevronUp, ChevronDown, Lock } from 'lucide-react'
import { TeamLogo } from '@/components/team-logo'
import { teamSeedLabel } from '@/lib/types'
import { saveRankingsAction } from '@/app/actions'
import type { Team } from '@/lib/types'

interface PlayerRankingsProps {
  nbaTeams: Team[]
  nhlTeams: Team[]
  initialNbaRanking: string[]
  initialNhlRanking: string[]
  nbaLocked: boolean
  nhlLocked: boolean
  teamsFinalized: boolean
}

type League = 'nba' | 'nhl'

export function PlayerRankings({
  nbaTeams,
  nhlTeams,
  initialNbaRanking,
  initialNhlRanking,
  nbaLocked,
  nhlLocked,
  teamsFinalized,
}: PlayerRankingsProps) {
  const [activeLeague, setActiveLeague] = useState<League>('nba')
  const [rankings, setRankings] = useState<Record<League, string[]>>({
    nba: initialNbaRanking.length === 16
      ? initialNbaRanking
      : nbaTeams.map(t => t.slug),
    nhl: initialNhlRanking.length === 16
      ? initialNhlRanking
      : nhlTeams.map(t => t.slug),
  })
  const [savedState, setSavedState] = useState<Record<League, boolean>>({ nba: false, nhl: false })
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const teams = activeLeague === 'nba' ? nbaTeams : nhlTeams
  const teamsById = new Map(teams.map(t => [t.slug, t]))
  const isLocked = activeLeague === 'nba' ? nbaLocked : nhlLocked

  const moveTeam = (index: number, direction: 'up' | 'down') => {
    if (isLocked) return
    const current = [...rankings[activeLeague]]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= current.length) return
    ;[current[index], current[newIndex]] = [current[newIndex], current[index]]
    setRankings(prev => ({ ...prev, [activeLeague]: current }))
    setSavedState(prev => ({ ...prev, [activeLeague]: false }))
  }

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const leagueKey = activeLeague.toUpperCase() as 'NBA' | 'NHL'
      const result = await saveRankingsAction(leagueKey, rankings[activeLeague])
      if (result.success) {
        setSavedState(prev => ({ ...prev, [activeLeague]: true }))
      } else {
        setError(result.error ?? 'Failed to save')
      }
    })
  }

  if (!teamsFinalized) {
    return (
      <div className="text-center py-16 space-y-4">
        <Lock className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-2xl font-bold">Picks Opening Soon</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The playoff field is still being finalized. Check back once all teams are confirmed.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* League Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveLeague('nba')}
          className={cn(
            'px-6 py-3 text-lg font-bold tracking-tight rounded-lg transition-all',
            activeLeague === 'nba'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          NBA {nbaLocked && <Lock className="inline w-4 h-4 ml-1" />}
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
          NHL {nhlLocked && <Lock className="inline w-4 h-4 ml-1" />}
        </button>
      </div>

      {/* Locked Banner */}
      {isLocked && (
        <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border border-border">
          <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <p className="text-sm font-medium text-muted-foreground">
            {activeLeague.toUpperCase()} picks are locked — the playoffs have started.
          </p>
        </div>
      )}

      {/* Rankings List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ranking Cards */}
        <div className="space-y-2">
          {rankings[activeLeague].map((slug, index) => {
            const team = teamsById.get(slug)
            if (!team) return null

            return (
              <div
                key={slug}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border transition-all',
                  index === 0
                    ? 'bg-accent/10 border-accent'
                    : index < 4
                      ? 'bg-primary/5 border-primary/30'
                      : 'bg-card border-border'
                )}
              >
                {/* Rank Number */}
                <div className="w-12 flex-shrink-0">
                  <span className={cn(
                    'text-2xl font-extrabold',
                    index === 0 ? 'text-accent' : index < 4 ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {index + 1}
                  </span>
                </div>

                {/* Team Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-12">{teamSeedLabel(team)}</span>
                    <TeamLogo slug={team.slug} league={team.league} abbreviation={team.abbreviation} size={28} />
                    <span className="text-lg font-bold text-foreground">{team.abbreviation}</span>
                    <span className="text-muted-foreground truncate">{team.name}</span>
                  </div>
                </div>

                {/* Move Buttons */}
                {!isLocked && (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveTeam(index, 'up')}
                      disabled={index === 0}
                      className={cn(
                        'p-1 rounded transition-colors',
                        index === 0
                          ? 'text-muted-foreground/30 cursor-not-allowed'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      )}
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => moveTeam(index, 'down')}
                      disabled={index === rankings[activeLeague].length - 1}
                      className={cn(
                        'p-1 rounded transition-colors',
                        index === rankings[activeLeague].length - 1
                          ? 'text-muted-foreground/30 cursor-not-allowed'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      )}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Scoring Reference + Save */}
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="p-6 bg-muted rounded-lg">
            <h3 className="text-xl font-bold text-foreground mb-6">How Scoring Works</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-background rounded-lg border border-accent/30">
                <span className="text-2xl font-extrabold text-accent">1</span>
                <div>
                  <p className="font-bold text-foreground">Champion Pick</p>
                  <p className="text-sm text-muted-foreground">Up to 16 pts (sliding scale by rank)</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-background rounded-lg border border-primary/30">
                <span className="text-2xl font-extrabold text-primary">2</span>
                <div>
                  <p className="font-bold text-foreground">Finalist Pick</p>
                  <p className="text-sm text-muted-foreground">Up to 8 pts (sliding scale by rank)</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-background rounded-lg border border-border">
                <span className="text-2xl font-extrabold text-muted-foreground">3–4</span>
                <div>
                  <p className="font-bold text-foreground">Conference Finals</p>
                  <p className="text-sm text-muted-foreground">4 pts each if your top 4 make it</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-background rounded-lg border border-border">
                <span className="text-2xl font-extrabold text-muted-foreground">5–8</span>
                <div>
                  <p className="font-bold text-foreground">Second Round</p>
                  <p className="text-sm text-muted-foreground">2 pts each if your top 8 advance</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground pt-1">
                + Upset multiplier: lower seeds earn bonus points when they advance (up to 2× for an 8-seed in NBA, 1.5× for a wild card in NHL).
              </p>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">{error}</p>
          )}

          {savedState[activeLeague] && !isLocked && (
            <p className="text-sm text-primary font-medium text-center">
              {activeLeague.toUpperCase()} picks saved!
            </p>
          )}

          {!isLocked && (
            <button
              onClick={handleSave}
              disabled={isPending}
              className="w-full py-4 bg-primary text-primary-foreground font-bold text-lg rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving...' : `Save ${activeLeague.toUpperCase()} Rankings`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
