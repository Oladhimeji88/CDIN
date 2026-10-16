import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import type { AlertSeverity, AlertStatus, VoterStatus, ElectionStatus } from '@/store/types'

type Tone = 'civic' | 'navy' | 'positive' | 'warning' | 'danger' | 'neutral'

const tones: Record<Tone, string> = {
  civic: 'bg-civic-50 text-civic-700 ring-civic-200',
  navy: 'bg-navy-50 text-navy-700 ring-navy-200',
  positive: 'bg-positive-soft text-positive ring-emerald-200',
  warning: 'bg-warning-soft text-warning ring-amber-200',
  danger: 'bg-danger-soft text-danger ring-red-200',
  neutral: 'bg-ink-100 text-ink-600 ring-ink-200',
}

export function Badge({
  children,
  tone = 'neutral',
  dot,
  className,
}: {
  children: ReactNode
  tone?: Tone
  dot?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

const severityTone: Record<AlertSeverity, Tone> = {
  low: 'neutral',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  return (
    <Badge tone={severityTone[severity]} dot className="capitalize">
      {severity}
    </Badge>
  )
}

const statusTone: Record<AlertStatus, Tone> = {
  open: 'danger',
  reviewing: 'warning',
  confirmed: 'navy',
  dismissed: 'neutral',
}

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  return (
    <Badge tone={statusTone[status]} className="capitalize">
      {status}
    </Badge>
  )
}

const voterTone: Record<VoterStatus, Tone> = {
  registered: 'neutral',
  verified: 'civic',
  voted: 'positive',
}

export function VoterStatusBadge({ status }: { status: VoterStatus }) {
  return (
    <Badge tone={voterTone[status]} dot className="capitalize">
      {status}
    </Badge>
  )
}

const electionTone: Record<ElectionStatus, Tone> = {
  draft: 'neutral',
  scheduled: 'civic',
  active: 'positive',
  closed: 'navy',
}

export function ElectionStatusBadge({ status }: { status: ElectionStatus }) {
  return (
    <Badge tone={electionTone[status]} dot className="capitalize">
      {status}
    </Badge>
  )
}
