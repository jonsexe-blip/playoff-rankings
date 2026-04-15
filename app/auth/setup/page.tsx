import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SetupForm } from '@/components/setup-form'

export default async function SetupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // If they already have a player row, skip setup
  const { data: player } = await supabase
    .from('players')
    .select('id')
    .eq('id', user.id)
    .single()

  if (player) {
    redirect('/player')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome!</h1>
          <p className="text-muted-foreground">
            Pick a display name that&apos;ll appear on the leaderboard.
          </p>
        </div>
        <SetupForm userId={user.id} />
      </div>
    </div>
  )
}
