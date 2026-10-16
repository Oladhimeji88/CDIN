'use client'

import { useRouter } from 'next/navigation'
import { SectionHeading } from '@/components/ui/Misc'
import { ProfileContent } from '@/components/voter/ProfileContent'
import { useSession } from '@/store/useSession'

export default function VoterProfilePage() {
  const router = useRouter()
  const refId = useSession((s) => s.user?.refId)
  const logout = useSession((s) => s.logout)

  const onLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Account" title="My profile" description="Your voter card and details. Only your photo can be changed." />
      {refId && <ProfileContent voterId={refId} onLogout={onLogout} />}
    </div>
  )
}
