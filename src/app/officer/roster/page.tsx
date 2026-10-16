'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { VoterStatusBadge } from '@/components/ui/Badge'
import { SectionHeading, EmptyState } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'
import { fmtDateTime } from '@/lib/format'
import { useOfficerContext } from '@/components/officer/useOfficerContext'
import { VerifyVoterModal } from '@/components/officer/VerifyVoterModal'
import type { Voter, VoterStatus } from '@/store/types'

const FILTERS: { id: VoterStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'registered', label: 'Awaiting' },
  { id: 'verified', label: 'Verified' },
  { id: 'voted', label: 'Voted' },
]

export default function OfficerRoster() {
  const { unitVoters, counts } = useOfficerContext()
  const [filter, setFilter] = useState<VoterStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [target, setTarget] = useState<Voter | null>(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return unitVoters
      .filter((v) => (filter === 'all' ? true : v.status === filter))
      .filter((v) => (!q ? true : v.id.toLowerCase().includes(q) || v.name.toLowerCase().includes(q)))
  }, [unitVoters, filter, query])

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Polling unit"
        title="Voter roster"
        description="Every voter assigned to your unit, with live verification status."
      />

      <Card padded={false}>
        <div className="flex flex-col gap-4 border-b border-ink-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const n = f.id === 'all' ? counts.total : f.id === 'registered' ? counts.awaiting : f.id === 'verified' ? counts.verified : counts.voted
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors',
                    filter === f.id ? 'bg-navy-950 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200',
                  )}
                >
                  {f.label} <span className="tnum opacity-70">· {n}</span>
                </button>
              )
            })}
          </div>
          <div className="sm:w-64">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" iconLeft={<Search className="h-4 w-4" />} />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<Search className="h-7 w-7" />} title="No voters found" description="Adjust the filter or search." />
          </div>
        ) : (
          <div className="divide-y divide-ink-100">
            {rows.map((v) => (
              <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 sm:px-5">
                <Avatar name={v.name} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-navy-950">{v.name}</div>
                  <div className="truncate font-mono text-xs text-ink-500">{v.id}</div>
                </div>
                <div className="hidden text-right text-xs text-ink-400 md:block">
                  {v.verifiedAt ? `Verified ${fmtDateTime(v.verifiedAt)}` : 'Not verified'}
                </div>
                <VoterStatusBadge status={v.status} />
                {v.status === 'registered' && (
                  <Button size="sm" onClick={() => setTarget(v)}>
                    Verify
                  </Button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      <VerifyVoterModal voter={target} onClose={() => setTarget(null)} />
    </div>
  )
}
