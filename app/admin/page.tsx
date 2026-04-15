import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllTeams, getSeries, getPlayoffSettings } from '@/lib/supabase/queries'
import { AdminPanel } from '@/components/admin-panel'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: player } = await supabase
    .from('players')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!player?.is_admin) {
    redirect('/')
  }

  const [teams, nbaSeries, nhlSeries, settings] = await Promise.all([
    getAllTeams(),
    getSeries('NBA'),
    getSeries('NHL'),
    getPlayoffSettings(),
  ])

  return (
    <div className="min-h-screen">
      <section className="py-16 lg:py-20 px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-foreground">
            ADMIN PANEL
          </h1>
          <p className="mt-4 text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Manage teams, update series results, and control picks availability.
          </p>
        </div>
      </section>

      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AdminPanel
            teams={teams}
            nbaSeries={nbaSeries}
            nhlSeries={nhlSeries}
            settings={settings}
          />
        </div>
      </section>
    </div>
  )
}
