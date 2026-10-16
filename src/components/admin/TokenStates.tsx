'use client'

import { TicketCheck, Vote, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { fmtNumber } from '@/lib/format'
import type { UnitTally } from '@/store/types'

export function unitConsistent(t: UnitTally): boolean {
  const sum = Object.values(t.perCandidate).reduce((s, n) => s + n, 0)
  return t.encrypted === t.cast && t.accredited >= t.cast && sum === t.encrypted
}

/**
 * Polling Unit Verification Layer — renders the three synchronized states
 * (accredited / cast / encrypted) and the consistency invariant.
 */
export function TokenStates({ tally }: { tally: UnitTally }) {
  const consistent = unitConsistent(tally)
  const states = [
    { label: 'Accredited', sub: 'issued tokens', value: tally.accredited, icon: TicketCheck, tone: 'civic' as const },
    { label: 'Votes cast', sub: 'used tokens', value: tally.cast, icon: Vote, tone: 'navy' as const },
    { label: 'Encrypted', sub: 'recorded on ledger', value: tally.encrypted, icon: ShieldCheck, tone: 'positive' as const },
  ]
  const toneClass = {
    civic: 'bg-civic-50 text-civic-600',
    navy: 'bg-navy-50 text-navy-700',
    positive: 'bg-positive-soft text-positive',
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {states.map((s) => (
          <div key={s.label} className="rounded-xl border border-ink-200 p-3">
            <div className={cn('mb-2 flex h-8 w-8 items-center justify-center rounded-lg', toneClass[s.tone])}>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="text-xl font-extrabold text-navy-950 tnum">{fmtNumber(s.value)}</div>
            <div className="text-xs font-semibold text-navy-800">{s.label}</div>
            <div className="text-[11px] text-ink-400">{s.sub}</div>
          </div>
        ))}
      </div>
      <div
        className={cn(
          'mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold',
          consistent ? 'bg-positive-soft text-positive' : 'bg-danger-soft text-danger',
        )}
      >
        {consistent ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        {consistent ? 'States consistent · accredited ≥ cast = encrypted' : 'Inconsistency detected · states do not reconcile'}
      </div>
    </div>
  )
}
