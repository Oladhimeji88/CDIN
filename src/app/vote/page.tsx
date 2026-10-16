'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { VoterShell } from '@/components/voter/VoterShell'
import { SystemEntryStep } from '@/components/voter/SystemEntryStep'
import { IdentityStep } from '@/components/voter/IdentityStep'
import { CredentialStep } from '@/components/voter/CredentialStep'
import { BallotStep } from '@/components/voter/BallotStep'
import { ConfirmStep } from '@/components/voter/ConfirmStep'
import { ProcessingStep } from '@/components/voter/ProcessingStep'
import { ReceiptStep } from '@/components/voter/ReceiptStep'
import { LiveResultsStep } from '@/components/voter/LiveResultsStep'
import { useStore } from '@/store/useStore'
import type { VoteReceipt } from '@/store/useStore'
import { useSession } from '@/store/useSession'

type Step =
  | 'entry'
  | 'identity'
  | 'credential'
  | 'ballot'
  | 'confirm'
  | 'processing'
  | 'receipt'
  | 'results'

const SHELL_PHASE: Partial<Record<Step, 'Verify' | 'Vote' | 'Receipt'>> = {
  identity: 'Verify',
  credential: 'Verify',
  ballot: 'Vote',
  confirm: 'Vote',
  receipt: 'Receipt',
  results: 'Receipt',
}

function VoteFlow() {
  const router = useRouter()
  const sessionVin = useSession((s) => s.user?.refId)
  const verifyVoter = useStore((s) => s.verifyVoter)
  const castVote = useStore((s) => s.castVote)
  const voters = useStore((s) => s.voters)

  const [step, setStep] = useState<Step>('entry')
  const [voterId, setVoterId] = useState<string | null>(null)
  const [candidateId, setCandidateId] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<VoteReceipt | null>(null)

  const goDashboard = () => router.push('/voter')

  const handleEligible = (id: string) => {
    setVoterId(id)
    const v = voters.find((x) => x.id === id)
    // Accreditation: issuing the voting credential/token.
    if (v?.status === 'registered') verifyVoter(id, 'id_card')
    setStep('credential')
  }

  const handleConfirm = () => setStep('processing')

  const handleProcessingDone = () => {
    if (voterId && candidateId) {
      const r = castVote(voterId, candidateId)
      setReceipt(r)
    }
    setStep('receipt')
  }

  // ---- full-screen steps (no shell) ----
  if (step === 'entry') return <SystemEntryStep onStart={() => setStep('identity')} onProfile={() => router.push('/voter/profile')} />
  if (step === 'processing') return <ProcessingStep onDone={handleProcessingDone} />

  const phase = SHELL_PHASE[step] ?? 'Verify'

  return (
    <VoterShell current={phase}>
      {step === 'identity' && (
        <IdentityStep defaultVin={sessionVin} onEligible={handleEligible} onExit={goDashboard} />
      )}
      {step === 'credential' && voterId && (
        <CredentialStep voterId={voterId} onProceed={() => setStep('ballot')} />
      )}
      {step === 'ballot' && (
        <BallotStep
          onNext={(id) => {
            setCandidateId(id)
            setStep('confirm')
          }}
        />
      )}
      {step === 'confirm' && candidateId && (
        <ConfirmStep candidateId={candidateId} onConfirm={handleConfirm} onBack={() => setStep('ballot')} />
      )}
      {step === 'receipt' &&
        (receipt ? (
          <ReceiptStep receipt={receipt} onViewResults={() => setStep('results')} onFinish={goDashboard} />
        ) : (
          <div className="py-10 text-center text-sm text-ink-500">
            Your ballot was recorded.{' '}
            <button type="button" onClick={goDashboard} className="font-semibold text-civic-600">
              Go to dashboard
            </button>
          </div>
        ))}
      {step === 'results' && <LiveResultsStep onFinish={goDashboard} />}
    </VoterShell>
  )
}

export default function VotePage() {
  return (
    <RoleGuard role="voter">
      <VoteFlow />
    </RoleGuard>
  )
}
