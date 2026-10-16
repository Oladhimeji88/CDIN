'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Users } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input, Select, Textarea, Label, FieldGroup } from '@/components/ui/Field'
import { SectionHeading, EmptyState } from '@/components/ui/Misc'
import { cn } from '@/lib/cn'
import { fmtNumber } from '@/lib/format'
import { staggerContainer, fadeUp } from '@/lib/motion'
import { useStore } from '@/store/useStore'
import { useResults } from '@/store/selectors'

const COLORS = ['#0a8754', '#2f6bf6', '#e0463c', '#7c5cfc', '#d99008', '#0ea5e9', '#db2777', '#475569']

export default function SuperAdminCandidates() {
  const candidates = useStore((s) => s.candidates)
  const elections = useStore((s) => s.elections)
  const addCandidate = useStore((s) => s.addCandidate)
  const removeCandidate = useStore((s) => s.removeCandidate)
  const activeElection = useStore((s) => s.activeElection())
  const results = useResults(activeElection?.id ?? '')

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    party: '',
    partyAbbr: '',
    color: COLORS[0],
    manifesto: '',
    electionId: activeElection?.id ?? elections[0]?.id ?? '',
  })

  const votesFor = (id: string) => results.find((r) => r.id === id)?.votes ?? 0

  const submit = () => {
    if (!form.name.trim() || !form.partyAbbr.trim()) return
    addCandidate({
      name: form.name.trim(),
      party: form.party.trim() || form.partyAbbr.trim(),
      partyAbbr: form.partyAbbr.trim().toUpperCase().slice(0, 5),
      color: form.color,
      manifesto: form.manifesto.trim() || 'No manifesto provided.',
      electionId: form.electionId,
    })
    setForm({ name: '', party: '', partyAbbr: '', color: COLORS[0], manifesto: '', electionId: form.electionId })
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Configuration"
        title="Candidates"
        description="Register and manage candidates. New candidates are written to the ledger immediately."
        action={<Button onClick={() => setOpen(true)} iconLeft={<Plus className="h-4 w-4" />}>Add candidate</Button>}
      />

      {candidates.length === 0 ? (
        <EmptyState icon={<Users className="h-7 w-7" />} title="No candidates yet" description="Register the first candidate to begin." action={<Button onClick={() => setOpen(true)} iconLeft={<Plus className="h-4 w-4" />}>Add candidate</Button>} />
      ) : (
        <motion.div variants={staggerContainer(0.05)} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {candidates.map((c) => (
            <motion.div key={c.id} variants={fadeUp}>
              <Card className="flex h-full flex-col">
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-extrabold text-white" style={{ background: c.color }}>
                    {c.partyAbbr}
                  </span>
                  <button
                    onClick={() => removeCandidate(c.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-danger-soft hover:text-danger"
                    aria-label="Remove candidate"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 text-base font-bold text-navy-950">{c.name}</div>
                <div className="text-xs text-ink-500">{c.party}</div>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-ink-500">{c.manifesto}</p>
                <div className="mt-4 border-t border-ink-100 pt-3 text-sm">
                  <span className="font-extrabold text-navy-950 tnum">{fmtNumber(votesFor(c.id))}</span>
                  <span className="ml-1.5 text-xs text-ink-400">votes recorded</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Register candidate"
        description="Add a candidate to an election."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={!form.name.trim() || !form.partyAbbr.trim()} iconLeft={<Plus className="h-4 w-4" />}>Register</Button>
          </>
        }
      >
        <div className="space-y-4">
          <FieldGroup>
            <Label htmlFor="cand-name">Full name</Label>
            <Input id="cand-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Amara Okeke" />
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup>
              <Label htmlFor="cand-party">Party</Label>
              <Input id="cand-party" value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} placeholder="Party name" />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="cand-abbr">Abbreviation</Label>
              <Input id="cand-abbr" value={form.partyAbbr} onChange={(e) => setForm({ ...form, partyAbbr: e.target.value })} placeholder="e.g. APC" maxLength={5} />
            </FieldGroup>
          </div>
          <FieldGroup>
            <Label htmlFor="cand-election">Election</Label>
            <Select id="cand-election" value={form.electionId} onChange={(e) => setForm({ ...form, electionId: e.target.value })}>
              {elections.map((el) => (
                <option key={el.id} value={el.id}>{el.title}</option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label>Party colour</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((col) => (
                <button
                  key={col}
                  onClick={() => setForm({ ...form, color: col })}
                  className={cn('h-9 w-9 rounded-lg ring-2 ring-offset-2 transition-all', form.color === col ? 'ring-navy-950' : 'ring-transparent')}
                  style={{ background: col }}
                  aria-label={`Colour ${col}`}
                />
              ))}
            </div>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="cand-manifesto" hint="Optional">Manifesto</Label>
            <Textarea id="cand-manifesto" value={form.manifesto} onChange={(e) => setForm({ ...form, manifesto: e.target.value })} placeholder="Key policy priorities…" />
          </FieldGroup>
        </div>
      </Modal>
    </div>
  )
}
