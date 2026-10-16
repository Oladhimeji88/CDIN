'use client'

import { motion } from 'framer-motion'
import { ShieldCheck, UserCheck, Lock, ArrowRight, UserCircle } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { fadeUp, staggerContainer } from '@/lib/motion'

const POINTS = [
  { icon: UserCheck, text: 'Each voter can vote exactly once.' },
  { icon: Lock, text: 'Every vote is cryptographically protected.' },
  { icon: ShieldCheck, text: 'Secure, anonymous and independently verifiable.' },
]

export function SystemEntryStep({ onStart, onProfile }: { onStart: () => void; onProfile: () => void }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-navy-950 bg-civic-grid px-5 py-10">
      <motion.div
        variants={staggerContainer(0.1, 0.1)}
        initial="hidden"
        animate="show"
        className="w-full max-w-md"
      >
        <motion.div variants={fadeUp} className="mb-8 flex justify-center">
          <Logo tone="light" size={44} />
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-2xl border border-navy-800 bg-navy-900/50 p-7 text-center">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-civic-300">
            National Voting System
          </div>
          <h1 className="mt-3 text-2xl font-extrabold text-white">Secure, anonymous, verifiable voting</h1>
          <div className="mt-7 space-y-3 text-left">
            {POINTS.map((p) => (
              <div key={p.text} className="flex items-center gap-3 rounded-xl border border-navy-800 bg-navy-900/60 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-civic-600/20 text-civic-300">
                  <p.icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-sm text-navy-100">{p.text}</span>
              </div>
            ))}
          </div>
          <Button onClick={onStart} fullWidth size="lg" className="mt-8" iconRight={<ArrowRight className="h-5 w-5" />}>
            Start session
          </Button>
          <button
            type="button"
            onClick={onProfile}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-navy-100 transition-colors hover:bg-navy-800"
          >
            <UserCircle className="h-4.5 w-4.5" /> My profile
          </button>
        </motion.div>
        <motion.p variants={fadeUp} className="mt-5 text-center text-xs text-navy-400">
          A citizen-owned cryptographic verification layer
        </motion.p>
      </motion.div>
    </div>
  )
}
