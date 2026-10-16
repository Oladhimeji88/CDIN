'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Bot, User, UserCheck, ShieldHalf, Cpu, BarChart3, ScrollText } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Field'
import { SectionHeading, EmptyState } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'
import { fmtDateTime, relativeTime } from '@/lib/format'
import { useStore } from '@/store/useStore'
import type { AuditEntry } from '@/store/types'

const ACTORS: { id: AuditEntry['actor'] | 'all'; label: string; icon: typeof User }[] = [
  { id: 'all', label: 'All', icon: ScrollText },
  { id: 'voter', label: 'Voter', icon: User },
  { id: 'officer', label: 'Officer', icon: UserCheck },
  { id: 'admin', label: 'Admin', icon: BarChart3 },
  { id: 'superadmin', label: 'Super Admin', icon: ShieldHalf },
  { id: 'ai', label: 'AI', icon: Bot },
  { id: 'system', label: 'System', icon: Cpu },
]

const actorIcon: Record<AuditEntry['actor'], typeof User> = {
  voter: User,
  officer: UserCheck,
  admin: BarChart3,
  superadmin: ShieldHalf,
  ai: Bot,
  system: Cpu,
}

const sevDot: Record<AuditEntry['severity'], string> = {
  info: 'bg-civic-500',
  success: 'bg-positive',
  warning: 'bg-warning',
  critical: 'bg-danger',
}

const actorChip: Record<AuditEntry['actor'], string> = {
  voter: 'bg-civic-50 text-civic-700',
  officer: 'bg-emerald-50 text-emerald-700',
  admin: 'bg-navy-50 text-navy-700',
  superadmin: 'bg-violet-50 text-violet-700',
  ai: 'bg-amber-50 text-amber-700',
  system: 'bg-ink-100 text-ink-600',
}

export default function AdminAudit() {
  const audit = useStore((s) => s.audit)
  const [actor, setActor] = useState<AuditEntry['actor'] | 'all'>('all')
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return audit
      .filter((e) => (actor === 'all' ? true : e.actor === actor))
      .filter((e) => (!q ? true : e.action.toLowerCase().includes(q) || e.detail.toLowerCase().includes(q)))
  }, [audit, actor, query])

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Transparency" title="Audit trail" description="An append-only, tamper-evident record of every meaningful action across the system." />

      <Card padded={false}>
        <div className="flex flex-col gap-4 border-b border-ink-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {ACTORS.map((a) => (
              <button
                key={a.id}
                onClick={() => setActor(a.id)}
                className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors', actor === a.id ? 'bg-navy-950 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200')}
              >
                <a.icon className="h-3.5 w-3.5" /> {a.label}
              </button>
            ))}
          </div>
          <div className="lg:w-64">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search actions…" iconLeft={<Search className="h-4 w-4" />} />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<Search className="h-7 w-7" />} title="No entries" description="Adjust the filter or search." />
          </div>
        ) : (
          <div className="divide-y divide-ink-100">
            {rows.map((e) => {
              const Icon = actorIcon[e.actor]
              return (
                <motion.div key={e.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 p-4 sm:px-5">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', actorChip[e.actor])}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn('h-1.5 w-1.5 rounded-full', sevDot[e.severity])} />
                      <span className="text-sm font-bold text-navy-950">{e.action}</span>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-ink-500">{e.detail}</div>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <div className="text-xs font-medium text-ink-500">{relativeTime(e.timestamp)}</div>
                    <div className="text-[11px] text-ink-400">{fmtDateTime(e.timestamp)}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
