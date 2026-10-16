'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Network,
  TicketCheck,
  Vote,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ban,
  Search,
} from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Field'
import { ProgressBar } from '@/components/ui/Progress'
import { ResultsBars } from '@/components/admin/ResultsBars'
import { TokenStates } from '@/components/admin/TokenStates'
import { SectionHeading } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'
import { fmtNumber, fmtPercent } from '@/lib/format'
import { staggerContainer, fadeUp } from '@/lib/motion'
import { useStore } from '@/store/useStore'
import { useResults, useUnitStates, useNationalTotals } from '@/store/selectors'
import type { UnitState } from '@/store/useStore'
import type { UnitValidation } from '@/store/types'

const valTone: Record<UnitValidation, 'positive' | 'warning' | 'danger'> = {
  validated: 'positive',
  pending: 'warning',
  flagged: 'danger',
}
const valIcon = { validated: CheckCircle2, pending: Clock, flagged: Ban }

export default function AdminAggregation() {
  const election = useStore((s) => s.activeElection())
  const results = useResults(election?.id ?? '')
  const unitStates = useUnitStates()
  const totals = useNationalTotals()
  const setUnitValidation = useStore((s) => s.setUnitValidation)
  const candidates = useStore((s) => s.candidates)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<UnitState | null>(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return unitStates
    return unitStates.filter(
      (u) => u.unit.code.toLowerCase().includes(q) || u.unit.name.toLowerCase().includes(q) || u.unit.region.toLowerCase().includes(q),
    )
  }, [unitStates, query])

  // keep the selected unit in sync after validation changes
  const selectedLive = selected ? unitStates.find((u) => u.unit.id === selected.unit.id) ?? null : null

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="National Aggregation Layer"
        title="Aggregated results"
        description="National totals are not entered manually — they are computed as the sum of cryptographically validated polling-unit outputs. Pending or flagged units are excluded until validated."
      />

      {/* National reconciliation banner */}
      <div className={cn('rounded-2xl border p-6', totals.consistent ? 'border-positive/30 bg-positive-soft' : 'border-danger/30 bg-danger-soft')}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl text-white', totals.consistent ? 'bg-positive' : 'bg-danger')}>
              {totals.consistent ? <ShieldCheck className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </div>
            <div>
              <div className={cn('text-base font-bold', totals.consistent ? 'text-positive' : 'text-danger')}>
                {totals.consistent ? 'All polling units reconcile' : 'Reconciliation error detected'}
              </div>
              <div className="text-sm text-ink-600">Invariant: accredited ≥ cast = encrypted across {totals.totalUnits} units</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Accredited', sub: 'issued', value: totals.accredited, icon: TicketCheck },
              { label: 'Cast', sub: 'used', value: totals.cast, icon: Vote },
              { label: 'Encrypted', sub: 'recorded', value: totals.encrypted, icon: ShieldCheck },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-500">
                  <s.icon className="h-3.5 w-3.5" /> {s.label}
                </div>
                <div className="text-xl font-extrabold text-navy-950 tnum">{fmtNumber(s.value)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <motion.div variants={staggerContainer(0.07)} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Validated units" value={totals.validatedUnits} icon={<CheckCircle2 className="h-5 w-5" />} tone="positive" hint="accepted into results" />
        <StatCard label="Pending validation" value={totals.pendingUnits} icon={<Clock className="h-5 w-5" />} tone="warning" hint="excluded for now" />
        <StatCard label="Flagged units" value={totals.flaggedUnits} icon={<Ban className="h-5 w-5" />} tone="danger" hint="excluded from results" />
        <StatCard label="Accepted ballots" value={fmtNumber(totals.acceptedCast)} icon={<Network className="h-5 w-5" />} tone="civic" />
      </motion.div>

      {/* National results (sum of validated units) */}
      <Card>
        <CardHeader
          title="National results"
          subtitle={`Σ of ${totals.validatedUnits} validated polling units`}
          icon={<Network className="h-5 w-5" />}
        />
        <div className="mt-6">
          <ResultsBars results={results} />
        </div>
      </Card>

      {/* Per-unit verified outputs */}
      <Card padded={false}>
        <div className="flex flex-col gap-3 border-b border-ink-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-navy-950">Polling-unit outputs</h3>
            <p className="text-sm text-ink-500">Each unit's verified result and token reconciliation.</p>
          </div>
          <div className="sm:w-64">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search unit / region…" iconLeft={<Search className="h-4 w-4" />} />
          </div>
        </div>

        <div className="divide-y divide-ink-100">
          {rows.map((u) => {
            const VIcon = valIcon[u.tally.validation]
            return (
              <button
                key={u.unit.id}
                onClick={() => setSelected(u)}
                className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-ink-50 sm:px-5"
              >
                <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', u.consistent ? 'bg-positive-soft text-positive' : 'bg-danger-soft text-danger')}>
                  {u.consistent ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-navy-950">{u.unit.code}</div>
                  <div className="truncate text-xs text-ink-500">{u.unit.region} · {u.unit.ward}</div>
                </div>
                <div className="hidden text-right md:block">
                  <div className="text-sm font-bold text-navy-950 tnum">{fmtNumber(u.tally.cast)}</div>
                  <div className="text-[11px] text-ink-400">cast / {fmtNumber(u.tally.accredited)} accr.</div>
                </div>
                {u.leading && (
                  <span className="hidden items-center gap-1.5 rounded-full bg-ink-50 px-2.5 py-1 sm:inline-flex">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: u.leading.candidate.color }} />
                    <span className="text-xs font-semibold text-navy-800">{u.leading.candidate.partyAbbr}</span>
                  </span>
                )}
                <Badge tone={valTone[u.tally.validation]} dot className="capitalize">
                  <VIcon className="h-3 w-3" /> {u.tally.validation}
                </Badge>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Unit detail */}
      <Modal
        open={!!selectedLive}
        onClose={() => setSelected(null)}
        title={selectedLive?.unit.code}
        description={selectedLive ? `${selectedLive.unit.name} · ${selectedLive.unit.region}` : ''}
        size="lg"
        footer={
          selectedLive && (
            <div className="flex w-full flex-wrap items-center justify-between gap-2">
              <Badge tone={valTone[selectedLive.tally.validation]} dot className="capitalize">
                {selectedLive.tally.validation}
              </Badge>
              <div className="flex gap-2">
                {selectedLive.tally.validation !== 'validated' && (
                  <Button size="sm" onClick={() => setUnitValidation(selectedLive.unit.id, 'validated')} iconLeft={<CheckCircle2 className="h-4 w-4" />}>
                    Validate &amp; accept
                  </Button>
                )}
                {selectedLive.tally.validation === 'validated' && (
                  <Button size="sm" variant="ghost" onClick={() => setUnitValidation(selectedLive.unit.id, 'pending')} iconLeft={<Ban className="h-4 w-4" />}>
                    Exclude
                  </Button>
                )}
              </div>
            </div>
          )
        }
      >
        {selectedLive && (
          <div className="space-y-5">
            <TokenStates tally={selectedLive.tally} />
            <div>
              <div className="mb-3 text-sm font-semibold text-navy-800">Verified result breakdown</div>
              <div className="space-y-4">
                {candidates
                  .filter((c) => c.electionId === election?.id)
                  .map((c) => {
                    const v = selectedLive.tally.perCandidate[c.id] ?? 0
                    const pct = selectedLive.tally.cast ? (v / selectedLive.tally.cast) * 100 : 0
                    return (
                      <div key={c.id}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                            <span className="font-semibold text-navy-900">{c.partyAbbr}</span>
                          </span>
                          <span className="text-ink-500">
                            <span className="font-bold text-navy-900 tnum">{fmtNumber(v)}</span>
                            <span className="ml-2 text-xs tnum">{fmtPercent(pct, 0)}</span>
                          </span>
                        </div>
                        <ProgressBar value={pct} color={c.color} />
                      </div>
                    )
                  })}
              </div>
            </div>
            <div className="rounded-xl bg-ink-50 px-4 py-3 text-xs text-ink-500">
              {selectedLive.tally.validation === 'validated'
                ? 'This unit is cryptographically validated and its output is included in the national total.'
                : 'This unit is excluded from the national total until it is validated.'}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
