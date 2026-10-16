'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Role, SessionUser } from './types'

interface SessionState {
  user: SessionUser | null
  login: (user: SessionUser) => void
  logout: () => void
}

export const ROLE_HOME: Record<Role, string> = {
  voter: '/vote',
  officer: '/officer',
  admin: '/admin',
  superadmin: '/super-admin',
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'cdin-session-v1',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
)
