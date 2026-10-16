import { uid } from '@/lib/hash'
import type { FraudAlert, VoteRecord, PollingUnit } from './types'

/**
 * Lightweight anomaly engine standing in for the ML fraud-detection layer.
 * It inspects the live vote stream and flags suspicious velocity / cadence.
 * Pure + idempotent-ish: callers dedupe by checking existing open alerts.
 */

const VELOCITY_WINDOW_MS = 3 * 60_000 // 3 minutes
const VELOCITY_THRESHOLD = 4 // votes within the window at a single unit
const CADENCE_THRESHOLD = 6 // near-uniform consecutive votes

export interface ScanResult {
  alert: FraudAlert | null
}

export function scanForAnomalies(
  votes: VoteRecord[],
  units: PollingUnit[],
  existingAlerts: FraudAlert[],
): ScanResult {
  if (votes.length === 0) return { alert: null }

  const nowMs = Date.now()
  const recent = votes.filter(
    (v) => nowMs - new Date(v.timestamp).getTime() <= VELOCITY_WINDOW_MS,
  )

  // ---- Velocity spike per polling unit ----
  const byUnit = new Map<string, number>()
  for (const v of recent) byUnit.set(v.pollingUnitId, (byUnit.get(v.pollingUnitId) ?? 0) + 1)

  for (const [unitId, count] of byUnit) {
    if (count < VELOCITY_THRESHOLD) continue
    const unit = units.find((u) => u.id === unitId)
    if (!unit) continue
    const hasOpen = existingAlerts.some(
      (a) =>
        a.type === 'Turnout anomaly' &&
        a.scope.includes(unit.code) &&
        (a.status === 'open' || a.status === 'reviewing'),
    )
    if (hasOpen) continue

    const risk = Math.min(98, 60 + count * 6)
    return {
      alert: {
        id: uid('flt'),
        type: 'Turnout anomaly',
        title: `Vote spike detected at ${unit.name}`,
        description: `${count} encrypted votes were committed at ${unit.code} within a ${
          VELOCITY_WINDOW_MS / 60_000
        }-minute window — exceeding the expected velocity baseline. Pattern consistent with possible ballot stuffing.`,
        severity: count >= VELOCITY_THRESHOLD + 3 ? 'critical' : 'high',
        riskScore: risk,
        scope: `${unit.region} · ${unit.code}`,
        status: 'open',
        detectedAt: new Date().toISOString(),
        metric: `${count} votes / ${VELOCITY_WINDOW_MS / 60_000}min`,
      },
    }
  }

  // ---- Coordinated cadence (uniform inter-vote spacing) ----
  if (recent.length >= CADENCE_THRESHOLD) {
    const sorted = [...recent].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )
    const gaps: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      gaps.push(
        new Date(sorted[i].timestamp).getTime() -
          new Date(sorted[i - 1].timestamp).getTime(),
      )
    }
    const mean = gaps.reduce((s, g) => s + g, 0) / gaps.length
    const variance = gaps.reduce((s, g) => s + (g - mean) ** 2, 0) / gaps.length
    const std = Math.sqrt(variance) / 1000 // seconds
    const hasOpen = existingAlerts.some(
      (a) => a.type === 'Coordinated pattern' && a.status === 'open',
    )
    if (std < 2 && !hasOpen) {
      return {
        alert: {
          id: uid('flt'),
          type: 'Coordinated pattern',
          title: 'Near-uniform voting cadence flagged',
          description:
            'Recent votes were recorded at suspiciously regular intervals, suggesting automated or coordinated submission. Manual audit recommended.',
          severity: 'medium',
          riskScore: 52,
          scope: 'Multiple units',
          status: 'open',
          detectedAt: new Date().toISOString(),
          metric: `σ of inter-vote time = ${std.toFixed(1)}s`,
        },
      }
    }
  }

  return { alert: null }
}
