'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/store/useSession'
import { useHydrated } from '@/store/useHydrated'
import type { Role } from '@/store/types'
import { SplashLoader } from './SplashLoader'

/** Guards a dashboard area: waits for hydration, then enforces the role. */
export function RoleGuard({ role, children }: { role: Role; children: ReactNode }) {
  const hydrated = useHydrated()
  const user = useSession((s) => s.user)
  const router = useRouter()

  useEffect(() => {
    if (hydrated && (!user || user.role !== role)) {
      router.replace('/')
    }
  }, [hydrated, user, role, router])

  if (!hydrated) return <SplashLoader />
  if (!user || user.role !== role) return <SplashLoader label="Redirecting…" />

  return <>{children}</>
}
