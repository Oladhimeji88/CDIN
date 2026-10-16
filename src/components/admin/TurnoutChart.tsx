'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { fmtCompact, fmtNumber } from '@/lib/format'

interface Point {
  label: string
  votes: number
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-ink-200 bg-white px-3 py-2 shadow-[var(--shadow-lift)]">
      <div className="text-xs font-semibold text-ink-500">{label}</div>
      <div className="text-sm font-extrabold text-navy-950 tnum">{fmtNumber(payload[0].value)} votes</div>
    </div>
  )
}

export function TurnoutChart({ data, height = 240 }: { data: Point[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="var(--color-ink-100)" vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--color-ink-400)', fontSize: 12 }} />
        <YAxis tickFormatter={(v) => fmtCompact(v)} tickLine={false} axisLine={false} tick={{ fill: 'var(--color-ink-400)', fontSize: 12 }} width={48} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-civic-300)', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="votes"
          stroke="var(--color-civic-500)"
          strokeWidth={2.5}
          fill="var(--color-civic-100)"
          fillOpacity={0.7}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
