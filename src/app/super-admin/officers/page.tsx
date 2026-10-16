'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, UserCog, MapPin, Mail, Power } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Label, FieldGroup } from '@/components/ui/Field'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { SectionHeading } from '@/components/ui/Misc'
import { staggerContainer, fadeUp } from '@/lib/motion'
import { useStore } from '@/store/useStore'

export default function SuperAdminOfficers() {
  const officers = useStore((s) => s.officers)
  const units = useStore((s) => s.pollingUnits)
  const addOfficer = useStore((s) => s.addOfficer)
  const toggleOfficer = useStore((s) => s.toggleOfficer)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', pollingUnitId: units[0]?.id ?? '' })

  const unitName = (id: string | null) => units.find((u) => u.id === id)?.code ?? 'Unassigned'

  const submit = () => {
    if (!form.name.trim()) return
    addOfficer({
      name: form.name.trim(),
      email: form.email.trim() || `${form.name.trim().split(' ')[0].toLowerCase()}.officer@cdin.gov`,
      pollingUnitId: form.pollingUnitId || null,
    })
    setForm({ name: '', email: '', pollingUnitId: units[0]?.id ?? '' })
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Configuration"
        title="Verification officers"
        description="Onboard officers and assign them to polling units. Suspended officers cannot verify voters."
        action={<Button onClick={() => setOpen(true)} iconLeft={<Plus className="h-4 w-4" />}>Add officer</Button>}
      />

      <motion.div variants={staggerContainer(0.05)} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {officers.map((o) => (
          <motion.div key={o.id} variants={fadeUp}>
            <Card className="flex h-full flex-col">
              <div className="flex items-start gap-3">
                <Avatar name={o.name} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-bold text-navy-950">{o.name}</div>
                  <div className="flex items-center gap-1 truncate text-xs text-ink-500">
                    <Mail className="h-3 w-3 shrink-0" /> {o.email}
                  </div>
                </div>
                <Badge tone={o.active ? 'positive' : 'neutral'} dot>{o.active ? 'Active' : 'Suspended'}</Badge>
              </div>
              <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-ink-50 px-3 py-2 text-sm">
                <MapPin className="h-4 w-4 text-ink-400" />
                <span className="font-semibold text-navy-800">{unitName(o.pollingUnitId)}</span>
              </div>
              <div className="mt-4 flex-1" />
              <Button
                variant={o.active ? 'secondary' : 'primary'}
                size="sm"
                fullWidth
                onClick={() => toggleOfficer(o.id)}
                iconLeft={<Power className="h-4 w-4" />}
              >
                {o.active ? 'Suspend' : 'Activate'}
              </Button>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Onboard officer"
        description="Add a verification officer to the system."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={!form.name.trim()} iconLeft={<Plus className="h-4 w-4" />}>Onboard</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FieldGroup>
            <Label htmlFor="of-name">Full name</Label>
            <Input id="of-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tunde Afolabi" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="of-email" hint="Optional">Email</Label>
            <Input id="of-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="officer@cdin.gov" />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="of-unit">Assigned polling unit</Label>
            <Select id="of-unit" value={form.pollingUnitId} onChange={(e) => setForm({ ...form, pollingUnitId: e.target.value })}>
              <option value="">Unassigned</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.code} · {u.name}</option>
              ))}
            </Select>
          </FieldGroup>
        </div>
      </Modal>
    </div>
  )
}
