'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, FileCheck2, Link2, Boxes, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

const STEPS = [
  { icon: Lock, label: 'Encrypting ballot' },
  { icon: FileCheck2, label: 'Generating zero-knowledge proof' },
  { icon: Link2, label: 'Binding credential to vote' },
  { icon: Boxes, label: 'Submitting to distributed ledger' },
]

export function ProcessingStep({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    let i = 0
    const tick = () => {
      i += 1
      setStep(i)
      if (i >= STEPS.length) {
        setTimeout(onDone, 700)
        return
      }
      timer = setTimeout(tick, 850)
    }
    let timer = setTimeout(tick, 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-navy-950 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-civic-600 text-white animate-pulse-ring">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-white">Processing vote</h2>
          <p className="mt-1 text-sm text-navy-300">Please wait — do not close this window.</p>
        </div>
        <div className="space-y-3">
          {STEPS.map((s, i) => {
            const done = step > i + 1 || step >= STEPS.length
            const active = step === i + 1
            return (
              <div
                key={s.label}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                  done ? 'border-positive/40 bg-positive/10' : active ? 'border-civic-500/50 bg-navy-900' : 'border-navy-800 bg-navy-900/40',
                )}
              >
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', done ? 'bg-positive text-white' : active ? 'bg-civic-600 text-white' : 'bg-navy-800 text-navy-400')}>
                  {done ? <Check className="h-4 w-4" /> : active ? <Loader2 className="h-4 w-4 animate-spin" /> : <s.icon className="h-4 w-4" />}
                </div>
                <span className={cn('text-sm font-semibold', done || active ? 'text-white' : 'text-navy-400')}>{s.label}…</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
