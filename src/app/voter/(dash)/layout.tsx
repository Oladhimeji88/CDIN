'use client'

import type { ReactNode } from 'react'
import { Home, BarChart3, UserCircle } from 'lucide-react'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { NavItem } from '@/components/layout/DashboardLayout'

const nav: NavItem[] = [
  { href: '/voter', label: 'Home', icon: Home },
  { href: '/voter/results', label: 'Live Results', icon: BarChart3 },
  { href: '/voter/profile', label: 'Profile', icon: UserCircle },
]

export default function VoterDashLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="voter">
      <DashboardLayout nav={nav} roleLabel="Voter">
        {children}
      </DashboardLayout>
    </RoleGuard>
  )
}
