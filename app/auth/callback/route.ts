import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if this user has already set up their player profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: player } = await supabase
          .from('players')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!player) {
          // First time — send them to display name setup
          return NextResponse.redirect(`${origin}/auth/setup`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
