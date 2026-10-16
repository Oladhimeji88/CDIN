'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, LogOut } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/lib/cn'
import { useSession } from '@/store/useSession'

const STEPS = ['Verify', 'Vote', 'Receipt'] as const
export type VoterStep = (typeof STEPS)[number]

export function VoterShell({
  current,
  children,
}: {
  current: VoterStep
  children: ReactNode
}) {
  const router = useRouter()
  const logout = useSession((s) => s.logout)
  const currentIndex = STEPS.indexOf(current)

  const exit = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="flex min-h-dvh flex-col bg-ink-50">
      <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4 sm:px-6">
          <Logo size={32} />
          <button
            onClick={exit}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-ink-500 transition-colors hover:bg-ink-100 hover:text-navy-900"
          >
            <LogOut className="h-4 w-4" /> Exit
          </button>
        </div>
      </header>

      {/* Step progress */}
      <div className="border-b border-ink-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-4 py-4 sm:px-6">
          {STEPS.map((step, i) => {
            const done = i < currentIndex
            const activeStep = i === currentIndex
            return (
              <div key={step} className="flex flex-1 items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                      done && 'bg-positive text-white',
                      activeStep && 'bg-civic-600 text-white',
                      !done && !activeStep && 'bg-ink-100 text-ink-400',
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      activeStep ? 'text-navy-950' : done ? 'text-positive' : 'text-ink-400',
                    )}
                  >
                    {step}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <motion.div
                      initial={false}
                      animate={{ width: done ? '100%' : '0%' }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute inset-y-0 left-0 bg-positive"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">{children}</main>

      <footer className="border-t border-ink-200 bg-white py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-center gap-2 px-4 text-xs text-ink-400">
          <Check className="h-3.5 w-3.5 text-positive" />
          Your ballot is encrypted end-to-end and unlinkable to your identity.
        </div>
      </footer>
    </div>
  )
}
