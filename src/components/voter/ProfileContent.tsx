'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Camera, Loader2, LogOut, Mail, Phone, Fingerprint, MapPin,
  IdCard, KeyRound, Eye, EyeOff,
} from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { VoterStatusBadge } from '@/components/ui/Badge'
import { KeyValue, Divider } from '@/components/ui/Misc'
import { fadeUp, staggerContainer } from '@/lib/motion'
import { anonToken } from '@/lib/hash'
import { fileToResizedDataUrl } from '@/lib/image'
import { useStore } from '@/store/useStore'

/** Voter profile cards. Only the photo is editable. */
export function ProfileContent({ voterId, onLogout }: { voterId: string; onLogout: () => void }) {
  const voter = useStore((s) => s.voters.find((v) => v.id === voterId))
  const unit = useStore((s) => s.unitFor(voter?.pollingUnitId ?? null))
  const election = useStore((s) => s.activeElection())
  const updateVoterPhoto = useStore((s) => s.updateVoterPhoto)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reveal, setReveal] = useState(false)

  if (!voter) {
    return <div className="py-10 text-center text-sm text-ink-500">No voter profile found.</div>
  }

  const credential = election ? anonToken(voter.id, election.id) : ''

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      updateVoterPhoto(voter.id, await fileToResizedDataUrl(file))
    } catch {
      setError('Could not upload that image. Please choose a valid image file.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div variants={staggerContainer(0.07)} initial="hidden" animate="show" className="mx-auto max-w-2xl space-y-5">
      <motion.div variants={fadeUp}>
        <Card className="flex flex-col items-center text-center">
          <div className="relative">
            {voter.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={voter.photoUrl} alt={voter.name} className="h-24 w-24 rounded-full object-cover ring-4 ring-ink-100" />
            ) : (
              <Avatar name={voter.name} size={96} className="ring-4 ring-ink-100" />
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-civic-600 text-white shadow-[var(--shadow-lift)] transition-colors hover:bg-civic-700"
              aria-label="Upload photo"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-navy-950">{voter.name}</h2>
          <div className="mt-1 font-mono text-sm text-ink-500">{voter.id}</div>
          <div className="mt-3"><VoterStatusBadge status={voter.status} /></div>
          <p className="mt-3 text-xs text-ink-400">Tap the camera to upload a photo — only your image can be changed.</p>
          {error && <p className="mt-2 text-xs font-medium text-danger">{error}</p>}
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader title="Voting credential" subtitle="Anonymous, single-use" icon={<KeyRound className="h-5 w-5" />} />
          <div className="mt-4 flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-ink-50 px-3 py-2.5 font-mono text-sm text-navy-900">
              {reveal ? credential : '•'.repeat(20)}
            </code>
            <button
              type="button"
              onClick={() => setReveal((r) => !r)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 text-ink-500 transition-colors hover:bg-ink-100 hover:text-navy-900"
              aria-label={reveal ? 'Hide credential' : 'Show credential'}
            >
              {reveal ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-400">This credential cannot be reused and is never linked to your ballot choice.</p>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader title="Personal details" icon={<IdCard className="h-5 w-5" />} />
          <div className="mt-2">
            <KeyValue label={<span className="flex items-center gap-2"><Mail className="h-4 w-4 text-ink-400" /> Email</span>} value={voter.email} />
            <Divider />
            <KeyValue label={<span className="flex items-center gap-2"><Phone className="h-4 w-4 text-ink-400" /> Phone</span>} value={voter.phone} />
            <Divider />
            <KeyValue label={<span className="flex items-center gap-2"><Fingerprint className="h-4 w-4 text-ink-400" /> NIN</span>} value={<span className="font-mono">{voter.nin}</span>} />
            <Divider />
            <KeyValue label={<span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-ink-400" /> Address</span>} value={voter.address} />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
          <CardHeader title="Voter card" subtitle="Polling assignment" icon={<IdCard className="h-5 w-5" />} />
          <div className="mt-2">
            <KeyValue label="Voter ID (VIN)" value={<span className="font-mono">{voter.id}</span>} />
            <Divider />
            <KeyValue label="Polling unit" value={unit?.code ?? '—'} />
            <Divider />
            <KeyValue label="Unit name" value={unit?.name ?? '—'} />
            <Divider />
            <KeyValue label="Ward" value={unit?.ward ?? '—'} />
            <Divider />
            <KeyValue label="Region" value={voter.region} />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp}>
        <Button onClick={onLogout} variant="secondary" fullWidth size="lg" iconLeft={<LogOut className="h-5 w-5" />}>
          Log out
        </Button>
      </motion.div>
    </motion.div>
  )
}
