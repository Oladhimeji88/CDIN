'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

export function ProgressBar({
  value,
  color = 'var(--color-civic-500)',
  track = 'var(--color-ink-100)',
  height = 8,
  delay = 0,
  className,
}: {
  value: number
  color?: string
  track?: string
  height?: number
  delay?: number
  className?: string
}) {
  return (
    <div
      className={cn('w-full overflow-hidden rounded-full', className)}
      style={{ background: track, height }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  )
}

export function RiskRing({ score, size = 56 }: { score: number; size?: number }) {
  const stroke = 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const color = score >= 75 ? 'var(--color-danger)' : score >= 45 ? 'var(--color-warning)' : 'var(--color-positive)'
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-ink-100)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (score / 100) * c }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-navy-950 tnum">
        {score}
      </div>
    </div>
  )
}
