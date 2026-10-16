'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Vote, CheckCircle2, BarChart3, UserCircle, ArrowRight, ShieldCheck, Crown } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { KeyValue, Divider } from '@/components/ui/Misc'
import { anonToken, shortHash } from '@/lib/hash'
import { fmtNumber, fmtPercent, fmtDateTime } from '@/lib/format'
import { staggerContainer, fadeUp } from '@/lib/motion'
import { useStore } from '@/store/useStore'
import { useSession } from '@/store/useSession'
import { useResults } from '@/store/selectors'

function receiptId(hash: string) {
  const clean = hash.replace(/[^a-z0-9]/gi, '').toUpperCase()
  return (clean.slice(0, 12).match(/.{1,4}/g) ?? []).join('-')
}

export default function VoterHome() {
  const router = useRouter()
  const refId = useSession((s) => s.user?.refId)
  const voters = useStore((s) => s.voters)
  const votes = useStore((s) => s.votes)
  const blocks = useStore((s) => s.blocks)
  const election = useStore((s) => s.activeElection())
  const results = useResults(election?.id ?? '')
  const totalVotesFn = useStore((s) => s.totalVotes)
  const unitTallies = useStore((s) => s.unitTallies)
  const totalVotes = useMemo(() => totalVotesFn(election?.id ?? ''), [totalVotesFn, election, unitTallies])

  const voter = voters.find((v) => v.id === refId)
  const unit = useStore((s) => s.unitFor(voter?.pollingUnitId ?? null))
  const leader = results[0]
  const hasVoted = voter?.status === 'voted'

  const receipt = useMemo(() => {
    if (!voter || !election || voter.status !== 'voted') return null
    const token = anonToken(voter.id, election.id)
    const vote = votes.find((v) => v.anonToken === token && v.electionId === election.id)
    if (!vote) return null
    const block = blocks.find((b) => b.hash === vote.blockHash)
    return block ? { vote, block } : null
  }, [voter, election, votes, blocks])

  if (!voter) return null

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col gap-4 rounded-2xl border border-navy-800 bg-navy-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {voter.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={voter.photoUrl} alt={voter.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-navy-700" />
          ) : (
            <Avatar name={voter.name} size={56} />
          )}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-civic-300">Welcome back</div>
            <div className="mt-0.5 text-xl font-bold">{voter.name}</div>
            <div className="text-sm text-navy-200">{voter.id} · {unit?.region}</div>
          </div>
        </div>
        <Badge tone={hasVoted ? 'positive' : 'warning'} dot className="self-start capitalize">
          {hasVoted ? 'Vote cast' : 'Not voted'}
        </Badge>
      </div>

      {/* Primary action / status */}
      {hasVoted ? (
        <Card>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-positive-soft text-positive">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-navy-950">Your vote has been recorded</h3>
              <p className="mt-0.5 text-sm text-ink-500">It is permanently committed to the ledger and independently verifiable.</p>
              {receipt && (
                <div className="mt-4 rounded-xl border border-ink-200 bg-ink-50 p-4">
                  <KeyValue label="Receipt ID" value={<span className="font-mono font-bold">{receiptId(receipt.block.hash)}</span>} />
                  <Divider />
                  <KeyValue label="Block" value={<span className="tnum">#{receipt.block.index}</span>} />
                  <Divider />
                  <KeyValue label="Recorded" value={voter.votedAt ? fmtDateTime(voter.votedAt) : '—'} />
                  <Divider />
                  <KeyValue label="Hash" value={shortHash(receipt.block.hash, 10, 6)} mono />
                </div>
              )}
              <Button className="mt-4" onClick={() => router.push('/voter/results')} iconRight={<ArrowRight className="h-4 w-4" />}>
                View live results
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-civic-50 text-civic-600">
                <Vote className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy-950">You haven&apos;t voted yet</h3>
                <p className="mt-0.5 text-sm text-ink-500">Cast your encrypted ballot in the {election?.type}.</p>
              </div>
            </div>
            <Button onClick={() => router.push('/vote')} size="lg" className="w-full sm:w-auto" iconLeft={<ShieldCheck className="h-5 w-5" />}>
              Cast your vote
            </Button>
          </div>
        </Card>
      )}

      {/* Live snapshot */}
      <motion.div variants={staggerContainer(0.07)} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Ballots on ledger" value={fmtNumber(totalVotes)} icon={<BarChart3 className="h-5 w-5" />} tone="civic" />
        <StatCard label="Leading" value={leader?.partyAbbr ?? '—'} icon={<Crown className="h-5 w-5" />} tone="warning" hint={leader ? fmtPercent(leader.percent) : undefined} />
        <StatCard label="Your unit" value={unit?.code ?? '—'} icon={<ShieldCheck className="h-5 w-5" />} tone="navy" hint={unit?.ward} />
      </motion.div>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/voter/results" className="group flex items-center justify-between rounded-2xl border border-ink-200 bg-white p-5 transition-all hover:border-civic-300 hover:shadow-[var(--shadow-lift)]">
          <span className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-civic-600 text-white"><BarChart3 className="h-5 w-5" /></span>
            <span>
              <span className="block font-bold text-navy-950">Live results</span>
              <span className="block text-sm text-ink-500">Nationwide tally</span>
            </span>
          </span>
          <ArrowRight className="h-5 w-5 text-ink-300 transition-all group-hover:translate-x-0.5 group-hover:text-civic-600" />
        </Link>
        <Link href="/voter/profile" className="group flex items-center justify-between rounded-2xl border border-ink-200 bg-white p-5 transition-all hover:border-civic-300 hover:shadow-[var(--shadow-lift)]">
          <span className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-700 text-white"><UserCircle className="h-5 w-5" /></span>
            <span>
              <span className="block font-bold text-navy-950">Profile</span>
              <span className="block text-sm text-ink-500">Your details &amp; photo</span>
            </span>
          </span>
          <ArrowRight className="h-5 w-5 text-ink-300 transition-all group-hover:translate-x-0.5 group-hover:text-civic-600" />
        </Link>
      </div>
    </div>
  )
}
