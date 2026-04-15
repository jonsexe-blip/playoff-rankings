'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavLinksProps {
  isAdmin: boolean
  isLoggedIn: boolean
}

export function NavLinks({ isAdmin, isLoggedIn }: NavLinksProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/', label: 'Standings' },
    ...(isLoggedIn ? [{ href: '/player', label: 'My Picks' }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <>
      {/* Desktop links */}
      <div className="hidden md:flex items-center gap-8">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'text-base font-semibold tracking-tight transition-colors',
              pathname === link.href
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile hamburger */}
      <div className="md:hidden">
        <button
          onClick={() => setOpen(prev => !prev)}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {open && (
          <div className="absolute top-full left-0 right-0 bg-background/98 backdrop-blur-sm border-b border-border shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'px-3 py-3 text-base font-semibold rounded-lg transition-colors',
                    pathname === link.href
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
