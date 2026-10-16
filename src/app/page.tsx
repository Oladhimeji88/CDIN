'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Vote, UserCheck, BarChart3, ShieldHalf, ArrowRight, Boxes } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { PersonCircle } from '@/components/ui/PersonCircle'
import { cn } from '@/lib/cn'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { useSession, ROLE_HOME } from '@/store/useSession'
import { useStore } from '@/store/useStore'
import { useHydrated } from '@/store/useHydrated'
import type { Role } from '@/store/types'

interface RoleCard {
  role: Role
  icon: typeof Vote
  title: string
  desc: string
}

const ROLES: RoleCard[] = [
  { role: 'voter', icon: Vote, title: 'Voter', desc: 'Verify your identity and cast a secure, encrypted ballot.' },
  { role: 'officer', icon: UserCheck, title: 'Verification Officer', desc: 'Authenticate voters and manage polling-unit activity.' },
  { role: 'admin', icon: BarChart3, title: 'Election Admin', desc: 'Monitor live results, the ledger and fraud analytics.' },
  { role: 'superadmin', icon: ShieldHalf, title: 'Super Admin', desc: 'Configure elections, candidates, officers and units.' },
]

export default function LandingPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const login = useSession((s) => s.login)
  const officers = useStore((s) => s.officers)
  const [pending, setPending] = useState<Role | null>(null)

  const enter = (role: Role) => {
    // Voters sign in to their own dashboard.
    if (role === 'voter') {
      setPending(role)
      setTimeout(() => router.push('/voter/login'), 150)
      return
    }
    setPending(role)
    let name = 'System Owner'
    let refId = 'CDIN-ROOT'
    if (role === 'officer') {
      const ofc = officers.find((o) => o.active) ?? officers[0]
      name = ofc?.name ?? 'Verification Officer'
      refId = ofc?.id ?? 'OFFICER'
    } else if (role === 'admin') {
      name = 'Election Admin'
      refId = 'EC-ADMIN-01'
    }
    login({ role, name, refId })
    setTimeout(() => router.push(ROLE_HOME[role]), 150)
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[minmax(0,36%)_minmax(0,64%)]">
      {/* ---- Brand panel (the 30% navy) ---- */}
      <section className="relative flex min-h-[60vh] flex-col justify-between overflow-hidden bg-navy-950 px-6 py-8 text-white sm:px-10 lg:min-h-dvh lg:py-12">
        <div className="relative z-10 flex items-center justify-between">
          <Logo tone="light" />
          <span className="rounded-full border border-navy-700 px-3 py-1 text-[11px] font-semibold text-navy-200">
            v1.0 · Demo
          </span>
        </div>

        <motion.div
          variants={staggerContainer(0.08, 0.1)}
          initial="hidden"
          animate="show"
          className="relative z-10 flex max-w-xl flex-col items-center py-10 text-center lg:items-start lg:py-0 lg:text-left"
        >
          <motion.div variants={fadeUp} className="mb-5 inline-flex items-center gap-2 rounded-full border border-navy-700 bg-navy-950/50 px-3 py-1.5 text-xs font-semibold text-civic-200">
            <span className="h-1.5 w-1.5 rounded-full bg-civic-400" />
            Civic Integrity Blockchain Voting
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-balance text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl">
            Every vote, independently verifiable.
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-5 max-w-md text-pretty text-base leading-relaxed text-navy-100">
            A citizen-owned cryptographic verification layer that makes elections
            transparent, tamper-proof and auditable — without exposing voter identity.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
            {['/people/1.png', '/people/2.png', '/people/3.png'].map((src, i) => (
              <PersonCircle key={src} src={src} alt={`Nigerian voter ${i + 1}`} />
            ))}
          </motion.div>
        </motion.div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-navy-300">
          <div>
            <div className="text-lg font-extrabold text-white tnum">2,418</div>
            blocks linked
          </div>
          <div className="h-8 w-px bg-navy-800" />
          <div>
            <div className="text-lg font-extrabold text-white tnum">100%</div>
            chain integrity
          </div>
          <div className="h-8 w-px bg-navy-800" />
          <div>
            <div className="text-lg font-extrabold text-white tnum">8</div>
            regions live
          </div>
        </div>
      </section>

      {/* ---- Access panel (the 60% canvas) ---- */}
      <section className="flex flex-col justify-center bg-ink-50 px-6 py-12 sm:px-8 lg:px-10">
        <motion.div
          variants={staggerContainer(0.07, 0.05)}
          initial="hidden"
          animate="show"
          className="mx-auto w-full max-w-3xl"
        >
          <motion.div variants={fadeUp}>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-civic-600">
              Choose your access
            </div>
            <h2 className="mt-2 text-2xl font-bold text-navy-950">Enter the workspace</h2>
            <p className="mt-1 text-sm text-ink-500">
              Select a role to explore the connected system. This is a demonstration
              environment — every action writes to a shared, live ledger.
            </p>
          </motion.div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {ROLES.map((r) => (
              <motion.button
                key={r.role}
                variants={fadeUp}
                disabled={!hydrated || pending !== null}
                onClick={() => enter(r.role)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'group flex flex-col items-start rounded-2xl border border-ink-200 bg-white p-5 text-left shadow-[var(--shadow-soft)] transition-all hover:border-civic-300 hover:shadow-[var(--shadow-lift)] disabled:opacity-60',
                  pending === r.role && 'border-civic-400 ring-4 ring-civic-100',
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-civic-600 text-white">
                    <r.icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-ink-300 transition-all group-hover:translate-x-1 group-hover:text-civic-600" />
                </div>
                <div className="mt-4 text-base font-bold text-navy-950">{r.title}</div>
                <div className="mt-1 text-[13px] leading-relaxed text-ink-500">{r.desc}</div>
              </motion.button>
            ))}
          </div>

          <motion.div variants={fadeUp} className="mt-7 flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-700">
              <Boxes className="h-5 w-5" />
            </div>
            <p className="text-[13px] leading-relaxed text-ink-500">
              <span className="font-semibold text-navy-800">Installable.</span> Add CDIN
              to your home screen for an app-like, offline-ready experience.
            </p>
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}
