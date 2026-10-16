'use client'

import { useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { useSession } from '@/store/useSession'
import type { Officer, PollingUnit, Voter } from '@/store/types'

export interface OfficerContext {
  officer: Officer | undefined
  unit: PollingUnit | undefined
  unitVoters: Voter[]
  counts: { awaiting: number; verified: number; voted: number; total: number }
}

export function useOfficerContext(): OfficerContext {
  const refId = useSession((s) => s.user?.refId)
  const officers = useStore((s) => s.officers)
  const units = useStore((s) => s.pollingUnits)
  const voters = useStore((s) => s.voters)

  return useMemo(() => {
    const officer = officers.find((o) => o.id === refId) ?? officers[0]
    const unit = units.find((u) => u.id === officer?.pollingUnitId) ?? units[0]
    const unitVoters = voters.filter((v) => v.pollingUnitId === unit?.id)
    const counts = {
      awaiting: unitVoters.filter((v) => v.status === 'registered').length,
      verified: unitVoters.filter((v) => v.status === 'verified').length,
      voted: unitVoters.filter((v) => v.status === 'voted').length,
      total: unitVoters.length,
    }
    return { officer, unit, unitVoters, counts }
  }, [refId, officers, units, voters])
}
