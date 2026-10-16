'use client'

import { useEffect, useState } from 'react'
import { useStore } from './useStore'
import { useSession } from './useSession'
import { supabaseConfigured } from '@/lib/supabase'
import { hydrateFromSupabase } from './sb'

/**
 * Prepares client state once mounted:
 *  - always rehydrate the (local) session store
 *  - if Supabase is configured, load all data from it (system of record);
 *    otherwise fall back to the localStorage-persisted store.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await useSession.persist.rehydrate()
      if (supabaseConfigured) {
        const ok = await hydrateFromSupabase()
        if (!ok) await useStore.persist.rehydrate() // fallback to cache if fetch fails
      } else {
        await useStore.persist.rehydrate()
      }
      if (!cancelled) setHydrated(true)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return hydrated
}
