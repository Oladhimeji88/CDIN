'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { KeyRound, Check, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { fadeUp, staggerContainer, scaleIn } from '@/lib/motion'
import { anonToken } from '@/lib/hash'
import { useStore } from '@/store/useStore'

const GUARANTEES = ['Allows exactly one vote', 'Cannot be reused', 'Cannot be linked to your identity']

export function CredentialStep({ voterId, onProceed }: { voterId: string; onProceed: () => void }) {
  const election = useStore((s) => s.activeElection())
  const token = election ? anonToken(voterId, election.id) : ''
  const [revealed, setRevealed] = useState(false)

  return (
    <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show">
      <motion.div variants={scaleIn} className="mb-6 flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-civic-50 text-civic-600">
          <KeyRound className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-navy-950">Voting credential ready</h2>
        <p className="mt-1 max-w-sm text-sm text-ink-500">
          An anonymous, single-use credential has been issued for this session.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-2xl border border-navy-800 bg-navy-950 p-5 text-white">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-civic-300">Credential ID</span>
          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-300 transition-colors hover:bg-navy-800 hover:text-white"
            aria-label={revealed ? 'Hide credential ID' : 'Show credential ID'}
          >
            {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="mt-2 break-all font-mono text-base tracking-wider text-white">
          {revealed ? token : '•'.repeat(20)}
        </div>
        <div className="mt-1 text-xs text-navy-300">{revealed ? 'encrypted credential' : 'hidden / encrypted'}</div>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-4 space-y-2">
        {GUARANTEES.map((g) => (
          <div key={g} className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-4 py-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-positive-soft text-positive">
              <Check className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-navy-900">{g}</span>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="mt-7">
        <Button onClick={onProceed} fullWidth size="lg" iconRight={<ArrowRight className="h-5 w-5" />}>
          Proceed to ballot
        </Button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-400">
          <ShieldCheck className="h-3.5 w-3.5 text-positive" /> Your choice will remain secret end-to-end
        </p>
      </motion.div>
    </motion.div>
  )
}
