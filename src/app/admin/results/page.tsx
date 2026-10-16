'use client'

import { motion } from 'framer-motion'
import { PieChart as PieIcon, MapPin, Crown } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/Progress'
import { SectionHeading } from '@/components/ui/Misc'
import { Badge } from '@/components/ui/Badge'
import { ResultsBars } from '@/components/admin/ResultsBars'
import { VoteShareDonut } from '@/components/admin/VoteShareDonut'
import { useElectionStats } from '@/components/admin/useElectionStats'
import { fmtNumber, fmtPercent } from '@/lib/format'
import { staggerContainer, fadeUp } from '@/lib/motion'

export default function AdminResults() {
  const { results, totalVotes, regions, leader } = useElectionStats()

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Live tally"
        title="Election results"
        description="Independently auditable results aggregated directly from the blockchain ledger."
        action={leader && <Badge tone="warning" dot>Leading · {leader.partyAbbr}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card>
          <CardHeader title="Vote share" subtitle="Proportional split" icon={<PieIcon className="h-5 w-5" />} />
          <div className="mt-4">
            <VoteShareDonut results={results} total={totalVotes} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {results.map((c) => (
              <div key={c.id} className="flex items-center gap-2 rounded-lg bg-ink-50 px-2.5 py-2">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: c.color }} />
                <span className="truncate text-xs font-semibold text-navy-800">{c.partyAbbr}</span>
                <span className="ml-auto text-xs font-bold text-ink-500 tnum">{fmtPercent(c.percent, 0)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Standings" subtitle="Votes per candidate" icon={<Crown className="h-5 w-5" />} />
          <div className="mt-6">
            <ResultsBars results={results} />
          </div>
        </Card>
      </div>

      {/* Candidate cards */}
      <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {results.map((c, i) => (
          <motion.div key={c.id} variants={fadeUp}>
            <Card className="h-full">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-extrabold text-white" style={{ background: c.color }}>
                  {c.partyAbbr}
                </span>
                {i === 0 && <Badge tone="warning" dot>Leading</Badge>}
              </div>
              <div className="mt-3 text-base font-bold text-navy-950">{c.name}</div>
              <div className="text-xs text-ink-500">{c.party}</div>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-navy-950 tnum">{fmtPercent(c.percent)}</span>
                <span className="text-xs text-ink-400 tnum">{fmtNumber(c.votes)} votes</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-ink-500">{c.manifesto}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Regional breakdown */}
      <Card>
        <CardHeader title="Regional turnout" subtitle="Participation by state" icon={<MapPin className="h-5 w-5" />} />
        <div className="mt-5 space-y-4">
          {regions.map((r, i) => (
            <div key={r.region}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-semibold text-navy-900">{r.region}</span>
                <span className="text-ink-500">
                  <span className="font-bold text-navy-900 tnum">{fmtPercent(r.turnout, 0)}</span>
                  <span className="ml-2 text-xs text-ink-400 tnum">{fmtNumber(r.voted)} / {fmtNumber(r.registered)}</span>
                </span>
              </div>
              <ProgressBar value={r.turnout} color="var(--color-navy-700)" delay={i * 0.04} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
