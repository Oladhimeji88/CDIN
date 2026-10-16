'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Crown, RefreshCw } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeading } from '@/components/ui/Misc'
import { ResultsBars } from '@/components/admin/ResultsBars'
import { VoteShareDonut } from '@/components/admin/VoteShareDonut'
import { fmtNumber, fmtPercent } from '@/lib/format'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { useStore } from '@/store/useStore'
import { useResults } from '@/store/selectors'
import { CandidateAvatar } from '@/components/ui/CandidateAvatar'

export default function VoterResults() {
  const election = useStore((s) => s.activeElection())
  const results = useResults(election?.id ?? '')
  const totalVotesFn = useStore((s) => s.totalVotes)
  const unitTallies = useStore((s) => s.unitTallies)
  const total = useMemo(() => totalVotesFn(election?.id ?? ''), [totalVotesFn, election, unitTallies])
  const leader = results[0]

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Live · nationwide"
        title="National results"
        description="Aggregated from validated polling units. Updates live as encrypted votes are recorded."
        action={
          <Badge tone="positive" dot>Live</Badge>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Card>
          <CardHeader title="Vote share" subtitle={`${fmtNumber(total)} ballots counted`} icon={<BarChart3 className="h-5 w-5" />} />
          <div className="mt-4">
            <VoteShareDonut results={results} total={total} />
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
          <CardHeader title="Standings" subtitle="Votes per candidate" icon={<Crown className="h-5 w-5" />} />
          <div className="mt-6">
            <ResultsBars results={results} />
          </div>
        </Card>
      </div>

      <motion.div variants={staggerContainer(0.05)} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {results.map((c) => (
          <motion.div key={c.id} variants={fadeUp}>
            <Card className="h-full">
              <div className="flex items-center gap-2.5">
                <CandidateAvatar partyAbbr={c.partyAbbr} color={c.color} size={40} />
                <span className="text-sm font-bold text-navy-950">{c.partyAbbr}</span>
              </div>
              <div className="mt-3 text-2xl font-extrabold text-navy-950 tnum">{fmtPercent(c.percent)}</div>
              <div className="text-xs text-ink-400 tnum">{fmtNumber(c.votes)} votes</div>
              <div className="mt-1 truncate text-xs text-ink-500">{c.name}</div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <p className="flex items-center justify-center gap-1.5 text-xs text-ink-400">
        <RefreshCw className="h-3.5 w-3.5" /> Results are independently verifiable on the public ledger.
      </p>
    </div>
  )
}
