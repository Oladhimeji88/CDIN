'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, ScanSearch, ShieldAlert, CheckCircle2, XCircle, Eye, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { RiskRing } from '@/components/ui/Progress'
import { SeverityBadge, AlertStatusBadge } from '@/components/ui/Badge'
import { SectionHeading, EmptyState } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'
import { relativeTime } from '@/lib/format'
import { staggerContainer, fadeUp } from '@/lib/motion'
import { useStore } from '@/store/useStore'
import type { AlertStatus } from '@/store/types'

const FILTERS: { id: AlertStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'reviewing', label: 'Reviewing' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'dismissed', label: 'Dismissed' },
]

export default function AdminFraud() {
  const alerts = useStore((s) => s.alerts)
  const setAlertStatus = useStore((s) => s.setAlertStatus)
  const runManualScan = useStore((s) => s.runManualScan)
  const [filter, setFilter] = useState<AlertStatus | 'all'>('all')
  const [scanning, setScanning] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const filtered = useMemo(
    () => (filter === 'all' ? alerts : alerts.filter((a) => a.status === filter)),
    [alerts, filter],
  )

  const stats = useMemo(() => {
    const open = alerts.filter((a) => a.status === 'open').length
    const reviewing = alerts.filter((a) => a.status === 'reviewing').length
    const confirmed = alerts.filter((a) => a.status === 'confirmed').length
    const avgRisk = alerts.length ? Math.round(alerts.reduce((s, a) => s + a.riskScore, 0) / alerts.length) : 0
    return { open, reviewing, confirmed, avgRisk }
  }, [alerts])

  const scan = () => {
    setScanning(true)
    setTimeout(() => {
      const alert = runManualScan()
      setScanning(false)
      setToast(alert ? `New anomaly flagged: ${alert.title}` : 'Scan complete — no new anomalies detected.')
      setTimeout(() => setToast(null), 3500)
    }, 1400)
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="AI integrity layer"
        title="Fraud detection"
        description="Machine-learning anomaly detection over the live vote stream — spikes, duplicates and coordinated patterns."
        action={
          <Button onClick={scan} loading={scanning} iconLeft={!scanning ? <ScanSearch className="h-4 w-4" /> : undefined}>
            {scanning ? 'Scanning ledger…' : 'Run anomaly scan'}
          </Button>
        }
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 rounded-xl border border-civic-200 bg-civic-50 px-4 py-3 text-sm font-semibold text-civic-800"
          >
            <Sparkles className="h-4 w-4" /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={staggerContainer(0.07)} initial="hidden" animate="show" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Open alerts" value={stats.open} icon={<ShieldAlert className="h-5 w-5" />} tone={stats.open ? 'danger' : 'positive'} />
        <StatCard label="Under review" value={stats.reviewing} icon={<Eye className="h-5 w-5" />} tone="warning" />
        <StatCard label="Confirmed" value={stats.confirmed} icon={<CheckCircle2 className="h-5 w-5" />} tone="navy" />
        <StatCard label="Avg. risk score" value={stats.avgRisk} icon={<Bot className="h-5 w-5" />} tone="civic" />
      </motion.div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn('rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors', filter === f.id ? 'bg-navy-950 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<ShieldAlert className="h-7 w-7" />} title="No alerts in this view" description="The AI engine has not flagged anomalies matching this filter." />
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <motion.div key={a.id} variants={fadeUp} initial="hidden" animate="show">
              <Card>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex items-center gap-4 sm:flex-col sm:items-center">
                    <RiskRing score={a.riskScore} />
                    <div className="sm:mt-1 sm:text-center">
                      <SeverityBadge severity={a.severity} />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide text-civic-600">{a.type}</span>
                      <AlertStatusBadge status={a.status} />
                    </div>
                    <h3 className="mt-1 text-base font-bold text-navy-950">{a.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-600">{a.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                      <span className="font-semibold text-navy-800">{a.scope}</span>
                      <span>Metric: <span className="font-mono text-navy-700">{a.metric}</span></span>
                      <span>{relativeTime(a.detectedAt)}</span>
                    </div>

                    {(a.status === 'open' || a.status === 'reviewing') && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {a.status === 'open' && (
                          <Button size="sm" variant="secondary" onClick={() => setAlertStatus(a.id, 'reviewing')} iconLeft={<Eye className="h-4 w-4" />}>
                            Mark reviewing
                          </Button>
                        )}
                        <Button size="sm" variant="danger" onClick={() => setAlertStatus(a.id, 'confirmed')} iconLeft={<CheckCircle2 className="h-4 w-4" />}>
                          Confirm fraud
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setAlertStatus(a.id, 'dismissed')} iconLeft={<XCircle className="h-4 w-4" />}>
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
