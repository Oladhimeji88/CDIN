'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { sha256ish, uid, anonToken } from '@/lib/hash'
import { scanForAnomalies } from './fraud'
import { sb } from './sb'
import {
  ELECTION,
  CANDIDATES,
  POLLING_UNITS,
  OFFICERS,
  FRAUD_ALERTS,
  buildVoters,
  buildChain,
  buildAudit,
  buildUnitTallies,
  buildHourly,
  buildContact,
} from './seed'
import type {
  Election,
  Candidate,
  PollingUnit,
  Officer,
  Voter,
  Block,
  VoteRecord,
  FraudAlert,
  AuditEntry,
  UnitTally,
  VerificationMethod,
  AlertStatus,
  ElectionStatus,
} from './types'

export interface CandidateResult extends Candidate {
  votes: number
  percent: number
}

export interface VoteReceipt {
  vote: VoteRecord
  block: Block
  candidate: Candidate
}

export interface UnitState {
  unit: PollingUnit
  tally: UnitTally
  consistent: boolean
  leading: { candidate: Candidate; votes: number } | null
}

export interface NationalTotals {
  registered: number
  accredited: number
  cast: number
  encrypted: number
  acceptedCast: number
  totalUnits: number
  validatedUnits: number
  pendingUnits: number
  flaggedUnits: number
  consistent: boolean
}

interface StoreState {
  elections: Election[]
  candidates: Candidate[]
  pollingUnits: PollingUnit[]
  officers: Officer[]
  voters: Voter[]
  blocks: Block[]
  votes: VoteRecord[]
  unitTallies: Record<string, UnitTally>
  regionStats: Record<string, { registered: number; voted: number }>
  hourlyTurnout: { label: string; votes: number }[]
  alerts: FraudAlert[]
  audit: AuditEntry[]

  // ---- selectors ----
  activeElection: () => Election | undefined
  results: (electionId: string) => CandidateResult[]
  totalVotes: (electionId: string) => number
  unitFor: (id: string | null) => PollingUnit | undefined
  unitTallyFor: (id: string | null) => UnitTally | undefined
  unitStates: () => UnitState[]
  nationalTotals: () => NationalTotals
  ledgerValid: () => boolean

  // ---- voter / officer actions ----
  registerSessionVoter: (name: string, pollingUnitId?: string) => Voter
  updateVoterPhoto: (voterId: string, photoUrl: string) => void
  verifyVoter: (voterId: string, method: VerificationMethod) => void
  castVote: (voterId: string, candidateId: string) => VoteReceipt | null

  // ---- admin / superadmin actions ----
  setAlertStatus: (alertId: string, status: AlertStatus) => void
  setUnitValidation: (unitId: string, validation: UnitTally['validation']) => void
  runManualScan: () => FraudAlert | null
  addCandidate: (c: Omit<Candidate, 'id'>) => void
  removeCandidate: (id: string) => void
  addPollingUnit: (u: Omit<PollingUnit, 'id' | 'officerId'>) => void
  addOfficer: (o: Omit<Officer, 'id' | 'createdAt' | 'active'>) => void
  toggleOfficer: (id: string) => void
  setElectionStatus: (electionId: string, status: ElectionStatus) => void
  addElection: (e: Omit<Election, 'id' | 'createdAt'>) => void
  log: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void
}

/** A unit's three states are consistent iff accredited >= cast = encrypted = Σ perCandidate. */
function isConsistent(t: UnitTally): boolean {
  const sum = Object.values(t.perCandidate).reduce((s, n) => s + n, 0)
  return t.encrypted === t.cast && t.accredited >= t.cast && sum === t.encrypted
}

function regionStatsFrom(
  units: PollingUnit[],
  tallies: Record<string, UnitTally>,
): Record<string, { registered: number; voted: number }> {
  const acc: Record<string, { registered: number; voted: number }> = {}
  units.forEach((u) => {
    const t = tallies[u.id]
    if (!t) return
    if (!acc[u.region]) acc[u.region] = { registered: 0, voted: 0 }
    acc[u.region].registered += t.registered
    acc[u.region].voted += t.cast
  })
  return acc
}

function initialState() {
  const chain = buildChain()
  const unitTallies = buildUnitTallies()
  const units = POLLING_UNITS.map((u) => ({ ...u }))
  const validatedCast = Object.values(unitTallies)
    .filter((t) => t.validation === 'validated')
    .reduce((s, t) => s + t.cast, 0)
  return {
    elections: [ELECTION],
    candidates: CANDIDATES,
    pollingUnits: units,
    officers: OFFICERS.map((o) => ({ ...o })),
    voters: buildVoters(),
    blocks: chain.blocks,
    votes: chain.votes,
    unitTallies,
    regionStats: regionStatsFrom(units, unitTallies),
    hourlyTurnout: buildHourly(validatedCast),
    alerts: FRAUD_ALERTS.map((a) => ({ ...a })),
    audit: buildAudit(),
  }
}

function mineBlock(prev: Block, type: Block['type'], summary: string, payload: unknown): Block {
  const timestamp = new Date().toISOString()
  const payloadHash = sha256ish(JSON.stringify(payload))
  let nonce = 0
  let hash = ''
  do {
    nonce++
    hash = sha256ish(`${prev.index + 1}|${prev.hash}|${payloadHash}|${timestamp}|${nonce}`)
  } while (hash[0] !== '0' && nonce < 64)
  return { index: prev.index + 1, timestamp, type, prevHash: prev.hash, hash, nonce, summary, payloadHash }
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...initialState(),

      activeElection: () => get().elections.find((e) => e.status === 'active') ?? get().elections[0],

      results: (electionId) => {
        const { candidates, unitTallies } = get()
        const cands = candidates.filter((c) => c.electionId === electionId)
        // National total = sum of validated polling-unit outputs only.
        const validated = Object.values(unitTallies).filter((t) => t.validation === 'validated')
        const counts = cands.map((c) => ({
          c,
          total: validated.reduce((s, t) => s + (t.perCandidate[c.id] ?? 0), 0),
        }))
        const sum = counts.reduce((s, x) => s + x.total, 0) || 1
        return counts
          .map(({ c, total }) => ({ ...c, votes: total, percent: (total / sum) * 100 }))
          .sort((a, b) => b.votes - a.votes)
      },

      totalVotes: () => {
        const validated = Object.values(get().unitTallies).filter((t) => t.validation === 'validated')
        return validated.reduce((s, t) => s + t.cast, 0)
      },

      unitFor: (id) => get().pollingUnits.find((u) => u.id === id),
      unitTallyFor: (id) => (id ? get().unitTallies[id] : undefined),

      unitStates: () => {
        const { pollingUnits, unitTallies, candidates } = get()
        return pollingUnits
          .map((unit) => {
            const tally = unitTallies[unit.id]
            if (!tally) return null
            let leading: UnitState['leading'] = null
            for (const c of candidates) {
              const v = tally.perCandidate[c.id] ?? 0
              if (!leading || v > leading.votes) leading = { candidate: c, votes: v }
            }
            return { unit, tally, consistent: isConsistent(tally), leading }
          })
          .filter((x): x is UnitState => x !== null)
          .sort((a, b) => a.unit.code.localeCompare(b.unit.code))
      },

      nationalTotals: () => {
        const tallies = Object.values(get().unitTallies)
        const acc = (sel: (t: UnitTally) => number) => tallies.reduce((s, t) => s + sel(t), 0)
        return {
          registered: acc((t) => t.registered),
          accredited: acc((t) => t.accredited),
          cast: acc((t) => t.cast),
          encrypted: acc((t) => t.encrypted),
          acceptedCast: tallies.filter((t) => t.validation === 'validated').reduce((s, t) => s + t.cast, 0),
          totalUnits: tallies.length,
          validatedUnits: tallies.filter((t) => t.validation === 'validated').length,
          pendingUnits: tallies.filter((t) => t.validation === 'pending').length,
          flaggedUnits: tallies.filter((t) => t.validation === 'flagged').length,
          consistent: tallies.every(isConsistent),
        }
      },

      ledgerValid: () => {
        const { blocks } = get()
        for (let i = 1; i < blocks.length; i++) {
          if (blocks[i].prevHash !== blocks[i - 1].hash) return false
        }
        return true
      },

      registerSessionVoter: (name, pollingUnitId) => {
        const units = get().pollingUnits
        const unit = units.find((u) => u.id === pollingUnitId) ?? units[0]
        const serial = Math.floor(90000000 + Math.random() * 9999999)
        const voter: Voter = {
          id: `VIN-${serial}`,
          name,
          ...buildContact(name, serial, unit.region),
          photoUrl: null,
          pollingUnitId: unit.id,
          region: unit.region,
          status: 'registered',
          biometricHash: sha256ish(`bio::${name}::${Date.now()}`).slice(0, 32),
          verifiedAt: null,
          verifiedMethod: null,
          votedAt: null,
        }
        set((s) => ({ voters: [voter, ...s.voters] }))
        sb.upsertVoter(voter)
        return voter
      },

      updateVoterPhoto: (voterId, photoUrl) => {
        set((s) => ({
          voters: s.voters.map((v) => (v.id === voterId ? { ...v, photoUrl } : v)),
        }))
        const v = get().voters.find((x) => x.id === voterId)
        if (v) sb.upsertVoter(v)
      },

      verifyVoter: (voterId, method) => {
        const voter = get().voters.find((x) => x.id === voterId)
        set((s) => {
          const voters = s.voters.map((v) =>
            v.id === voterId && v.status === 'registered'
              ? { ...v, status: 'verified' as const, verifiedAt: new Date().toISOString(), verifiedMethod: method }
              : v,
          )
          // Polling Unit Verification Layer: issuing a token increments accredited.
          const unitId = voter?.pollingUnitId
          const unitTallies = { ...s.unitTallies }
          if (unitId && unitTallies[unitId]) {
            unitTallies[unitId] = { ...unitTallies[unitId], accredited: unitTallies[unitId].accredited + 1 }
          }
          return { voters, unitTallies }
        })
        const updated = get().voters.find((x) => x.id === voterId)
        if (updated) sb.upsertVoter(updated)
        if (voter?.pollingUnitId) {
          const t = get().unitTallies[voter.pollingUnitId]
          if (t) sb.upsertTally(t)
        }
        get().log({
          actor: 'officer',
          action: 'Voter verified',
          detail: `${methodLabel(method)} match · ${voterId}${voter ? ` · ${voter.region}` : ''}`,
          severity: 'info',
        })
      },

      castVote: (voterId, candidateId) => {
        const state = get()
        const voter = state.voters.find((v) => v.id === voterId)
        const election = state.activeElection()
        const candidate = state.candidates.find((c) => c.id === candidateId)
        if (!voter || !election || !candidate) return null
        if (voter.status === 'voted') return null

        const token = anonToken(voter.id, election.id)
        const prev = state.blocks[state.blocks.length - 1]
        const block = mineBlock(prev, 'vote', `Encrypted vote recorded · ${state.unitFor(voter.pollingUnitId)?.code ?? ''}`, {
          token,
          unit: voter.pollingUnitId,
          t: Date.now(),
        })
        const vote: VoteRecord = {
          id: uid('vote'),
          electionId: election.id,
          candidateId,
          anonToken: token,
          pollingUnitId: voter.pollingUnitId,
          region: voter.region,
          blockHash: block.hash,
          blockIndex: block.index,
          timestamp: block.timestamp,
        }

        set((s) => {
          // Polling Unit Verification Layer: a used token + a recorded encrypted vote.
          const unitTallies = { ...s.unitTallies }
          const t = unitTallies[voter.pollingUnitId]
          if (t) {
            const cast = t.cast + 1
            unitTallies[voter.pollingUnitId] = {
              ...t,
              cast,
              encrypted: t.encrypted + 1,
              accredited: Math.max(t.accredited, cast),
              perCandidate: { ...t.perCandidate, [candidateId]: (t.perCandidate[candidateId] ?? 0) + 1 },
            }
          }
          const hourly = [...s.hourlyTurnout]
          if (hourly.length) hourly[hourly.length - 1] = { ...hourly[hourly.length - 1], votes: hourly[hourly.length - 1].votes + 1 }
          return {
            blocks: [...s.blocks, block],
            votes: [...s.votes, vote],
            unitTallies,
            regionStats: regionStatsFrom(s.pollingUnits, unitTallies),
            hourlyTurnout: hourly,
            voters: s.voters.map((v) => (v.id === voterId ? { ...v, status: 'voted', votedAt: block.timestamp } : v)),
          }
        })

        // ---- persist to Supabase ----
        sb.insertBlock(block)
        sb.insertVote(vote)
        const updatedTally = get().unitTallies[voter.pollingUnitId]
        if (updatedTally) sb.upsertTally(updatedTally)
        const updatedVoter = get().voters.find((v) => v.id === voterId)
        if (updatedVoter) sb.upsertVoter(updatedVoter)

        get().log({
          actor: 'voter',
          action: 'Vote recorded',
          detail: `Encrypted ballot committed to ledger · block #${block.index} · ${state.unitFor(voter.pollingUnitId)?.code ?? ''}`,
          severity: 'success',
        })

        const after = get()
        const scan = scanForAnomalies(after.votes, after.pollingUnits, after.alerts)
        if (scan.alert) {
          set((s) => ({ alerts: [scan.alert as FraudAlert, ...s.alerts] }))
          sb.upsertAlert(scan.alert)
          get().log({ actor: 'ai', action: 'Anomaly detected', detail: `${scan.alert.title} · risk ${scan.alert.riskScore}`, severity: 'warning' })
        }

        return { vote, block, candidate }
      },

      setAlertStatus: (alertId, status) => {
        set((s) => ({ alerts: s.alerts.map((a) => (a.id === alertId ? { ...a, status } : a)) }))
        const a = get().alerts.find((x) => x.id === alertId)
        if (a) sb.upsertAlert(a)
        get().log({
          actor: 'admin',
          action: `Alert ${status}`,
          detail: get().alerts.find((a) => a.id === alertId)?.title ?? '',
          severity: status === 'confirmed' ? 'critical' : 'info',
        })
      },

      setUnitValidation: (unitId, validation) => {
        set((s) => ({
          unitTallies: s.unitTallies[unitId]
            ? { ...s.unitTallies, [unitId]: { ...s.unitTallies[unitId], validation } }
            : s.unitTallies,
        }))
        const t = get().unitTallies[unitId]
        if (t) sb.upsertTally(t)
        const unit = get().unitFor(unitId)
        get().log({
          actor: 'admin',
          action: validation === 'validated' ? 'Polling unit validated' : `Polling unit ${validation}`,
          detail: `${unit?.code ?? unitId} · ${validation === 'validated' ? 'accepted into national aggregation' : 'excluded from aggregation'}`,
          severity: validation === 'validated' ? 'success' : 'warning',
        })
      },

      runManualScan: () => {
        const s = get()
        const scan = scanForAnomalies(s.votes, s.pollingUnits, s.alerts)
        if (scan.alert) {
          set((st) => ({ alerts: [scan.alert as FraudAlert, ...st.alerts] }))
          sb.upsertAlert(scan.alert)
        }
        get().log({
          actor: 'ai',
          action: 'Manual anomaly scan',
          detail: scan.alert ? `New alert: ${scan.alert.title}` : `Scan complete · no new anomalies across ${s.blocks.length} blocks`,
          severity: scan.alert ? 'warning' : 'info',
        })
        return scan.alert
      },

      addCandidate: (c) => {
        const candidate: Candidate = { ...c, id: uid('cnd') }
        set((s) => ({ candidates: [...s.candidates, candidate] }))
        sb.upsertCandidate(candidate)
        const prev = get().blocks[get().blocks.length - 1]
        const block = mineBlock(prev, 'candidate', `Candidate registered: ${candidate.name} (${candidate.partyAbbr})`, candidate)
        set((s) => ({ blocks: [...s.blocks, block] }))
        sb.insertBlock(block)
        get().log({ actor: 'superadmin', action: 'Candidate registered', detail: `${candidate.name} · ${candidate.party}`, severity: 'info' })
      },

      removeCandidate: (id) => {
        const c = get().candidates.find((x) => x.id === id)
        set((s) => ({ candidates: s.candidates.filter((x) => x.id !== id) }))
        sb.deleteCandidate(id)
        get().log({ actor: 'superadmin', action: 'Candidate removed', detail: c?.name ?? id, severity: 'warning' })
      },

      addPollingUnit: (u) => {
        const unit: PollingUnit = { ...u, id: uid('pu'), officerId: null }
        const tally: UnitTally = {
          unitId: unit.id,
          registered: unit.registeredVoters,
          accredited: 0,
          cast: 0,
          encrypted: 0,
          perCandidate: {},
          validation: 'validated',
        }
        set((s) => {
          const pollingUnits = [...s.pollingUnits, unit]
          const unitTallies = { ...s.unitTallies, [unit.id]: tally }
          return { pollingUnits, unitTallies, regionStats: regionStatsFrom(pollingUnits, unitTallies) }
        })
        sb.upsertUnit(unit)
        sb.upsertTally(tally)
        get().log({ actor: 'superadmin', action: 'Polling unit added', detail: `${unit.code} · ${unit.region}`, severity: 'info' })
      },

      addOfficer: (o) => {
        const officer: Officer = { ...o, id: uid('ofc'), active: true, createdAt: new Date().toISOString() }
        set((s) => ({
          officers: [...s.officers, officer],
          pollingUnits: officer.pollingUnitId
            ? s.pollingUnits.map((u) => (u.id === officer.pollingUnitId ? { ...u, officerId: officer.id } : u))
            : s.pollingUnits,
        }))
        sb.upsertOfficer(officer)
        if (officer.pollingUnitId) {
          const u = get().pollingUnits.find((x) => x.id === officer.pollingUnitId)
          if (u) sb.upsertUnit(u)
        }
        get().log({ actor: 'superadmin', action: 'Officer onboarded', detail: `${officer.name} · ${officer.email}`, severity: 'info' })
      },

      toggleOfficer: (id) => {
        set((s) => ({ officers: s.officers.map((o) => (o.id === id ? { ...o, active: !o.active } : o)) }))
        const o = get().officers.find((x) => x.id === id)
        if (o) sb.upsertOfficer(o)
        get().log({ actor: 'superadmin', action: o?.active ? 'Officer activated' : 'Officer suspended', detail: o?.name ?? id, severity: 'info' })
      },

      setElectionStatus: (electionId, status) => {
        set((s) => ({ elections: s.elections.map((e) => (e.id === electionId ? { ...e, status } : e)) }))
        const el = get().elections.find((e) => e.id === electionId)
        if (el) sb.upsertElection(el)
        get().log({ actor: 'superadmin', action: 'Election status changed', detail: `${el?.title} → ${status}`, severity: status === 'active' ? 'success' : 'info' })
      },

      addElection: (e) => {
        const election: Election = { ...e, id: uid('elc'), createdAt: new Date().toISOString() }
        set((s) => ({ elections: [...s.elections, election] }))
        sb.upsertElection(election)
        const prev = get().blocks[get().blocks.length - 1]
        const block = mineBlock(prev, 'election', `Election registered: ${election.title}`, election)
        set((s) => ({ blocks: [...s.blocks, block] }))
        sb.insertBlock(block)
        get().log({ actor: 'superadmin', action: 'Election created', detail: election.title, severity: 'success' })
      },

      log: (entry) => {
        const full: AuditEntry = { ...entry, id: uid('aud'), timestamp: new Date().toISOString() }
        set((s) => ({ audit: [full, ...s.audit].slice(0, 200) }))
        sb.insertAudit(full)
      },
    }),
    {
      name: 'cdin-store-v4',
      version: 4,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({
        elections: s.elections,
        candidates: s.candidates,
        pollingUnits: s.pollingUnits,
        officers: s.officers,
        voters: s.voters,
        blocks: s.blocks,
        votes: s.votes,
        unitTallies: s.unitTallies,
        regionStats: s.regionStats,
        hourlyTurnout: s.hourlyTurnout,
        alerts: s.alerts,
        audit: s.audit,
      }),
    },
  ),
)

function methodLabel(m: VerificationMethod): string {
  return m === 'id_card' ? 'ID card' : m === 'biometric' ? 'Biometric' : 'QR code'
}
