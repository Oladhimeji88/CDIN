'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { LogOut, ShieldCheck, Menu, X } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/cn'
import { useSession } from '@/store/useSession'
import { useStore } from '@/store/useStore'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface DashboardLayoutProps {
  nav: NavItem[]
  roleLabel: string
  children: ReactNode
}

export function DashboardLayout({ nav, roleLabel, children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useSession((s) => s.user)
  const logout = useSession((s) => s.logout)
  const ledgerValid = useStore((s) => s.ledgerValid())
  const blockCount = useStore((s) => s.blocks.length)
  const [mobileOpen, setMobileOpen] = useState(false)

  const active = nav.find((n) => pathname === n.href) ?? nav[0]

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-1 flex-col gap-1">
      {nav.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
              isActive ? 'bg-civic-600 text-white' : 'text-navy-200 hover:bg-navy-900 hover:text-white',
            )}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-dvh bg-ink-50">
      {/* ---- Desktop sidebar ---- */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-navy-900 bg-navy-950 p-4 lg:flex">
        <div className="px-2 py-3">
          <Logo tone="light" />
        </div>
        <div className="mt-2 mb-4 rounded-xl bg-navy-900/60 px-3 py-2.5">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-civic-300">Workspace</div>
          <div className="mt-0.5 text-sm font-semibold text-white">{roleLabel}</div>
        </div>
        <NavLinks />
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-navy-800 px-3 py-2.5">
            <ShieldCheck className={cn('h-4 w-4', ledgerValid ? 'text-positive' : 'text-danger')} />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white">
                {ledgerValid ? 'Ledger verified' : 'Ledger error'}
              </div>
              <div className="truncate text-[11px] text-navy-300 tnum">{blockCount} blocks linked</div>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-3 rounded-xl bg-navy-900/60 p-2.5">
              <Avatar name={user.name} size={36} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{user.name}</div>
                <div className="truncate text-[11px] text-navy-300">{user.refId}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-navy-300 transition-colors hover:bg-navy-800 hover:text-white"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ---- Main column ---- */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/85 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 text-navy-800 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-base font-bold text-navy-950 sm:text-lg">{active?.label}</h1>
                <p className="hidden text-xs text-ink-400 sm:block">CDIN · {roleLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 rounded-full bg-positive-soft px-3 py-1.5 text-xs font-bold text-positive sm:inline-flex">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-positive opacity-60 animate-pulse-ring" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-positive" />
                </span>
                Live election
              </span>
              <div className="lg:hidden">
                <Logo withText={false} size={32} />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">{children}</main>
      </div>

      {/* ---- Mobile bottom nav ---- */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-200 bg-white/95 backdrop-blur-md lg:hidden">
        <div className="flex items-stretch justify-around overflow-x-auto px-1 pb-[env(safe-area-inset-bottom)]">
          {nav.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex min-w-16 flex-1 flex-col items-center gap-0.5 py-2.5"
              >
                {isActive && (
                  <motion.span
                    layoutId="bottomnav-active"
                    className="absolute top-0 h-0.5 w-8 rounded-full bg-civic-600"
                  />
                )}
                <Icon className={cn('h-5 w-5', isActive ? 'text-civic-600' : 'text-ink-400')} />
                <span className={cn('text-[10px] font-semibold', isActive ? 'text-civic-700' : 'text-ink-400')}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* ---- Mobile drawer ---- */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-y-0 left-0 flex w-72 flex-col bg-navy-950 p-4"
            >
              <div className="flex items-center justify-between px-2 py-3">
                <Logo tone="light" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-300 hover:bg-navy-900 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-2 mb-4 rounded-xl bg-navy-900/60 px-3 py-2.5">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-civic-300">Workspace</div>
                <div className="mt-0.5 text-sm font-semibold text-white">{roleLabel}</div>
              </div>
              <NavLinks onNavigate={() => setMobileOpen(false)} />
              {user && (
                <button
                  onClick={handleLogout}
                  className="mt-4 flex items-center gap-2 rounded-xl border border-navy-800 px-3 py-2.5 text-sm font-semibold text-navy-200 hover:bg-navy-900 hover:text-white"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              )}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
