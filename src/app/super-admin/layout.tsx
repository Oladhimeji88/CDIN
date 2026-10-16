'use client'

import type { ReactNode } from 'react'
import { LayoutDashboard, Vote, Users, UserCog, MapPin } from 'lucide-react'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { NavItem } from '@/components/layout/DashboardLayout'

const nav: NavItem[] = [
  { href: '/super-admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/super-admin/elections', label: 'Elections', icon: Vote },
  { href: '/super-admin/candidates', label: 'Candidates', icon: Users },
  { href: '/super-admin/officers', label: 'Officers', icon: UserCog },
  { href: '/super-admin/units', label: 'Units', icon: MapPin },
]

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="superadmin">
      <DashboardLayout nav={nav} roleLabel="Super Administrator">
        {children}
      </DashboardLayout>
    </RoleGuard>
  )
}
