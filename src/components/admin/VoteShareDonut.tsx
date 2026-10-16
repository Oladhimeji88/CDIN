'use client'

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { fmtNumber, fmtPercent } from '@/lib/format'
import type { CandidateResult } from '@/store/useStore'

function DonutTooltip({ active, payload }: { active?: boolean; payload?: { payload: CandidateResult }[] }) {
  if (!active || !payload?.length) return null
  const c = payload[0].payload
  return (
    <div className="rounded-xl border border-ink-200 bg-white px-3 py-2 shadow-[var(--shadow-lift)]">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-navy-900">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} /> {c.partyAbbr}
      </div>
      <div className="text-sm font-extrabold text-navy-950 tnum">{fmtPercent(c.percent)} · {fmtNumber(c.votes)}</div>
    </div>
  )
}

export function VoteShareDonut({ results, total }: { results: CandidateResult[]; total: number }) {
  const data = results.filter((r) => r.votes > 0)
  if (!data.length) {
    return (
      <div className="flex h-60 flex-col items-center justify-center text-center">
        <div className="text-2xl font-extrabold text-navy-950 tnum">{fmtNumber(total)}</div>
        <div className="text-xs font-medium text-ink-400">no votes counted yet</div>
      </div>
    )
  }
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="votes" nameKey="partyAbbr" innerRadius={70} outerRadius={104} paddingAngle={2} stroke="none">
            {data.map((c) => (
              <Cell key={c.id} fill={c.color} />
            ))}
          </Pie>
          <Tooltip content={<DonutTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-extrabold text-navy-950 tnum">{fmtNumber(total)}</div>
        <div className="text-xs font-medium text-ink-400">total ballots</div>
      </div>
    </div>
  )
}
