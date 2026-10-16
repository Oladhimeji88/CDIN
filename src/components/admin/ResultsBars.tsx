'use client'

import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import { ProgressBar } from '@/components/ui/Progress'
import { fmtNumber, fmtPercent } from '@/lib/format'
import { cn } from '@/lib/cn'
import { partyLogo } from '@/lib/parties'
import type { CandidateResult } from '@/store/useStore'

export function ResultsBars({ results, showLeader = true }: { results: CandidateResult[]; showLeader?: boolean }) {
  return (
    <div className="space-y-5">
      {results.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
        >
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              {partyLogo(c.partyAbbr) ? (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink-200 bg-white">
                  <img src={partyLogo(c.partyAbbr) as string} alt={c.partyAbbr} className="h-full w-full object-contain p-0.5" />
                </span>
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-extrabold text-white" style={{ background: c.color }}>
                  {c.partyAbbr}
                </span>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-bold text-navy-950">{c.name}</span>
                  {showLeader && i === 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-1.5 py-0.5 text-[10px] font-bold text-warning">
                      <Crown className="h-3 w-3" /> Leading
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-ink-500">{c.party}</div>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div className={cn('text-sm font-extrabold tnum', i === 0 ? 'text-navy-950' : 'text-ink-700')}>
                {fmtPercent(c.percent)}
              </div>
              <div className="text-xs text-ink-400 tnum">{fmtNumber(c.votes)}</div>
            </div>
          </div>
          <ProgressBar value={c.percent} color={c.color} delay={i * 0.06} />
        </motion.div>
      ))}
    </div>
  )
}
