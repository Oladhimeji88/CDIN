'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Copy, Check, EyeOff, ShieldCheck, ArrowRight, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { KeyValue, Divider } from '@/components/ui/Misc'
import { shortHash } from '@/lib/hash'
import { fmtDateTime } from '@/lib/format'
import { fadeUp, staggerContainer, scaleIn } from '@/lib/motion'
import type { VoteReceipt } from '@/store/useStore'
import { useStore } from '@/store/useStore'

function receiptId(hash: string): string {
  const clean = hash.replace(/[^a-z0-9]/gi, '').toUpperCase()
  return (clean.slice(0, 12).match(/.{1,4}/g) ?? []).join('-')
}

export function ReceiptStep({
  receipt,
  onViewResults,
  onFinish,
}: {
  receipt: VoteReceipt
  onViewResults: () => void
  onFinish: () => void
}) {
  const unit = useStore((s) => s.unitFor(receipt.vote.pollingUnitId))
  const [copied, setCopied] = useState(false)
  const rid = receiptId(receipt.block.hash)

  const copy = () => {
    navigator.clipboard?.writeText(rid).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show">
      <motion.div variants={scaleIn} className="mb-6 flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-positive-soft">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 14 }}>
            <CheckCircle2 className="h-12 w-12 text-positive" />
          </motion.div>
        </div>
        <h2 className="mt-5 text-2xl font-bold text-navy-950">Vote confirmed</h2>
        <p className="mt-1 max-w-sm text-sm text-ink-500">Your vote has been recorded on the ledger.</p>
      </motion.div>

      {/* Receipt */}
      <motion.div variants={fadeUp} className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
        <div className="flex items-center justify-between border-b border-ink-100 bg-navy-950 px-5 py-4">
          <div className="flex items-center gap-2 text-white">
            <ShieldCheck className="h-5 w-5 text-civic-300" />
            <span className="font-bold">Receipt</span>
          </div>
          <span className="rounded-full bg-positive/20 px-2.5 py-1 text-xs font-bold text-positive">Confirmed</span>
        </div>
        <div className="p-5">
          <div className="text-sm text-ink-500">Receipt ID</div>
          <div className="mt-1 flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-ink-50 px-3 py-2.5 font-mono text-base font-bold tracking-wider text-navy-900">{rid}</code>
            <Button variant="secondary" size="sm" onClick={copy} iconLeft={copied ? <Check className="h-4 w-4 text-positive" /> : <Copy className="h-4 w-4" />}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>

          <div className="mt-4">
            <KeyValue label="Block height" value={<span className="tnum">#{receipt.block.index}</span>} />
            <Divider />
            <KeyValue label="Polling unit" value={unit?.code ?? '—'} />
            <Divider />
            <KeyValue label="Timestamp" value={fmtDateTime(receipt.vote.timestamp)} />
            <Divider />
            <KeyValue label="Block hash" value={shortHash(receipt.block.hash, 10, 6)} mono />
          </div>
        </div>
      </motion.div>

      {/* Verification guarantees */}
      <motion.div variants={fadeUp} className="mt-4 rounded-2xl border border-ink-200 bg-white p-5">
        <div className="text-sm font-semibold text-navy-800">You can later verify that:</div>
        <div className="mt-3 space-y-2">
          {['Your vote exists in the system', 'It was included in the final tally'].map((t) => (
            <div key={t} className="flex items-center gap-2.5 text-sm text-navy-900">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-positive-soft text-positive">
                <Check className="h-3.5 w-3.5" />
              </div>
              {t}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-civic-50 px-3 py-2.5 text-xs font-medium text-civic-800">
          <EyeOff className="h-4 w-4 shrink-0" /> Your vote choice remains secret and is never linked to your identity.
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-7 flex flex-col gap-3">
        <Button onClick={onViewResults} fullWidth size="lg" iconLeft={<BarChart3 className="h-5 w-5" />}>
          View live results
        </Button>
        <Button onClick={onFinish} fullWidth size="lg" variant="secondary" iconRight={<ArrowRight className="h-5 w-5" />}>
          Finish
        </Button>
      </motion.div>
    </motion.div>
  )
}
