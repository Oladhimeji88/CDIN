'use client'

import { useMemo } from 'react'
import { useStore } from './useStore'
import type { CandidateResult, UnitState, NationalTotals } from './useStore'

/**
 * Stable derived-state hooks.
 *
 * Store methods like results()/unitStates()/nationalTotals() build a NEW
 * array/object on every call. Selecting them directly with
 * useStore(s => s.results(id)) returns an unstable snapshot, which makes
 * React's useSyncExternalStore loop ("getSnapshot should be cached").
 * These hooks select the stable function + the raw state deps and memoise
 * the result instead.
 */

export function useResults(electionId: string): CandidateResult[] {
  const fn = useStore((s) => s.results)
  const candidates = useStore((s) => s.candidates)
  const unitTallies = useStore((s) => s.unitTallies)
  return useMemo(() => fn(electionId), [fn, electionId, candidates, unitTallies])
}

export function useUnitStates(): UnitState[] {
  const fn = useStore((s) => s.unitStates)
  const pollingUnits = useStore((s) => s.pollingUnits)
  const unitTallies = useStore((s) => s.unitTallies)
  const candidates = useStore((s) => s.candidates)
  return useMemo(() => fn(), [fn, pollingUnits, unitTallies, candidates])
}

export function useNationalTotals(): NationalTotals {
  const fn = useStore((s) => s.nationalTotals)
  const unitTallies = useStore((s) => s.unitTallies)
  return useMemo(() => fn(), [fn, unitTallies])
}
