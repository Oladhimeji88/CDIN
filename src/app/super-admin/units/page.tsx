'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, MapPin, Search, UserCog } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Label, FieldGroup } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { SectionHeading, EmptyState } from '@/components/ui/Misc'
import { fmtNumber } from '@/lib/format'
import { staggerContainer, fadeUp } from '@/lib/motion'
import { useStore } from '@/store/useStore'

export default function SuperAdminUnits() {
  const units = useStore((s) => s.pollingUnits)
  const officers = useStore((s) => s.officers)
  const addPollingUnit = useStore((s) => s.addPollingUnit)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [form, setForm] = useState({ name: '', code: '', region: '', ward: '', registeredVoters: '1000' })

  const officerName = (id: string | null) => officers.find((o) => o.id === id)?.name ?? null

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return units
    return units.filter((u) => u.name.toLowerCase().includes(q) || u.code.toLowerCase().includes(q) || u.region.toLowerCase().includes(q))
  }, [units, query])

  const submit = () => {
    if (!form.name.trim() || !form.region.trim()) return
    addPollingUnit({
      name: form.name.trim(),
      code: form.code.trim() || `PU/${units.length + 1}`,
      region: form.region.trim(),
      ward: form.ward.trim() || 'Ward 1',
      registeredVoters: Math.max(0, parseInt(form.registeredVoters, 10) || 0),
    })
    setForm({ name: '', code: '', region: '', ward: '', registeredVoters: '1000' })
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Configuration"
        title="Polling units"
        description="Provision polling units across regions. Officers are assigned to units to verify voters."
        action={<Button onClick={() => setOpen(true)} iconLeft={<Plus className="h-4 w-4" />}>Add unit</Button>}
      />

      <Card padded={false}>
        <div className="border-b border-ink-100 p-5">
          <div className="sm:max-w-sm">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search code, name or region…" iconLeft={<Search className="h-4 w-4" />} />
          </div>
        </div>
        {rows.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<MapPin className="h-7 w-7" />} title="No polling units" description="Add a polling unit to get started." />
          </div>
        ) : (
          <motion.div variants={staggerContainer(0.03)} initial="hidden" animate="show" className="divide-y divide-ink-100">
            {rows.map((u) => (
              <motion.div key={u.id} variants={fadeUp} className="flex items-center gap-3 p-4 sm:px-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-navy-950">{u.name}</div>
                  <div className="truncate font-mono text-xs text-ink-500">{u.code} · {u.region} · {u.ward}</div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-bold text-navy-950 tnum">{fmtNumber(u.registeredVoters)}</div>
                  <div className="text-xs text-ink-400">registered</div>
                </div>
                {officerName(u.officerId) ? (
                  <Badge tone="civic" className="hidden md:inline-flex"><UserCog className="h-3 w-3" /> {officerName(u.officerId)}</Badge>
                ) : (
                  <Badge tone="neutral" className="hidden md:inline-flex">No officer</Badge>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add polling unit"
        description="Provision a new polling unit."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={!form.name.trim() || !form.region.trim()} iconLeft={<Plus className="h-4 w-4" />}>Add unit</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FieldGroup>
            <Label htmlFor="pu-name">Unit name</Label>
            <Input id="pu-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Lagos Ward 3 Unit" />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Label htmlFor="pu-code" hint="Optional">Code</Label>
              <Input id="pu-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="PU/09/001" />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="pu-ward" hint="Optional">Ward</Label>
              <Input id="pu-ward" value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} placeholder="Ward 3" />
            </FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Label htmlFor="pu-region">Region / State</Label>
              <Input id="pu-region" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="e.g. Lagos" />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="pu-reg">Registered voters</Label>
              <Input id="pu-reg" type="number" min={0} value={form.registeredVoters} onChange={(e) => setForm({ ...form, registeredVoters: e.target.value })} />
            </FieldGroup>
          </div>
        </div>
      </Modal>
    </div>
  )
}
