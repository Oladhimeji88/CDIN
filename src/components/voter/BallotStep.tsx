'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { partyLogo } from '@/lib/parties'
import { useStore } from '@/store/useStore'

export function BallotStep({ onNext }: { onNext: (candidateId: string) => void }) {
  const candidates = useStore((s) => s.candidates)
  const election = useStore((s) => s.activeElection())
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="mb-6">
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-civic-600">{election?.type}</div>
        <h2 className="mt-1 text-2xl font-bold text-navy-950">Cast your vote</h2>
        <p className="mt-1 text-sm text-ink-500">Select one candidate, then continue to confirm.</p>
      </motion.div>

      <div className="space-y-3">
        {candidates.map((c) => {
          const isSel = selected === c.id
          const logo = partyLogo(c.partyAbbr)
          return (
            <motion.button
              key={c.id}
              variants={fadeUp}
              whileTap={{ scale: 0.99 }}
              onClick={() => setSelected(c.id)}
              className={cn(
                'flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all',
                isSel ? 'border-civic-400 bg-civic-50 ring-4 ring-civic-100' : 'border-ink-200 bg-white hover:border-civic-300',
              )}
            >
              {logo ? (
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ink-200 bg-white p-1"
                  style={{ boxShadow: `inset 0 0 0 2px ${c.color}22` }}
                >
                  <img src={logo} alt={`${c.party} logo`} className="h-full w-full rounded-full object-cover" />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white" style={{ background: c.color }}>
                  {c.partyAbbr}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-base font-bold text-navy-950">{c.name}</div>
                <div className="truncate text-sm text-ink-500">{c.party}</div>
              </div>
              <div
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  isSel ? 'border-civic-600 bg-civic-600 text-white' : 'border-ink-300',
                )}
              >
                {isSel && <Check className="h-4 w-4" />}
              </div>
            </motion.button>
          )
        })}
      </div>

      <motion.div variants={fadeUp} className="sticky bottom-4 mt-7">
        <Button onClick={() => selected && onNext(selected)} disabled={!selected} fullWidth size="lg" iconRight={<ArrowRight className="h-5 w-5" />}>
          Next
        </Button>
      </motion.div>
    </motion.div>
  )
}
