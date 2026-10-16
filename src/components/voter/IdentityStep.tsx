'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fingerprint, ScanLine, XCircle, ArrowRight, IdCard } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { useStore } from '@/store/useStore'

type Invalid = 'not_registered' | 'already_used' | null

export function IdentityStep({
  defaultVin,
  onEligible,
  onExit,
}: {
  defaultVin?: string
  onEligible: (voterId: string) => void
  onExit: () => void
}) {
  const voters = useStore((s) => s.voters)
  const [value, setValue] = useState(defaultVin ?? '')
  const [invalid, setInvalid] = useState<Invalid>(null)
  const [checking, setChecking] = useState(false)

  const evaluate = (vin: string) => {
    setChecking(true)
    setInvalid(null)
    // Eligibility Result (system decision)
    setTimeout(() => {
      const v = voters.find((x) => x.id.toLowerCase() === vin.trim().toLowerCase())
      setChecking(false)
      if (!v) return setInvalid('not_registered')
      if (v.status === 'voted') return setInvalid('already_used')
      onEligible(v.id)
    }, 850)
  }

  if (invalid) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="overflow-hidden rounded-2xl border border-danger/30 bg-white">
          <div className="flex items-center gap-2 border-b border-danger/20 bg-danger-soft px-5 py-4 text-danger">
            <XCircle className="h-5 w-5" />
            <span className="font-bold">Not eligible</span>
          </div>
          <div className="p-5">
            <p className="text-sm text-ink-600">This credential is:</p>
            <ul className="mt-3 space-y-2 text-sm text-navy-900">
              <li className={invalid === 'not_registered' ? 'font-semibold text-danger' : 'text-ink-500'}>• not registered in the voter roll</li>
              <li className="text-ink-500">• not assigned to this session, or</li>
              <li className={invalid === 'already_used' ? 'font-semibold text-danger' : 'text-ink-500'}>• already used to cast a vote</li>
            </ul>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" onClick={() => setInvalid(null)}>Try again</Button>
              <Button variant="ghost" onClick={onExit}>Exit</Button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="mb-6">
        <h2 className="text-2xl font-bold text-navy-950">Verify eligibility</h2>
        <p className="mt-1 text-sm text-ink-500">Enter your Voter ID (VIN) or scan your credential to begin.</p>
      </motion.div>

      <motion.div variants={fadeUp} className="rounded-2xl border border-ink-200 bg-white p-5">
        <label htmlFor="vin" className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-navy-800">
          <IdCard className="h-4 w-4 text-ink-400" /> Voter ID
        </label>
        <Input
          id="vin"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="VIN-XXXXXXXX"
          className="font-mono"
          autoComplete="off"
        />

        <Button
          onClick={() => evaluate(value)}
          disabled={!value.trim() || checking}
          loading={checking}
          fullWidth
          size="lg"
          className="mt-5"
          iconRight={!checking ? <ArrowRight className="h-5 w-5" /> : undefined}
        >
          {checking ? 'Checking eligibility…' : 'Continue'}
        </Button>

        <div className="my-4 flex items-center gap-3 text-xs text-ink-400">
          <span className="h-px flex-1 bg-ink-100" /> or <span className="h-px flex-1 bg-ink-100" />
        </div>

        <Button
          variant="secondary"
          fullWidth
          disabled={checking}
          onClick={() => {
            if (defaultVin) {
              setValue(defaultVin)
              evaluate(defaultVin)
            }
          }}
          iconLeft={<ScanLine className="h-4 w-4" />}
        >
          Scan credential
        </Button>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-4 flex items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 p-4 text-xs text-ink-500">
        <Fingerprint className="h-4 w-4 shrink-0 text-civic-600" />
        Your identity is checked against the voter roll only to confirm eligibility — it is never linked to your ballot.
      </motion.div>
    </motion.div>
  )
}
