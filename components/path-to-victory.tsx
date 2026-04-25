'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PathEntry } from '@/lib/types'

interface PathToVictoryProps {
  winningPaths: PathEntry[] | 'any' | 'eliminated'
}

export function PathToVictory({ winningPaths }: PathToVictoryProps) {
  const [open, setOpen] = useState(false)

  if (winningPaths === 'eliminated') {
    return (
      <span className="text-xs text-muted-foreground/50 italic">No path to victory</span>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
      >
        Path to victory
        <ChevronDown className={cn('w-3 h-3 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="mt-2 p-3 bg-background rounded-lg border border-border space-y-2">
          {winningPaths === 'any' ? (
            <p className="text-xs font-semibold text-green-500">
              Any remaining outcome wins — already clinched!
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground font-medium mb-2">Wins if:</p>
              {winningPaths.map((path, i) => (
                <div key={i}>
                  {i > 0 && (
                    <div className="text-xs text-muted-foreground font-bold my-1 pl-1">— or —</div>
                  )}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <span className="font-bold text-foreground">{path.nbaWinner}</span>
                    <span className="text-muted-foreground">wins NBA Finals</span>
                    <span className="text-muted-foreground">+</span>
                    <span className="font-bold text-foreground">{path.nhlWinner}</span>
                    <span className="text-muted-foreground">wins NHL Finals</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
