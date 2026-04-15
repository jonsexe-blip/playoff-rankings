import Image from 'next/image'
import { getLogoUrl } from '@/lib/team-logos'

interface TeamLogoProps {
  slug: string
  league: 'NBA' | 'NHL'
  abbreviation: string
  size?: number
  className?: string
}

export function TeamLogo({ slug, league, abbreviation, size = 32, className }: TeamLogoProps) {
  const src = getLogoUrl(slug, league, abbreviation)

  return (
    <Image
      src={src}
      alt={abbreviation}
      width={size}
      height={size}
      className={className}
      onError={(e) => {
        // Hide broken image — abbreviation text still shows next to it
        (e.target as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}
