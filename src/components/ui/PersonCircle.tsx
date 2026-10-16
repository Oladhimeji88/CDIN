'use client'

import { useState } from 'react'
import { User } from 'lucide-react'

/** Circular portrait with a clean avatar fallback if the image is missing. */
export function PersonCircle({ src, alt, size = 76 }: { src: string; alt: string; size?: number }) {
  const [ok, setOk] = useState(true)
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-navy-700 bg-navy-800 ring-2 ring-navy-950"
      style={{ width: size, height: size }}
    >
      {ok ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} onError={() => setOk(false)} className="h-full w-full object-cover" />
      ) : (
        <User className="h-1/2 w-1/2 text-navy-400" />
      )}
    </span>
  )
}
