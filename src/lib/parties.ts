/** Maps a party abbreviation to its official logo image. */
const PARTY_LOGOS: Record<string, string> = {
  APC: '/parties/apc.jpg',
  NDC: '/parties/ndc.jpg',
  ADC: '/parties/adc.jpg',
  PDP: '/parties/pdp.png',
  APM: '/parties/apm.jpg',
}

export function partyLogo(abbr: string | undefined | null): string | null {
  if (!abbr) return null
  return PARTY_LOGOS[abbr.toUpperCase()] ?? null
}
