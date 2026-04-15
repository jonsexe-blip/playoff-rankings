'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface AuthButtonProps {
  user: { displayName: string | null } | null
}

export function AuthButton({ user }: AuthButtonProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">
        {user.displayName}
      </span>
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  )
}
