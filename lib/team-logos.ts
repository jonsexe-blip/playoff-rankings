/**
 * Maps team slugs to ESPN CDN logo URLs.
 * ESPN format: https://a.espncdn.com/i/teamlogos/{league}/500/{abbr}.png
 *
 * Most abbreviations match directly (lowercased), but a few ESPN codes differ
 * from the standard 3-letter abbreviations.
 */

const NBA_OVERRIDES: Record<string, string> = {
  nyk: 'ny',   // Knicks
}

const NHL_OVERRIDES: Record<string, string> = {
  tbl: 'tb',   // Lightning
  njd: 'nj',   // Devils
  uta: 'utah', // Utah Hockey Club
}

export function getLogoUrl(slug: string, league: 'NBA' | 'NHL', abbreviation: string): string {
  const leagueKey = league.toLowerCase()
  const abbr = abbreviation.toLowerCase()

  const overrides = league === 'NBA' ? NBA_OVERRIDES : NHL_OVERRIDES
  const espnAbbr = overrides[abbr] ?? abbr

  return `https://a.espncdn.com/i/teamlogos/${leagueKey}/500/${espnAbbr}.png`
}
