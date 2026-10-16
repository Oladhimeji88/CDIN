'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Vote, Users, CalendarDays } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Label, FieldGroup } from '@/components/ui/Field'
import { ElectionStatusBadge } from '@/components/ui/Badge'
import { SectionHeading } from '@/components/ui/Misc'
import { fmtDate } from '@/lib/format'
import { staggerContainer, fadeUp } from '@/lib/motion'
import { useStore } from '@/store/useStore'
import type { ElectionStatus } from '@/store/types'

const TYPES = ['Presidential', 'Gubernatorial', 'Senatorial', 'Legislative', 'Local Government', 'Referendum']
const STATUSES: ElectionStatus[] = ['draft', 'scheduled', 'active', 'closed']

export default function SuperAdminElections() {
  const elections = useStore((s) => s.elections)
  const candidates = useStore((s) => s.candidates)
  const addElection = useStore((s) => s.addElection)
  const setElectionStatus = useStore((s) => s.setElectionStatus)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    type: TYPES[0],
    region: 'National',
    startsAt: '',
    endsAt: '',
    status: 'scheduled' as ElectionStatus,
  })

  const submit = () => {
    if (!form.title.trim()) return
    const now = Date.now()
    addElection({
      title: form.title.trim(),
      type: form.type,
      region: form.region.trim() || 'National',
      status: form.status,
      startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : new Date(now).toISOString(),
      endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : new Date(now + 86400000).toISOString(),
    })
    setForm({ title: '', type: TYPES[0], region: 'National', startsAt: '', endsAt: '', status: 'scheduled' })
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Configuration"
        title="Elections"
        description="Create elections and control their lifecycle. Status changes are recorded on the ledger."
        action={<Button onClick={() => setOpen(true)} iconLeft={<Plus className="h-4 w-4" />}>New election</Button>}
      />

      <motion.div variants={staggerContainer(0.06)} initial="hidden" animate="show" className="space-y-4">
        {elections.map((el) => {
          const count = candidates.filter((c) => c.electionId === el.id).length
          return (
            <motion.div key={el.id} variants={fadeUp}>
              <Card>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-civic-600 text-white">
                      <Vote className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-navy-950">{el.title}</h3>
                        <ElectionStatusBadge status={el.status} />
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                        <span>{el.type} · {el.region}</span>
                        <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {count} candidates</span>
                        <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {fmtDate(el.startsAt)} → {fmtDate(el.endsAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 lg:w-56">
                    <Label htmlFor={`st-${el.id}`}>{''}</Label>
                    <Select id={`st-${el.id}`} value={el.status} onChange={(e) => setElectionStatus(el.id, e.target.value as ElectionStatus)} className="capitalize">
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </Select>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create election"
        description="Define a new election event."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={!form.title.trim()} iconLeft={<Plus className="h-4 w-4" />}>Create</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FieldGroup>
            <Label htmlFor="el-title">Title</Label>
            <Input id="el-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. 2027 Gubernatorial Election" />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Label htmlFor="el-type">Type</Label>
              <Select id="el-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="el-region">Region</Label>
              <Input id="el-region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="National / State" />
            </FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Label htmlFor="el-start">Starts</Label>
              <Input id="el-start" type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="el-end">Ends</Label>
              <Input id="el-end" type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
            </FieldGroup>
          </div>
          <FieldGroup>
            <Label htmlFor="el-status">Initial status</Label>
            <Select id="el-status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ElectionStatus })} className="capitalize">
              {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </Select>
          </FieldGroup>
        </div>
      </Modal>
    </div>
  )
}
