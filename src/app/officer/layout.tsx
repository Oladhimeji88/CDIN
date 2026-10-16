'use client'

import type { ReactNode } from 'react'
import { ScanLine, Users, Activity } from 'lucide-react'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { NavItem } from '@/components/layout/DashboardLayout'

const nav: NavItem[] = [
  { href: '/officer', label: 'Console', icon: ScanLine },
  { href: '/officer/roster', label: 'Roster', icon: Users },
  { href: '/officer/activity', label: 'Activity', icon: Activity },
]

export default function OfficerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="officer">
      <DashboardLayout nav={nav} roleLabel="Verification Officer">
        {children}
      </DashboardLayout>
    </RoleGuard>
  )
}
