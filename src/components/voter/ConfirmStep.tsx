'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, ShieldCheck, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { partyLogo } from '@/lib/parties'
import { useStore } from '@/store/useStore'

export function ConfirmStep({
  candidateId,
  onConfirm,
  onBack,
}: {
  candidateId: string
  onConfirm: () => void
  onBack: () => void
}) {
  const candidate = useStore((s) => s.candidates.find((c) => c.id === candidateId))
  if (!candidate) return null
  const logo = partyLogo(candidate.partyAbbr)

  return (
    <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="mb-6">
        <h2 className="text-2xl font-bold text-navy-950">Confirm your vote</h2>
        <p className="mt-1 text-sm text-ink-500">Please review your selection before submitting.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-2xl border border-ink-200 bg-white p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-400">You selected</div>
        <div className="mt-3 flex items-center gap-4">
          {logo ? (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-ink-200 bg-white p-1.5" style={{ boxShadow: `inset 0 0 0 2px ${candidate.color}22` }}>
              <img src={logo} alt={`${candidate.party} logo`} className="h-full w-full rounded-full object-cover" />
            </div>
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-base font-extrabold text-white" style={{ background: candidate.color }}>
              {candidate.partyAbbr}
            </div>
          )}
          <div>
            <div className="text-xl font-bold text-navy-950">{candidate.name}</div>
            <div className="text-sm text-ink-500">{candidate.party}</div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-4 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm text-warning">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>This action is <strong>final and cannot be reversed</strong>. Your encrypted ballot will be permanently recorded.</span>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">
        <Button onClick={onConfirm} fullWidth size="lg" iconLeft={<ShieldCheck className="h-5 w-5" />}>
          Confirm vote
        </Button>
        <Button onClick={onBack} variant="secondary" fullWidth size="lg" iconLeft={<ChevronLeft className="h-5 w-5" />}>
          Back
        </Button>
      </motion.div>
    </motion.div>
  )
}
