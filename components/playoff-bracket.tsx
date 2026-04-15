'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Trophy } from 'lucide-react'
import { TeamLogo } from '@/components/team-logo'
import { teamSeedLabel } from '@/lib/types'
import type { Series, Team } from '@/lib/types'

interface SeriesCardProps {
  series: Series
  teamsById: Map<string, Team>
}

function SeriesCard({ series, teamsById }: SeriesCardProps) {
  const team1 = teamsById.get(series.team1Id)
  const team2 = teamsById.get(series.team2Id)

  if (!team1 && !team2) return null

  const isComplete = series.winner !== null
  const team1Leading = series.team1Wins > series.team2Wins
  const team2Leading = series.team2Wins > series.team1Wins
  const isTied = series.team1Wins === series.team2Wins

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Team 1 */}
      <div className={cn(
        'flex items-center justify-between px-3 py-2.5 border-b border-border',
        series.winner === series.team1Id && 'bg-primary/10',
        team1Leading && !isComplete && 'bg-muted/50'
      )}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium w-10 shrink-0">{team1 ? teamSeedLabel(team1) : ''}</span>
          {team1 && (
            <TeamLogo slug={team1.slug} league={team1.league} abbreviation={team1.abbreviation} size={24} className={cn(series.winner === series.team2Id && 'opacity-30')} />
          )}
          <span className={cn(
            'text-sm font-bold tracking-tight',
            series.winner === series.team2Id && 'text-muted-foreground line-through'
          )}>
            {team1?.abbreviation || 'TBD'}
          </span>
        </div>
        <span className={cn(
          'text-lg font-bold tabular-nums ml-2',
          team1Leading && 'text-primary',
          series.winner === series.team2Id && 'text-muted-foreground'
        )}>
          {series.team1Wins}
        </span>
      </div>

      {/* Team 2 */}
      <div className={cn(
        'flex items-center justify-between px-3 py-2.5',
        series.winner === series.team2Id && 'bg-primary/10',
        team2Leading && !isComplete && 'bg-muted/50'
      )}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium w-10 shrink-0">{team2 ? teamSeedLabel(team2) : ''}</span>
          {team2 && (
            <TeamLogo slug={team2.slug} league={team2.league} abbreviation={team2.abbreviation} size={24} className={cn(series.winner === series.team1Id && 'opacity-30')} />
          )}
          <span className={cn(
            'text-sm font-bold tracking-tight',
            series.winner === series.team1Id && 'text-muted-foreground line-through'
          )}>
            {team2?.abbreviation || 'TBD'}
          </span>
        </div>
        <span className={cn(
          'text-lg font-bold tabular-nums ml-2',
          team2Leading && 'text-primary',
          series.winner === series.team1Id && 'text-muted-foreground'
        )}>
          {series.team2Wins}
        </span>
      </div>

      {/* Status */}
      <div className="px-3 py-1.5 bg-muted/30 text-center">
        {isComplete ? (
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            {teamsById.get(series.winner!)?.abbreviation} Wins
          </span>
        ) : isTied ? (
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Series Tied {series.team1Wins}-{series.team2Wins}
          </span>
        ) : (
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {team1Leading ? team1?.abbreviation : team2?.abbreviation} leads {Math.max(series.team1Wins, series.team2Wins)}-{Math.min(series.team1Wins, series.team2Wins)}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * NHL R1: re-orders so each 4-team bracket half is contiguous.
 * NBA R1: traditional bracket order — 1v8 top, 4v5 next, 3v6, 2v7 bottom.
 */
function orderBracketSeries(series: Series[]): Series[] {
  const isNBA = series[0]?.league === 'NBA'
  const order = isNBA ? ['1', '4', '3', '2'] : ['1', '3', '2', '4']
  return [...series].sort((a, b) => {
    const aPos = order.indexOf(a.slug.slice(-1))
    const bPos = order.indexOf(b.slug.slice(-1))
    return (aPos === -1 ? 99 : aPos) - (bPos === -1 ? 99 : bPos)
  })
}

function RoundColumn({
  series,
  roundName,
  teamsById,
  isR1 = false,
}: {
  series: Series[]
  roundName: string
  teamsById: Map<string, Team>
  isR1?: boolean
}) {
  const sorted = isR1 ? orderBracketSeries(series) : series
  const activeSeries = sorted.filter(s => s.team1Id || s.team2Id)

  return (
    <div className="flex flex-col">
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 text-center">
        {roundName}
      </h4>
      <div className="flex flex-col gap-3 justify-around flex-1">
        {activeSeries.length > 0 ? (
          activeSeries.map((s) => (
            <SeriesCard key={s.id} series={s} teamsById={teamsById} />
          ))
        ) : (
          <div className="flex items-center justify-center h-full min-h-[80px]">
            <div className="text-center text-muted-foreground text-xs border border-dashed border-border rounded-lg px-3 py-4 w-full">TBD</div>
          </div>
        )}
      </div>
    </div>
  )
}

function FinalsCard({
  series,
  teamsById,
  league,
}: {
  series: Series | undefined
  teamsById: Map<string, Team>
  league: 'NBA' | 'NHL'
}) {
  const winner = series?.winner ? teamsById.get(series.winner) : null

  return (
    <div className="flex flex-col items-center gap-3">
      <Trophy className={cn(
        'w-8 h-8',
        winner ? 'text-yellow-500' : 'text-muted-foreground/40'
      )} />
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">
        {league} Finals
      </span>
      {series && (series.team1Id || series.team2Id) ? (
        <div className="w-full">
          <SeriesCard series={series} teamsById={teamsById} />
        </div>
      ) : (
        <div className="text-center text-muted-foreground text-xs border border-dashed border-border rounded-lg px-3 py-4 w-full">
          TBD
        </div>
      )}
    </div>
  )
}

interface PlayoffBracketProps {
  nbaSeries: Series[]
  nhlSeries: Series[]
  teams: Team[]
}

type MobileConf = 'east' | 'finals' | 'west'

export function PlayoffBracket({ nbaSeries, nhlSeries, teams }: PlayoffBracketProps) {
  const [league, setLeague] = useState<'NBA' | 'NHL'>('NBA')
  const [mobileConf, setMobileConf] = useState<MobileConf>('east')

  const teamsById = new Map(teams.map(t => [t.slug, t]))
  const bracket = league === 'NBA' ? nbaSeries : nhlSeries

  const r = (round: number, conf?: 'East' | 'West') =>
    bracket.filter(s => s.round === round && s.conference === conf)

  const finals = bracket.find(s => s.round === 4)

  const leagueToggle = (
    <div className="flex gap-2">
      {(['NBA', 'NHL'] as const).map(l => (
        <button
          key={l}
          onClick={() => setLeague(l)}
          className={cn(
            'px-5 py-2 text-base font-bold tracking-tight rounded-lg transition-all',
            league === l
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      {leagueToggle}

      {/* ── MOBILE LAYOUT ── */}
      <div className="md:hidden space-y-4">
        {/* Conference tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {([
            { key: 'east', label: 'East' },
            { key: 'finals', label: 'Finals' },
            { key: 'west', label: 'West' },
          ] as { key: MobileConf; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setMobileConf(key)}
              className={cn(
                'flex-1 py-2 text-sm font-bold rounded-md transition-all',
                mobileConf === key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* East rounds stacked */}
        {mobileConf === 'east' && (
          <div className="space-y-6">
            <RoundColumn series={r(1, 'East')} roundName="First Round" teamsById={teamsById} isR1 />
            {r(2, 'East').some(s => s.team1Id || s.team2Id) && (
              <RoundColumn series={r(2, 'East')} roundName="Second Round" teamsById={teamsById} />
            )}
            {r(3, 'East').some(s => s.team1Id || s.team2Id) && (
              <RoundColumn series={r(3, 'East')} roundName="Conf. Finals" teamsById={teamsById} />
            )}
          </div>
        )}

        {/* Finals */}
        {mobileConf === 'finals' && (
          <div className="max-w-xs mx-auto">
            <FinalsCard series={finals} teamsById={teamsById} league={league} />
          </div>
        )}

        {/* West rounds stacked */}
        {mobileConf === 'west' && (
          <div className="space-y-6">
            <RoundColumn series={r(1, 'West')} roundName="First Round" teamsById={teamsById} isR1 />
            {r(2, 'West').some(s => s.team1Id || s.team2Id) && (
              <RoundColumn series={r(2, 'West')} roundName="Second Round" teamsById={teamsById} />
            )}
            {r(3, 'West').some(s => s.team1Id || s.team2Id) && (
              <RoundColumn series={r(3, 'West')} roundName="Conf. Finals" teamsById={teamsById} />
            )}
          </div>
        )}
      </div>

      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[820px] flex gap-4 items-start">

          {/* East — R1 → R2 → CF */}
          <div className="flex-1 space-y-3">
            <h3 className="text-base font-bold text-foreground">Eastern Conference</h3>
            <div className="grid grid-cols-3 gap-3">
              <RoundColumn series={r(1, 'East')} roundName="First Round" teamsById={teamsById} isR1 />
              <RoundColumn series={r(2, 'East')} roundName="Second Round" teamsById={teamsById} />
              <RoundColumn series={r(3, 'East')} roundName="Conf. Finals" teamsById={teamsById} />
            </div>
          </div>

          {/* Finals — center */}
          <div className="w-36 shrink-0 pt-8">
            <FinalsCard series={finals} teamsById={teamsById} league={league} />
          </div>

          {/* West — CF → R2 → R1 */}
          <div className="flex-1 space-y-3">
            <h3 className="text-base font-bold text-right text-foreground">Western Conference</h3>
            <div className="grid grid-cols-3 gap-3">
              <RoundColumn series={r(3, 'West')} roundName="Conf. Finals" teamsById={teamsById} />
              <RoundColumn series={r(2, 'West')} roundName="Second Round" teamsById={teamsById} />
              <RoundColumn series={r(1, 'West')} roundName="First Round" teamsById={teamsById} isR1 />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
