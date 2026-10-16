'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, UserCheck, UserPlus, CheckCircle2, Users, MapPin, ShieldCheck, ArrowRight } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { VoterStatusBadge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/Misc'
import { staggerContainer } from '@/lib/motion'
import { TokenStates } from '@/components/admin/TokenStates'
import { useOfficerContext } from '@/components/officer/useOfficerContext'
import { VerifyVoterModal } from '@/components/officer/VerifyVoterModal'
import { useStore } from '@/store/useStore'
import type { Voter } from '@/store/types'

export default function OfficerConsole() {
  const { unit, unitVoters, counts } = useOfficerContext()
  const tally = useStore((s) => s.unitTallyFor(unit?.id ?? null))
  const [query, setQuery] = useState('')
  const [target, setTarget] = useState<Voter | null>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return unitVoters.filter((v) => v.status === 'registered')
    return unitVoters.filter(
      (v) => v.id.toLowerCase().includes(q) || v.name.toLowerCase().includes(q),
    )
  }, [query, unitVoters])

  const turnout = counts.total ? Math.round((counts.voted / counts.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Unit banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-4 rounded-2xl border border-navy-800 bg-navy-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-civic-300">
            <ShieldCheck className="h-4 w-4" /> Assigned polling unit
          </div>
          <div className="mt-2 text-xl font-bold">{unit?.name}</div>
          <div className="mt-1 flex items-center gap-2 text-sm text-navy-200">
            <MapPin className="h-4 w-4" /> {unit?.code} · {unit?.region} · {unit?.ward}
          </div>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full bg-positive/20 px-3 py-1.5 text-xs font-bold text-positive">
          <span className="h-2 w-2 rounded-full bg-positive" /> Unit online
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={staggerContainer(0.07)}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatCard label="Awaiting verification" value={counts.awaiting} icon={<UserPlus className="h-5 w-5" />} tone="warning" />
        <StatCard label="Verified" value={counts.verified} icon={<UserCheck className="h-5 w-5" />} tone="civic" />
        <StatCard label="Votes cast" value={counts.voted} icon={<CheckCircle2 className="h-5 w-5" />} tone="positive" />
        <StatCard label="Unit turnout" value={`${turnout}%`} icon={<Users className="h-5 w-5" />} tone="navy" hint={`${counts.total} on today's roster`} />
      </motion.div>

      {/* Polling Unit Verification Layer — token reconciliation */}
      {tally && (
        <Card>
          <CardHeader
            title="Token reconciliation"
            subtitle="The three synchronized states must always match"
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <div className="mt-5">
            <TokenStates tally={tally} />
          </div>
        </Card>
      )}

      {/* Verification console */}
      <Card padded={false}>
        <div className="border-b border-ink-100 p-5">
          <h3 className="text-base font-bold text-navy-950">Voter check-in</h3>
          <p className="mt-0.5 text-sm text-ink-500">Search by VIN or name, then verify against the registry.</p>
          <div className="mt-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search VIN or voter name…"
              iconLeft={<Search className="h-4 w-4" />}
            />
          </div>
        </div>

        <div className="divide-y divide-ink-100">
          {results.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={<Search className="h-7 w-7" />}
                title="No matching voters"
                description="Try a different VIN or name. Only voters assigned to this unit appear here."
              />
            </div>
          ) : (
            results.map((v) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-4 sm:px-5"
              >
                <Avatar name={v.name} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-navy-950">{v.name}</div>
                  <div className="truncate font-mono text-xs text-ink-500">{v.id}</div>
                </div>
                <VoterStatusBadge status={v.status} />
                {v.status === 'registered' ? (
                  <Button size="sm" onClick={() => setTarget(v)} iconRight={<ArrowRight className="h-4 w-4" />}>
                    Verify
                  </Button>
                ) : (
                  <div className="hidden w-22 text-right text-xs font-medium text-ink-400 sm:block">
                    {v.status === 'voted' ? 'Ballot cast' : 'Ready to vote'}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </Card>

      <VerifyVoterModal voter={target} onClose={() => setTarget(null)} />
    </div>
  )
}
