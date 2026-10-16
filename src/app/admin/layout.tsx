'use client'

import type { ReactNode } from 'react'
import { LayoutDashboard, BarChart3, Network, Boxes, ShieldAlert, ScrollText } from 'lucide-react'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import type { NavItem } from '@/components/layout/DashboardLayout'

const nav: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/results', label: 'Results', icon: BarChart3 },
  { href: '/admin/aggregation', label: 'Aggregation', icon: Network },
  { href: '/admin/ledger', label: 'Ledger', icon: Boxes },
  { href: '/admin/fraud', label: 'Fraud', icon: ShieldAlert },
  { href: '/admin/audit', label: 'Audit', icon: ScrollText },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleGuard role="admin">
      <DashboardLayout nav={nav} roleLabel="Election Administrator">
        {children}
      </DashboardLayout>
    </RoleGuard>
  )
}
