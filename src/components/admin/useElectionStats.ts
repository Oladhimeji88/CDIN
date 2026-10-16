'use client'

import { useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { useResults } from '@/store/selectors'

export function useElectionStats() {
  const election = useStore((s) => s.activeElection())
  const results = useResults(election?.id ?? '')
  const totalVotesFn = useStore((s) => s.totalVotes)
  const unitTallies = useStore((s) => s.unitTallies)
  const totalVotes = useMemo(() => totalVotesFn(election?.id ?? ''), [totalVotesFn, election, unitTallies])
  const regionStats = useStore((s) => s.regionStats)
  const hourlyTurnout = useStore((s) => s.hourlyTurnout)
  const alerts = useStore((s) => s.alerts)
  const blocks = useStore((s) => s.blocks)

  return useMemo(() => {
    const registered = Object.values(regionStats).reduce((s, r) => s + r.registered, 0)
    const voted = Object.values(regionStats).reduce((s, r) => s + r.voted, 0)
    const turnout = registered ? (voted / registered) * 100 : 0
    const openAlerts = alerts.filter((a) => a.status === 'open' || a.status === 'reviewing').length
    const regions = Object.entries(regionStats)
      .map(([region, r]) => ({
        region,
        registered: r.registered,
        voted: r.voted,
        turnout: r.registered ? (r.voted / r.registered) * 100 : 0,
      }))
      .sort((a, b) => b.turnout - a.turnout)

    return {
      election,
      results,
      totalVotes,
      registered,
      voted,
      turnout,
      openAlerts,
      regions,
      hourlyTurnout,
      blockCount: blocks.length,
      leader: results[0],
    }
  }, [election, results, totalVotes, regionStats, hourlyTurnout, alerts, blocks])
}
