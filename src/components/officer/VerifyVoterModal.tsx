'use client'

import { useState } from 'react'
import { Fingerprint, IdCard, QrCode, MapPin } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { Voter, VerificationMethod } from '@/store/types'
import { useStore } from '@/store/useStore'

const METHODS: { id: VerificationMethod; label: string; icon: typeof IdCard }[] = [
  { id: 'biometric', label: 'Biometric', icon: Fingerprint },
  { id: 'id_card', label: 'ID Card', icon: IdCard },
  { id: 'qr_code', label: 'QR Code', icon: QrCode },
]

export function VerifyVoterModal({ voter, onClose }: { voter: Voter | null; onClose: () => void }) {
  const unit = useStore((s) => s.unitFor(voter?.pollingUnitId ?? null))
  const verifyVoter = useStore((s) => s.verifyVoter)
  const [method, setMethod] = useState<VerificationMethod>('biometric')

  const confirm = () => {
    if (voter) verifyVoter(voter.id, method)
    onClose()
  }

  return (
    <Modal
      open={!!voter}
      onClose={onClose}
      title="Verify voter"
      description="Authenticate the voter against the registry before they cast a ballot."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={confirm} iconLeft={<Fingerprint className="h-4 w-4" />}>
            Confirm verification
          </Button>
        </>
      }
    >
      {voter && (
        <div>
          <div className="rounded-2xl border border-ink-200 bg-ink-50 p-4">
            <div className="text-base font-bold text-navy-950">{voter.name}</div>
            <div className="font-mono text-sm text-ink-500">{voter.id}</div>
            <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-500">
              <MapPin className="h-4 w-4" /> {unit?.name} · {unit?.code}
            </div>
          </div>
          <div className="mb-2 mt-5 text-sm font-semibold text-navy-800">Verification method</div>
          <div className="grid grid-cols-3 gap-3">
            {METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-3 transition-all',
                  method === m.id ? 'border-civic-400 bg-civic-50 ring-2 ring-civic-100' : 'border-ink-200 hover:border-civic-300',
                )}
              >
                <m.icon className={cn('h-5 w-5', method === m.id ? 'text-civic-600' : 'text-ink-400')} />
                <span className={cn('text-xs font-semibold', method === m.id ? 'text-civic-700' : 'text-ink-500')}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}
