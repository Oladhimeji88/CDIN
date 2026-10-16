'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { fadeUp } from '@/lib/motion'

interface StatCardProps {
  label: string
  value: ReactNode
  icon: ReactNode
  trend?: { value: string; up?: boolean }
  hint?: string
  tone?: 'civic' | 'navy' | 'positive' | 'warning' | 'danger'
}

const iconTones: Record<NonNullable<StatCardProps['tone']>, string> = {
  civic: 'bg-civic-50 text-civic-600',
  navy: 'bg-navy-50 text-navy-700',
  positive: 'bg-positive-soft text-positive',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
}

export function StatCard({ label, value, icon, trend, hint, tone = 'civic' }: StatCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="group rounded-2xl border border-ink-200/80 bg-white p-5 shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="flex items-center justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', iconTones[tone])}>
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-bold',
              trend.up ? 'text-positive' : 'text-danger',
            )}
          >
            {trend.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-4 text-3xl font-extrabold tracking-tight text-navy-950 tnum">{value}</div>
      <div className="mt-1 text-sm font-medium text-ink-500">{label}</div>
      {hint && <div className="mt-2 text-xs text-ink-400">{hint}</div>}
    </motion.div>
  )
}
