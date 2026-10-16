'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { IdCard, ArrowRight, ArrowLeft, UserPlus } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { useStore } from '@/store/useStore'
import { useSession } from '@/store/useSession'
import { useHydrated } from '@/store/useHydrated'

export default function VoterLoginPage() {
  const router = useRouter()
  const hydrated = useHydrated()
  const voters = useStore((s) => s.voters)
  const registerSessionVoter = useStore((s) => s.registerSessionVoter)
  const login = useSession((s) => s.login)
  const [vin, setVin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const enter = (id: string, name: string) => {
    login({ role: 'voter', name, refId: id })
    router.push('/voter')
  }

  const submit = () => {
    setError(null)
    setBusy(true)
    const v = voters.find((x) => x.id.toLowerCase() === vin.trim().toLowerCase())
    setBusy(false)
    if (!v) {
      setError('That Voter ID was not found in the register.')
      return
    }
    enter(v.id, v.name)
  }

  const demo = () => {
    const v = registerSessionVoter('Demo Voter')
    enter(v.id, v.name)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-navy-950 bg-civic-grid px-5 py-10">
      <motion.div variants={staggerContainer(0.08, 0.05)} initial="hidden" animate="show" className="w-full max-w-md">
        <motion.button
          variants={fadeUp}
          onClick={() => router.push('/')}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-200 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </motion.button>

        <motion.div variants={fadeUp} className="mb-6">
          <Logo tone="light" />
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-2xl border border-navy-800 bg-navy-900/50 p-7">
          <h1 className="text-2xl font-extrabold text-white">Voter sign in</h1>
          <p className="mt-1 text-sm text-navy-200">Enter your Voter ID (VIN) to access your dashboard.</p>

          <label htmlFor="vin" className="mb-1.5 mt-6 flex items-center gap-2 text-sm font-semibold text-navy-100">
            <IdCard className="h-4 w-4 text-civic-300" /> Voter ID
          </label>
          <Input
            id="vin"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && vin.trim() && submit()}
            placeholder="VIN-XXXXXXXX"
            className="font-mono"
            autoComplete="off"
          />
          {error && <p className="mt-2 text-xs font-medium text-danger">{error}</p>}

          <Button onClick={submit} disabled={!vin.trim() || !hydrated || busy} fullWidth size="lg" className="mt-5" iconRight={<ArrowRight className="h-5 w-5" />}>
            Sign in
          </Button>

          <div className="my-4 flex items-center gap-3 text-xs text-navy-400">
            <span className="h-px flex-1 bg-navy-800" /> or <span className="h-px flex-1 bg-navy-800" />
          </div>

          <Button onClick={demo} disabled={!hydrated} variant="secondary" fullWidth iconLeft={<UserPlus className="h-4 w-4" />}>
            Continue as a demo voter
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
