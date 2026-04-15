'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SetupForm({ userId }: { userId: string }) {
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = displayName.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase
      .from('players')
      .insert({ id: userId, display_name: trimmed })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/player')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          type="text"
          placeholder="e.g. Mike J"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={30}
          required
          autoFocus
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      <Button type="submit" className="w-full" disabled={loading || !displayName.trim()}>
        {loading ? 'Saving...' : 'Get Started'}
      </Button>
    </form>
  )
}
