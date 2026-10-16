'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, Vote, Boxes } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionHeading, EmptyState } from '@/components/ui/Misc'
import { relativeTime } from '@/lib/format'
import { shortHash } from '@/lib/hash'
import { staggerContainer, fadeUp } from '@/lib/motion'
import { useOfficerContext } from '@/components/officer/useOfficerContext'
import { useStore } from '@/store/useStore'

interface Event {
  id: string
  kind: 'verify' | 'vote'
  time: string
  title: string
  detail: string
}

export default function OfficerActivity() {
  const { unit, unitVoters } = useOfficerContext()
  const votes = useStore((s) => s.votes)

  const events = useMemo<Event[]>(() => {
    const list: Event[] = []
    unitVoters.forEach((v) => {
      if (v.verifiedAt) list.push({ id: `vf-${v.id}`, kind: 'verify', time: v.verifiedAt, title: 'Voter verified', detail: `${v.name} · ${v.id}` })
    })
    votes
      .filter((vt) => vt.pollingUnitId === unit?.id)
      .forEach((vt) => list.push({ id: vt.id, kind: 'vote', time: vt.timestamp, title: 'Encrypted vote recorded', detail: `Block #${vt.blockIndex} · ${shortHash(vt.blockHash, 8, 6)}` }))
    return list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  }, [unitVoters, votes, unit])

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow={unit?.code} title="Unit activity" description="A live, append-only timeline of verifications and ballots at your polling unit." />

      <Card>
        {events.length === 0 ? (
          <EmptyState icon={<Boxes className="h-7 w-7" />} title="No activity yet" description="Verifications and votes will appear here as they happen." />
        ) : (
          <motion.ol variants={staggerContainer(0.05)} initial="hidden" animate="show" className="relative">
            <div className="absolute bottom-2 left-[19px] top-2 w-px bg-ink-100" />
            {events.map((e) => (
              <motion.li key={e.id} variants={fadeUp} className="relative flex gap-4 pb-6 last:pb-0">
                <div
                  className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    e.kind === 'vote' ? 'bg-positive-soft text-positive' : 'bg-civic-50 text-civic-600'
                  }`}
                >
                  {e.kind === 'vote' ? <Vote className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-navy-950">{e.title}</span>
                    <span className="shrink-0 text-xs text-ink-400">{relativeTime(e.time)}</span>
                  </div>
                  <div className="mt-0.5 font-mono text-xs text-ink-500">{e.detail}</div>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        )}
      </Card>
    </div>
  )
}
