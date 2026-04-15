'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Plus, Trophy, Settings, Users, X, Lock, Unlock } from 'lucide-react'
import {
  updateSeriesAction,
  upsertTeamAction,
  deleteTeamAction,
  updatePlayoffSettingsAction,
  autoAssignNHLSeriesAction,
} from '@/app/actions'
import type { Team, Series, PlayoffSettings, NHLDivision } from '@/lib/types'

type League = 'nba' | 'nhl'
type Tab = 'teams' | 'results' | 'settings'

interface AdminPanelProps {
  teams: Team[]
  nbaSeries: Series[]
  nhlSeries: Series[]
  settings: PlayoffSettings
}

const EMPTY_TEAM_FORM = {
  slug: '',
  name: '',
  abbreviation: '',
  seed: 1,
  conference: 'East' as 'East' | 'West',
  division: null as NHLDivision | null,
  points: '' as string,
  eliminated: false,
  roundEliminated: null as number | null,
}

export function AdminPanel({ teams, nbaSeries, nhlSeries, settings }: AdminPanelProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<Tab>('teams')
  const [activeLeague, setActiveLeague] = useState<League>('nba')
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [teamForm, setTeamForm] = useState(EMPTY_TEAM_FORM)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  const leagueTeams = teams.filter(t => t.league === (activeLeague === 'nba' ? 'NBA' : 'NHL'))
  const series = activeLeague === 'nba' ? nbaSeries : nhlSeries
  const teamsById = new Map(teams.map(t => [t.slug, t]))

  function showStatus(msg: string) {
    setStatusMsg(msg)
    setTimeout(() => setStatusMsg(null), 3000)
  }

  function openAddTeam() {
    setEditingTeam(null)
    setTeamForm({ ...EMPTY_TEAM_FORM, seed: leagueTeams.length + 1 })
    setShowTeamModal(true)
  }

  function openEditTeam(team: Team) {
    setEditingTeam(team)
    setTeamForm({
      slug: team.slug,
      name: team.name,
      abbreviation: team.abbreviation,
      seed: team.seed,
      conference: team.conference,
      division: team.division ?? null,
      points: team.points != null ? String(team.points) : '',
      eliminated: team.eliminated,
      roundEliminated: team.roundEliminated,
    })
    setShowTeamModal(true)
  }

  function handleSaveTeam() {
    if (!teamForm.name || !teamForm.abbreviation) return
    if (activeLeague === 'nhl' && !teamForm.slug) return

    // NBA slugs are always derived from conference + seed (nba-e3, nba-w7, etc.)
    const targetSlug = activeLeague === 'nba'
      ? `nba-${teamForm.conference[0].toLowerCase()}${teamForm.seed}`
      : teamForm.slug

    startTransition(async () => {
      const result = await upsertTeamAction({
        slug: targetSlug,
        oldSlug: activeLeague === 'nba' && editingTeam ? editingTeam.slug : undefined,
        name: teamForm.name,
        abbreviation: teamForm.abbreviation.toUpperCase(),
        league: activeLeague.toUpperCase() as 'NBA' | 'NHL',
        conference: teamForm.conference,
        seed: teamForm.seed,
        division: activeLeague === 'nhl' ? teamForm.division : null,
        points: teamForm.points !== '' ? parseInt(teamForm.points) : null,
        eliminated: teamForm.eliminated,
        roundEliminated: teamForm.roundEliminated,
      })
      if (result.success) {
        setShowTeamModal(false)
        router.refresh()
        showStatus(`Team ${teamForm.abbreviation} saved.`)
      } else {
        showStatus(`Error: ${result.error}`)
      }
    })
  }

  function handleDeleteTeam(slug: string) {
    if (!confirm('Delete this team? This will also remove their series.')) return
    startTransition(async () => {
      const result = await deleteTeamAction(slug)
      if (result.success) {
        router.refresh()
        showStatus('Team deleted.')
      } else {
        showStatus(`Error: ${result.error}`)
      }
    })
  }

  function handleToggleEliminated(team: Team) {
    startTransition(async () => {
      const result = await upsertTeamAction({
        slug: team.slug,
        name: team.name,
        abbreviation: team.abbreviation,
        league: team.league,
        conference: team.conference,
        seed: team.seed,
        division: team.division ?? null,
        points: team.points,
        eliminated: !team.eliminated,
        roundEliminated: team.eliminated ? null : team.roundEliminated,
      })
      if (result.success) router.refresh()
      else showStatus(`Error: ${result.error}`)
    })
  }

  function handleAutoAssignNHL() {
    startTransition(async () => {
      const result = await autoAssignNHLSeriesAction()
      if (result.success) {
        router.refresh()
        showStatus('NHL Round 1 matchups auto-assigned based on points.')
      } else {
        showStatus(`Error: ${result.error}`)
      }
    })
  }

  function handleUpdateSeries(
    s: Series,
    team1Wins: number,
    team2Wins: number,
    winnerSlug: string | null,
    team1Slug?: string | null,
    team2Slug?: string | null
  ) {
    startTransition(async () => {
      const result = await updateSeriesAction(s.slug, team1Wins, team2Wins, winnerSlug, team1Slug, team2Slug)
      if (result.success) router.refresh()
      else showStatus(`Error: ${result.error}`)
    })
  }

  function handleToggleLock(league: 'nba' | 'nhl') {
    const current = league === 'nba' ? settings.nbaPicksLocked : settings.nhlPicksLocked
    startTransition(async () => {
      const result = await updatePlayoffSettingsAction(
        league === 'nba' ? { nbaPicksLocked: !current } : { nhlPicksLocked: !current }
      )
      if (result.success) {
        router.refresh()
        showStatus(`${league.toUpperCase()} picks ${current ? 'unlocked' : 'locked'}.`)
      } else {
        showStatus(`Error: ${result.error}`)
      }
    })
  }

  function handleToggleTeamsFinalized() {
    startTransition(async () => {
      const result = await updatePlayoffSettingsAction({ teamsFinalized: !settings.teamsFinalized })
      if (result.success) {
        router.refresh()
        showStatus(settings.teamsFinalized ? 'Teams un-finalized.' : 'Teams finalized — picks are open!')
      } else {
        showStatus(`Error: ${result.error}`)
      }
    })
  }

  const roundName = (r: number) => ['', 'First Round', 'Second Round', 'Conf. Finals', 'Finals'][r]

  return (
    <div className="space-y-8">
      {/* Status message */}
      {statusMsg && (
        <div className="fixed bottom-6 right-6 bg-foreground text-background px-6 py-3 rounded-lg font-medium shadow-lg z-50">
          {statusMsg}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-4 border-b border-border pb-4">
        {(['teams', 'results', 'settings'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-lg font-bold transition-colors',
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab === 'teams' && <Users className="w-5 h-5" />}
            {tab === 'results' && <Trophy className="w-5 h-5" />}
            {tab === 'settings' && <Settings className="w-5 h-5" />}
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* League Toggle (for teams + results tabs) */}
      {activeTab !== 'settings' && (
        <div className="flex items-center gap-4">
          {(['nba', 'nhl'] as League[]).map(l => (
            <button
              key={l}
              onClick={() => setActiveLeague(l)}
              className={cn(
                'px-6 py-3 text-lg font-bold tracking-wide rounded-lg transition-colors',
                activeLeague === l
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* ── TEAMS TAB ── */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <button
            onClick={openAddTeam}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-5 h-5" />
            ADD TEAM
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leagueTeams.map((team) => (
              <div
                key={team.slug}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg border transition-colors',
                  team.eliminated
                    ? 'bg-destructive/10 border-destructive/30 opacity-60'
                    : 'bg-card border-border'
                )}
              >
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-black text-foreground">{team.seed}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">{team.abbreviation}</span>
                    <span className="text-muted-foreground truncate">{team.name}</span>
                    {team.points != null && (
                      <span className="text-xs text-muted-foreground shrink-0">{team.points} pts</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{team.conference}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => openEditTeam(team)}
                    className="px-3 py-1 text-sm font-bold rounded bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                  >
                    EDIT
                  </button>
                  <button
                    onClick={() => handleToggleEliminated(team)}
                    disabled={isPending}
                    className={cn(
                      'px-3 py-1 text-sm font-bold rounded transition-colors',
                      team.eliminated
                        ? 'bg-destructive/20 text-destructive hover:bg-destructive/30'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    {team.eliminated ? 'ELIM' : 'ACTIVE'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RESULTS TAB ── */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Update each series as it concludes. Scoring updates automatically.
            </p>
            {activeLeague === 'nhl' && (
              <button
                onClick={handleAutoAssignNHL}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground text-sm font-bold rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
              >
                Auto-assign R1 by Points
              </button>
            )}
          </div>

          {[1, 2, 3, 4].map(round => {
            const roundSeries = series.filter(s => s.round === round)
            if (roundSeries.length === 0) return null
            return (
              <div key={round} className="space-y-3">
                <h3 className="text-lg font-bold text-foreground">{roundName(round)}</h3>
                {roundSeries.map(s => {
                  const t1 = teamsById.get(s.team1Id)
                  const t2 = teamsById.get(s.team2Id)
                  return (
                    <SeriesEditor
                      key={s.slug}
                      series={s}
                      team1={t1 ?? null}
                      team2={t2 ?? null}
                      leagueTeams={leagueTeams}
                      onUpdate={(t1w, t2w, winner, t1s, t2s) => handleUpdateSeries(s, t1w, t2w, winner, t1s, t2s)}
                      isPending={isPending}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-lg">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Team Availability</h3>
            <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
              <div>
                <p className="font-bold text-foreground">Teams Finalized</p>
                <p className="text-sm text-muted-foreground">
                  {settings.teamsFinalized
                    ? 'Picks are open to players'
                    : 'Players see a "coming soon" message'}
                </p>
              </div>
              <button
                onClick={handleToggleTeamsFinalized}
                disabled={isPending}
                className={cn(
                  'px-4 py-2 font-bold rounded-lg transition-colors',
                  settings.teamsFinalized
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                )}
              >
                {settings.teamsFinalized ? 'OPEN' : 'CLOSED'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Picks Lock</h3>
            {(['nba', 'nhl'] as League[]).map(l => {
              const locked = l === 'nba' ? settings.nbaPicksLocked : settings.nhlPicksLocked
              return (
                <div key={l} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                  <div>
                    <p className="font-bold text-foreground">{l.toUpperCase()} Picks</p>
                    <p className="text-sm text-muted-foreground">
                      {locked ? 'Locked — playoffs started' : 'Open — players can edit'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleLock(l)}
                    disabled={isPending}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 font-bold rounded-lg transition-colors',
                      locked
                        ? 'bg-destructive/20 text-destructive hover:bg-destructive/30'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    {locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    {locked ? 'LOCKED' : 'UNLOCKED'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TEAM MODAL ── */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">
                {editingTeam ? 'EDIT TEAM' : 'ADD TEAM'}
              </h3>
              <button onClick={() => setShowTeamModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {activeLeague === 'nhl' && (
                <div>
                  <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">Slug (unique ID)</label>
                  <input
                    type="text"
                    value={teamForm.slug}
                    onChange={e => setTeamForm({ ...teamForm, slug: e.target.value.toLowerCase().replace(/\s/g, '-') })}
                    placeholder="e.g. nhl-atl1"
                    disabled={!!editingTeam}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">Team Name</label>
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={e => setTeamForm({ ...teamForm, name: e.target.value })}
                  placeholder="e.g. Boston Celtics"
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">Abbreviation (3 chars)</label>
                <input
                  type="text"
                  value={teamForm.abbreviation}
                  onChange={e => setTeamForm({ ...teamForm, abbreviation: e.target.value.slice(0, 3).toUpperCase() })}
                  placeholder="BOS"
                  maxLength={3}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">
                    {activeLeague === 'nhl' && teamForm.division !== 'WC' ? 'Division Rank (1–3)' : activeLeague === 'nhl' ? 'WC Seed (1–2)' : 'Seed (1–8)'}
                  </label>
                  <input
                    type="number"
                    value={teamForm.seed}
                    onChange={e => setTeamForm({ ...teamForm, seed: Math.max(1, Math.min(activeLeague === 'nhl' ? (teamForm.division === 'WC' ? 2 : 3) : 8, parseInt(e.target.value) || 1)) })}
                    min={1} max={activeLeague === 'nhl' ? (teamForm.division === 'WC' ? 2 : 3) : 8}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">Conference</label>
                  <select
                    value={teamForm.conference}
                    onChange={e => setTeamForm({ ...teamForm, conference: e.target.value as 'East' | 'West' })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="East">East</option>
                    <option value="West">West</option>
                  </select>
                </div>
              </div>
              {activeLeague === 'nhl' && (
                <div>
                  <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">Current Points</label>
                  <input
                    type="number"
                    value={teamForm.points}
                    onChange={e => setTeamForm({ ...teamForm, points: e.target.value })}
                    placeholder="e.g. 108"
                    min={0}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}
              {activeLeague === 'nhl' && (
                <div>
                  <label className="block text-sm font-bold text-muted-foreground uppercase tracking-wide mb-2">Division</label>
                  <select
                    value={teamForm.division ?? ''}
                    onChange={e => setTeamForm({ ...teamForm, division: (e.target.value || null) as NHLDivision | null })}
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">— Select —</option>
                    {teamForm.conference === 'East'
                      ? <><option value="Atlantic">Atlantic</option><option value="Metropolitan">Metropolitan</option></>
                      : <><option value="Central">Central</option><option value="Pacific">Pacific</option></>
                    }
                    <option value="WC">Wild Card</option>
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveTeam}
                  disabled={isPending || !teamForm.name || !teamForm.abbreviation || (activeLeague === 'nhl' && !teamForm.slug)}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'SAVE'}
                </button>
                {editingTeam && (
                  <button
                    onClick={() => handleDeleteTeam(editingTeam.slug)}
                    disabled={isPending}
                    className="px-4 py-3 bg-destructive/20 text-destructive font-bold rounded-lg hover:bg-destructive/30 transition-colors disabled:opacity-50"
                  >
                    DELETE
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Series Editor Sub-component ───────────────────────────────────────────────

interface SeriesEditorProps {
  series: Series
  team1: Team | null
  team2: Team | null
  leagueTeams: Team[]
  onUpdate: (team1Wins: number, team2Wins: number, winner: string | null, team1Slug?: string | null, team2Slug?: string | null) => void
  isPending: boolean
}

function SeriesEditor({ series, team1, team2, leagueTeams, onUpdate, isPending }: SeriesEditorProps) {
  const [t1w, setT1w] = useState(series.team1Wins)
  const [t2w, setT2w] = useState(series.team2Wins)
  const [winner, setWinner] = useState(series.winner ?? '')
  const [t1Slug, setT1Slug] = useState(series.team1Id)
  const [t2Slug, setT2Slug] = useState(series.team2Id)

  const isDirty =
    t1w !== series.team1Wins ||
    t2w !== series.team2Wins ||
    winner !== (series.winner ?? '') ||
    t1Slug !== series.team1Id ||
    t2Slug !== series.team2Id

  function handleSave() {
    const newT1Slug = t1Slug !== series.team1Id ? t1Slug || null : undefined
    const newT2Slug = t2Slug !== series.team2Id ? t2Slug || null : undefined
    onUpdate(t1w, t2w, winner || null, newT1Slug, newT2Slug)
  }

  const needsTeams = !series.team1Id && !series.team2Id

  return (
    <div className="p-4 bg-card border border-border rounded-lg space-y-3">
      <p className="text-xs text-muted-foreground font-mono">{series.slug} · {series.conference ?? 'Finals'}</p>

      {/* Team selectors for later-round series that need teams populated */}
      {(needsTeams || !team1 || !team2) && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Team 1</label>
            <select
              value={t1Slug}
              onChange={e => setT1Slug(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none"
            >
              <option value="">— TBD —</option>
              {leagueTeams.map(t => (
                <option key={t.slug} value={t.slug}>{t.abbreviation} {t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Team 2</label>
            <select
              value={t2Slug}
              onChange={e => setT2Slug(e.target.value)}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground focus:outline-none"
            >
              <option value="">— TBD —</option>
              {leagueTeams.map(t => (
                <option key={t.slug} value={t.slug}>{t.abbreviation} {t.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Win counts + winner */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground w-10">{(team1?.abbreviation ?? t1Slug) || 'T1'}</span>
          <input
            type="number" min={0} max={4} value={t1w}
            onChange={e => setT1w(Math.max(0, Math.min(4, parseInt(e.target.value) || 0)))}
            className="w-16 px-2 py-1 bg-input border border-border rounded text-center text-foreground"
          />
        </div>
        <span className="text-muted-foreground font-bold">–</span>
        <div className="flex items-center gap-2">
          <input
            type="number" min={0} max={4} value={t2w}
            onChange={e => setT2w(Math.max(0, Math.min(4, parseInt(e.target.value) || 0)))}
            className="w-16 px-2 py-1 bg-input border border-border rounded text-center text-foreground"
          />
          <span className="text-sm font-bold text-foreground w-10">{(team2?.abbreviation ?? t2Slug) || 'T2'}</span>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <label className="text-xs text-muted-foreground">Winner:</label>
          <select
            value={winner}
            onChange={e => setWinner(e.target.value)}
            className="px-3 py-1 bg-input border border-border rounded text-sm text-foreground focus:outline-none"
          >
            <option value="">— In progress —</option>
            {t1Slug && <option value={t1Slug}>{team1?.abbreviation ?? t1Slug}</option>}
            {t2Slug && <option value={t2Slug}>{team2?.abbreviation ?? t2Slug}</option>}
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={isPending || !isDirty}
          className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  )
}
