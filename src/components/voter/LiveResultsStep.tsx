'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Crown, ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { ResultsBars } from '@/components/admin/ResultsBars'
import { VoteShareDonut } from '@/components/admin/VoteShareDonut'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { fmtNumber, fmtPercent } from '@/lib/format'
import { useStore } from '@/store/useStore'
import { useResults } from '@/store/selectors'

export function LiveResultsStep({ onFinish }: { onFinish: () => void }) {
  const election = useStore((s) => s.activeElection())
  const results = useResults(election?.id ?? '')
  const totalVotesFn = useStore((s) => s.totalVotes)
  const unitTallies = useStore((s) => s.unitTallies)
  const total = useMemo(() => totalVotesFn(election?.id ?? ''), [totalVotesFn, election, unitTallies])
  const leader = results[0]

  return (
    <motion.div variants={staggerContainer(0.08)} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="mb-6 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-civic-600">
            <RefreshCw className="h-3.5 w-3.5" /> Live · nationwide
          </div>
          <h2 className="mt-1 text-2xl font-bold text-navy-950">National results</h2>
          <p className="mt-1 text-sm text-ink-500">Aggregated from validated polling units across the nation.</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-positive-soft px-3 py-1.5 text-xs font-bold text-positive">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-positive opacity-60 animate-pulse-ring" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
          </span>
          Live
        </span>
      </motion.div>

      {leader && (
        <motion.div variants={fadeUp} className="mb-4 flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white" style={{ background: leader.color }}>
            {leader.partyAbbr}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-warning">
              <Crown className="h-3.5 w-3.5" /> Leading
            </div>
            <div className="truncate font-bold text-navy-950">{leader.name}</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-extrabold text-navy-950 tnum">{fmtPercent(leader.percent)}</div>
            <div className="text-xs text-ink-400 tnum">{fmtNumber(leader.votes)}</div>
          </div>
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader title="Vote share" subtitle={`${fmtNumber(total)} ballots counted`} icon={<BarChart3 className="h-5 w-5" />} />
          <div className="mt-4">
            <VoteShareDonut results={results} total={total} />
          </div>
          <div className="mt-6">
            <ResultsBars results={results} />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="mt-4 rounded-xl bg-civic-50 px-4 py-3 text-xs text-civic-800">
        These results update live as encrypted votes are recorded — and remain independently verifiable on the public ledger.
      </motion.div>

      <motion.div variants={fadeUp} className="mt-7">
        <Button onClick={onFinish} fullWidth size="lg" variant="dark" iconRight={<ArrowRight className="h-5 w-5" />}>
          Finish
        </Button>
      </motion.div>
    </motion.div>
  )
}
