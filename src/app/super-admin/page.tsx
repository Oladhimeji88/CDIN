'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Vote, Users, UserCog, MapPin, Boxes, ShieldCheck, ShieldAlert, ArrowUpRight, Database, Network, BarChart3, Crown } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { KeyValue, Divider } from '@/components/ui/Misc'
import { ResultsBars } from '@/components/admin/ResultsBars'
import { VoteShareDonut } from '@/components/admin/VoteShareDonut'
import { TurnoutChart } from '@/components/admin/TurnoutChart'
import { cn } from '@/lib/cn'
import { fmtNumber, fmtPercent } from '@/lib/format'
import { staggerContainer } from '@/lib/motion'
import { useStore } from '@/store/useStore'
import { useResults } from '@/store/selectors'

const QUICK = [
  { href: '/super-admin/elections', label: 'Manage elections', icon: Vote },
  { href: '/super-admin/candidates', label: 'Manage candidates', icon: Users },
  { href: '/super-admin/officers', label: 'Manage officers', icon: UserCog },
  { href: '/super-admin/units', label: 'Manage polling units', icon: MapPin },
]

export default function SuperAdminOverview() {
  const elections = useStore((s) => s.elections)
  const candidates = useStore((s) => s.candidates)
  const officers = useStore((s) => s.officers)
  const units = useStore((s) => s.pollingUnits)
  const voters = useStore((s) => s.voters)
  const blocks = useStore((s) => s.blocks)
  const votes = useStore((s) => s.votes)
  const alerts = useStore((s) => s.alerts)
  const ledgerValid = useStore((s) => s.ledgerValid())
  const election = useStore((s) => s.activeElection())
  const results = useResults(election?.id ?? '')
  const totalVotesFn = useStore((s) => s.totalVotes)
  const unitTallies = useStore((s) => s.unitTallies)
  const totalVotes = useMemo(() => totalVotesFn(election?.id ?? ''), [totalVotesFn, election, unitTallies])
  const hourlyTurnout = useStore((s) => s.hourlyTurnout)

  const openAlerts = alerts.filter((a) => a.status === 'open' || a.status === 'reviewing').length
  const leader = results[0]

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-navy-800 bg-navy-950 p-6 text-white">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-civic-300">
          <Database className="h-4 w-4" /> System control centre
        </div>
        <h2 className="mt-2 text-2xl font-bold">Govern the entire CDIN deployment</h2>
        <p className="mt-1 max-w-2xl text-sm text-navy-200">
          Configure elections, candidates, officers and polling units. Every change is written to
          the shared ledger and instantly reflected across all connected dashboards.
        </p>
      </div>

      <motion.div variants={staggerContainer(0.07)} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Elections" value={elections.length} icon={<Vote className="h-5 w-5" />} tone="civic" />
        <StatCard label="Candidates" value={candidates.length} icon={<Users className="h-5 w-5" />} tone="navy" />
        <StatCard label="Officers" value={officers.length} icon={<UserCog className="h-5 w-5" />} tone="positive" />
        <StatCard label="Polling units" value={units.length} icon={<MapPin className="h-5 w-5" />} tone="warning" />
      </motion.div>

      {/* Live results — nationwide tally */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <Card>
          <CardHeader
            title="Live results"
            subtitle={`${fmtNumber(totalVotes)} validated ballots`}
            icon={<BarChart3 className="h-5 w-5" />}
            action={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-positive-soft px-2.5 py-1 text-xs font-bold text-positive">
                <span className="h-2 w-2 rounded-full bg-positive" /> Live
              </span>
            }
          />
          <div className="mt-4">
            <VoteShareDonut results={results} total={totalVotes} />
          </div>
          {leader && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-warning-soft px-3 py-2 text-sm">
              <Crown className="h-4 w-4 text-warning" />
              <span className="font-semibold text-navy-900">{leader.name}</span>
              <span className="ml-auto font-bold text-navy-950 tnum">{fmtPercent(leader.percent)}</span>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Candidate standings" subtitle="Nationwide vote share" icon={<Crown className="h-5 w-5" />} />
          <div className="mt-6">
            <ResultsBars results={results} />
          </div>
        </Card>
      </div>

      {/* Turnout over time */}
      <Card>
        <CardHeader title="Turnout over time" subtitle="Ballots committed per hour" icon={<Users className="h-5 w-5" />} />
        <div className="mt-4">
          <TurnoutChart data={hourlyTurnout} />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* System health */}
        <Card>
          <CardHeader title="System health" subtitle="Live ledger & data integrity" icon={<ShieldCheck className="h-5 w-5" />} />
          <div className="mt-4">
            <div className={cn('mb-4 flex items-center gap-3 rounded-xl border px-4 py-3', ledgerValid ? 'border-positive/30 bg-positive-soft' : 'border-danger/30 bg-danger-soft')}>
              {ledgerValid ? <ShieldCheck className="h-5 w-5 text-positive" /> : <ShieldAlert className="h-5 w-5 text-danger" />}
              <span className={cn('text-sm font-bold', ledgerValid ? 'text-positive' : 'text-danger')}>
                {ledgerValid ? 'Ledger integrity verified' : 'Ledger integrity error'}
              </span>
            </div>
            <KeyValue label="Blocks sealed" value={<span className="tnum">{fmtNumber(blocks.length)}</span>} />
            <Divider />
            <KeyValue label="On-chain votes (live tail)" value={<span className="tnum">{fmtNumber(votes.length)}</span>} />
            <Divider />
            <KeyValue label="Registered voters (sample)" value={<span className="tnum">{fmtNumber(voters.length)}</span>} />
            <Divider />
            <KeyValue label="Open fraud alerts" value={<span className="tnum">{openAlerts}</span>} />
          </div>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader title="Quick actions" subtitle="Jump into management" icon={<Boxes className="h-5 w-5" />} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {QUICK.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="group flex items-center justify-between rounded-xl border border-ink-200 p-4 transition-all hover:border-civic-300 hover:bg-civic-50"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-civic-600 text-white">
                    <q.icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-sm font-semibold text-navy-900">{q.label}</span>
                </span>
                <ArrowUpRight className="h-4 w-4 text-ink-300 transition-all group-hover:translate-x-0.5 group-hover:text-civic-600" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      {/* Decentralisation assurance — no central override exists by design */}
      <Card>
        <CardHeader title="Decentralised by design" subtitle="No actor can alter or erase recorded data" icon={<Network className="h-5 w-5" />} />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: 'Append-only ledger', text: 'Recorded votes and configuration are immutable — they can only be added to, never edited or deleted.' },
            { icon: Network, title: 'No central override', text: 'Even the super administrator cannot reset, reverse or rewrite the ledger. Authority is distributed.' },
            { icon: Database, title: 'Independently verifiable', text: 'Every record is cryptographically hash-linked, so any unauthorised change is immediately detectable.' },
          ].map((b) => (
            <div key={b.title} className="rounded-xl border border-ink-200 bg-ink-50 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-civic-600 text-white">
                <b.icon className="h-4.5 w-4.5" />
              </div>
              <div className="mt-3 text-sm font-bold text-navy-950">{b.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-ink-500">{b.text}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
