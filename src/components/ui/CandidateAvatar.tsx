'use client'

import { useState } from 'react'
import { partyLogo } from '@/lib/parties'

/**
 * Candidate face with graceful fallback:
 *   /candidates/<abbr>.jpg  →  party logo  →  coloured abbreviation tile.
 * Drop photos into public/candidates (e.g. apc.jpg, ndc.jpg…) and they appear.
 */
export function CandidateAvatar({
  partyAbbr,
  color,
  size = 40,
  className = '',
}: {
  partyAbbr: string
  color: string
  size?: number
  className?: string
}) {
  const photo = `/candidates/${partyAbbr.toLowerCase()}.jpg`
  const logo = partyLogo(partyAbbr)
  const [stage, setStage] = useState<'photo' | 'logo' | 'abbr'>('photo')

  const src = stage === 'photo' ? photo : stage === 'logo' && logo ? logo : null

  if (!src) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white ${className}`}
        style={{ width: size, height: size, background: color }}
      >
        {partyAbbr}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-ink-200 bg-white ${className}`}
      style={{ width: size, height: size, boxShadow: `inset 0 0 0 2px ${color}22` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={partyAbbr}
        onError={() => setStage((s) => (s === 'photo' ? (logo ? 'logo' : 'abbr') : 'abbr'))}
        className="h-full w-full rounded-full object-cover"
      />
    </span>
  )
}
