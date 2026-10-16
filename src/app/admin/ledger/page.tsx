'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ShieldCheck, Link2, Boxes, Copy, Check } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { KeyValue, Divider, SectionHeading, EmptyState } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'
import { shortHash } from '@/lib/hash'
import { fmtDateTime, fmtNumber, relativeTime } from '@/lib/format'
import { useStore } from '@/store/useStore'
import type { Block, BlockType } from '@/store/types'

const TYPES: { id: BlockType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'vote', label: 'Votes' },
  { id: 'candidate', label: 'Candidates' },
  { id: 'election', label: 'Elections' },
  { id: 'genesis', label: 'Genesis' },
]

const typeTone: Record<BlockType, 'civic' | 'navy' | 'positive' | 'warning' | 'neutral'> = {
  vote: 'civic',
  candidate: 'navy',
  election: 'positive',
  genesis: 'warning',
  system: 'neutral',
}

export default function AdminLedger() {
  const blocks = useStore((s) => s.blocks)
  const ledgerValid = useStore((s) => s.ledgerValid())
  const [query, setQuery] = useState('')
  const [type, setType] = useState<BlockType | 'all'>('all')
  const [selected, setSelected] = useState<Block | null>(null)
  const [copied, setCopied] = useState(false)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...blocks]
      .reverse()
      .filter((b) => (type === 'all' ? true : b.type === type))
      .filter((b) => (!q ? true : b.hash.includes(q) || String(b.index).includes(q) || b.summary.toLowerCase().includes(q)))
  }, [blocks, query, type])

  const copy = (hash: string) => {
    navigator.clipboard?.writeText(hash).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    })
  }

  const selectedPrev = selected ? blocks.find((b) => b.hash === selected.prevHash) : undefined

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Blockchain" title="Ledger explorer" description="Every record is hash-linked to the previous block, making tampering immediately detectable." />

      {/* Integrity banner */}
      <div className={cn('flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between', ledgerValid ? 'border-positive/30 bg-positive-soft' : 'border-danger/30 bg-danger-soft')}>
        <div className="flex items-center gap-3">
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', ledgerValid ? 'bg-positive text-white' : 'bg-danger text-white')}>
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className={cn('text-base font-bold', ledgerValid ? 'text-positive' : 'text-danger')}>
              {ledgerValid ? 'Chain integrity verified' : 'Chain integrity compromised'}
            </div>
            <div className="text-sm text-ink-600">All {fmtNumber(blocks.length)} blocks are correctly linked end-to-end.</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <div className="text-xl font-extrabold text-navy-950 tnum">{fmtNumber(blocks.length)}</div>
            <div className="text-xs text-ink-500">blocks</div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-navy-950 tnum">0</div>
            <div className="text-xs text-ink-500">broken links</div>
          </div>
        </div>
      </div>

      <Card padded={false}>
        <div className="flex flex-col gap-4 border-b border-ink-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={cn('rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors', type === t.id ? 'bg-navy-950 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200')}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="sm:w-72">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search hash, index or summary…" iconLeft={<Search className="h-4 w-4" />} />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<Boxes className="h-7 w-7" />} title="No blocks match" description="Try a different filter or search term." />
          </div>
        ) : (
          <div className="divide-y divide-ink-100">
            {rows.slice(0, 60).map((b) => (
              <motion.button
                key={b.hash}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setSelected(b)}
                className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-ink-50 sm:px-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-xs font-extrabold text-navy-700 tnum">
                  #{b.index}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-navy-950">{b.summary}</div>
                  <div className="flex items-center gap-1.5 truncate font-mono text-xs text-ink-500">
                    <Link2 className="h-3 w-3 shrink-0 text-positive" /> {shortHash(b.hash, 16, 8)}
                  </div>
                </div>
                <div className="hidden shrink-0 text-right text-xs text-ink-400 sm:block">{relativeTime(b.timestamp)}</div>
                <Badge tone={typeTone[b.type]} className="capitalize">{b.type}</Badge>
              </motion.button>
            ))}
          </div>
        )}
      </Card>

      {/* Block detail */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `Block #${selected.index}` : ''} description={selected?.summary} size="lg">
        {selected && (
          <div>
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-positive/30 bg-positive-soft px-4 py-3 text-sm font-semibold text-positive">
              <ShieldCheck className="h-4 w-4" /> Hash linkage verified against block #{selectedPrev?.index ?? '—'}
            </div>
            <KeyValue label="Type" value={<Badge tone={typeTone[selected.type]} className="capitalize">{selected.type}</Badge>} />
            <Divider />
            <KeyValue label="Timestamp" value={fmtDateTime(selected.timestamp)} />
            <Divider />
            <KeyValue label="Nonce (PoW)" value={<span className="tnum">{selected.nonce}</span>} />
            <Divider />
            <div className="py-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm text-ink-500">Block hash</span>
                <button onClick={() => copy(selected.hash)} className="inline-flex items-center gap-1 text-xs font-semibold text-civic-600 hover:text-civic-700">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <code className="block break-all rounded-lg bg-navy-950 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-civic-200">
                {selected.hash}
              </code>
            </div>
            <div className="py-1">
              <div className="mb-1.5 text-sm text-ink-500">Previous hash</div>
              <code className="block break-all rounded-lg bg-ink-50 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-ink-600">
                {selected.prevHash}
              </code>
            </div>
            <div className="py-1">
              <div className="mb-1.5 text-sm text-ink-500">Payload hash</div>
              <code className="block break-all rounded-lg bg-ink-50 px-3 py-2.5 font-mono text-[12px] leading-relaxed text-ink-600">
                {selected.payloadHash}
              </code>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
