'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Vote, Users, Boxes, ShieldAlert, ArrowUpRight, Crown } from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge, SeverityBadge, ElectionStatusBadge } from '@/components/ui/Badge'
import { ResultsBars } from '@/components/admin/ResultsBars'
import { TurnoutChart } from '@/components/admin/TurnoutChart'
import { staggerContainer } from '@/lib/motion'
import { fmtCompact, fmtNumber, fmtPercent, relativeTime } from '@/lib/format'
import { shortHash } from '@/lib/hash'
import { useElectionStats } from '@/components/admin/useElectionStats'
import { useStore } from '@/store/useStore'

export default function AdminOverview() {
  const { election, results, totalVotes, turnout, voted, registered, blockCount, openAlerts, hourlyTurnout, leader } = useElectionStats()
  const alerts = useStore((s) => s.alerts)
  const blocks = useStore((s) => s.blocks)
  const recentBlocks = [...blocks].slice(-5).reverse()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-navy-800 bg-navy-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-civic-300">{election?.type}</span>
            {election && <ElectionStatusBadge status={election.status} />}
          </div>
          <h2 className="mt-2 text-2xl font-bold">{election?.title}</h2>
          {leader && (
            <div className="mt-2 flex items-center gap-2 text-sm text-navy-200">
              <Crown className="h-4 w-4 text-warning" />
              <span className="font-semibold text-white">{leader.name}</span> leading with {fmtPercent(leader.percent)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 self-start rounded-full bg-positive/20 px-3 py-1.5 text-xs font-bold text-positive">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-positive opacity-60 animate-pulse-ring" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
          </span>
          Live tallying
        </div>
      </div>

      {/* KPIs */}
      <motion.div variants={staggerContainer(0.07)} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Ballots on ledger" value={fmtNumber(totalVotes)} icon={<Vote className="h-5 w-5" />} tone="civic" trend={{ value: 'live', up: true }} />
        <StatCard label="Voter turnout" value={fmtPercent(turnout, 1)} icon={<Users className="h-5 w-5" />} tone="positive" hint={`${fmtCompact(voted)} of ${fmtCompact(registered)}`} />
        <StatCard label="Blocks sealed" value={fmtNumber(blockCount)} icon={<Boxes className="h-5 w-5" />} tone="navy" />
        <StatCard label="Open alerts" value={openAlerts} icon={<ShieldAlert className="h-5 w-5" />} tone={openAlerts > 0 ? 'danger' : 'positive'} />
      </motion.div>

      {/* Results + turnout */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Live results"
            subtitle="Aggregated from the immutable ledger"
            icon={<Crown className="h-5 w-5" />}
            action={
              <Link href="/admin/results" className="inline-flex items-center gap-1 text-sm font-semibold text-civic-600 hover:text-civic-700">
                Details <ArrowUpRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="mt-6">
            <ResultsBars results={results} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Turnout over time" subtitle="Ballots committed per hour" icon={<Users className="h-5 w-5" />} />
          <div className="mt-4">
            <TurnoutChart data={hourlyTurnout} />
          </div>
        </Card>
      </div>

      {/* Alerts + blocks */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card padded={false}>
          <CardHeader
            title="Recent fraud alerts"
            subtitle="From the AI anomaly engine"
            icon={<ShieldAlert className="h-5 w-5" />}
            className="p-6 pb-0"
            action={
              <Link href="/admin/fraud" className="inline-flex items-center gap-1 text-sm font-semibold text-civic-600 hover:text-civic-700">
                All <ArrowUpRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="mt-4 divide-y divide-ink-100">
            {alerts.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-6 py-3.5">
                <div className="mt-0.5">
                  <SeverityBadge severity={a.severity} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-navy-950">{a.title}</div>
                  <div className="truncate text-xs text-ink-500">{a.scope} · {relativeTime(a.detectedAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padded={false}>
          <CardHeader
            title="Latest blocks"
            subtitle="Tip of the chain"
            icon={<Boxes className="h-5 w-5" />}
            className="p-6 pb-0"
            action={
              <Link href="/admin/ledger" className="inline-flex items-center gap-1 text-sm font-semibold text-civic-600 hover:text-civic-700">
                Explore <ArrowUpRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="mt-4 divide-y divide-ink-100">
            {recentBlocks.map((b) => (
              <div key={b.hash} className="flex items-center gap-3 px-6 py-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50 text-xs font-extrabold text-navy-700 tnum">
                  #{b.index}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-xs text-navy-800">{shortHash(b.hash, 14, 8)}</div>
                  <div className="truncate text-xs text-ink-500">{relativeTime(b.timestamp)}</div>
                </div>
                <Badge tone={b.type === 'vote' ? 'civic' : 'neutral'} className="capitalize">{b.type}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
