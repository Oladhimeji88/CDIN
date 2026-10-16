'use client'

/**
 * Supabase data layer for the store.
 *  - hydrateFromSupabase(): pull all tables into the Zustand store on load.
 *  - sb.*: fire-and-forget write-through helpers used by store actions.
 * Components keep using the synchronous store selectors; this keeps the
 * in-memory store as a cache while Supabase is the system of record.
 */

import { supabase } from '@/lib/supabase'
import { buildHourly } from './seed'
import { useStore } from './useStore'
import type {
  Election, Candidate, PollingUnit, Officer, Voter, Block, VoteRecord,
  FraudAlert, AuditEntry, UnitTally,
} from './types'

/* ---------- row mappers (camelCase domain <-> snake_case rows) ---------- */

const electionRow = (e: Election) => ({ id: e.id, title: e.title, type: e.type, region: e.region, status: e.status, starts_at: e.startsAt, ends_at: e.endsAt, created_at: e.createdAt })
const candidateRow = (c: Candidate) => ({ id: c.id, election_id: c.electionId, name: c.name, party: c.party, party_abbr: c.partyAbbr, color: c.color, manifesto: c.manifesto })
const unitRow = (u: PollingUnit) => ({ id: u.id, code: u.code, name: u.name, region: u.region, ward: u.ward, registered_voters: u.registeredVoters, officer_id: u.officerId })
const officerRow = (o: Officer) => ({ id: o.id, name: o.name, email: o.email, polling_unit_id: o.pollingUnitId, active: o.active, created_at: o.createdAt })
const voterRow = (v: Voter) => ({ id: v.id, name: v.name, email: v.email, phone: v.phone, nin: v.nin, address: v.address, photo_url: v.photoUrl, polling_unit_id: v.pollingUnitId, region: v.region, status: v.status, biometric_hash: v.biometricHash, verified_at: v.verifiedAt, verified_method: v.verifiedMethod, voted_at: v.votedAt })
const tallyRow = (t: UnitTally) => ({ unit_id: t.unitId, registered: t.registered, accredited: t.accredited, vote_cast: t.cast, encrypted: t.encrypted, per_candidate: t.perCandidate, validation: t.validation })
const blockRow = (b: Block) => ({ index: b.index, timestamp: b.timestamp, type: b.type, prev_hash: b.prevHash, hash: b.hash, nonce: b.nonce, summary: b.summary, payload_hash: b.payloadHash })
const voteRow = (v: VoteRecord) => ({ id: v.id, election_id: v.electionId, candidate_id: v.candidateId, anon_token: v.anonToken, polling_unit_id: v.pollingUnitId, region: v.region, block_hash: v.blockHash, block_index: v.blockIndex, timestamp: v.timestamp })
const alertRow = (a: FraudAlert) => ({ id: a.id, type: a.type, title: a.title, description: a.description, severity: a.severity, risk_score: a.riskScore, scope: a.scope, status: a.status, detected_at: a.detectedAt, metric: a.metric })
const auditRow = (e: AuditEntry) => ({ id: e.id, timestamp: e.timestamp, actor: e.actor, action: e.action, detail: e.detail, severity: e.severity })

/* eslint-disable @typescript-eslint/no-explicit-any */
const toElection = (r: any): Election => ({ id: r.id, title: r.title, type: r.type, region: r.region, status: r.status, startsAt: r.starts_at, endsAt: r.ends_at, createdAt: r.created_at })
const toCandidate = (r: any): Candidate => ({ id: r.id, electionId: r.election_id, name: r.name, party: r.party, partyAbbr: r.party_abbr, color: r.color, manifesto: r.manifesto ?? '' })
const toUnit = (r: any): PollingUnit => ({ id: r.id, code: r.code, name: r.name, region: r.region, ward: r.ward, registeredVoters: r.registered_voters, officerId: r.officer_id })
const toOfficer = (r: any): Officer => ({ id: r.id, name: r.name, email: r.email, pollingUnitId: r.polling_unit_id, active: r.active, createdAt: r.created_at })
const toVoter = (r: any): Voter => ({ id: r.id, name: r.name, email: r.email, phone: r.phone, nin: r.nin, address: r.address, photoUrl: r.photo_url, pollingUnitId: r.polling_unit_id, region: r.region, status: r.status, biometricHash: r.biometric_hash ?? '', verifiedAt: r.verified_at, verifiedMethod: r.verified_method, votedAt: r.voted_at })
const toTally = (r: any): UnitTally => ({ unitId: r.unit_id, registered: r.registered, accredited: r.accredited, cast: r.vote_cast, encrypted: r.encrypted, perCandidate: r.per_candidate ?? {}, validation: r.validation })
const toBlock = (r: any): Block => ({ index: r.index, timestamp: r.timestamp, type: r.type, prevHash: r.prev_hash, hash: r.hash, nonce: r.nonce, summary: r.summary, payloadHash: r.payload_hash })
const toVote = (r: any): VoteRecord => ({ id: r.id, electionId: r.election_id, candidateId: r.candidate_id, anonToken: r.anon_token, pollingUnitId: r.polling_unit_id, region: r.region, blockHash: r.block_hash, blockIndex: r.block_index, timestamp: r.timestamp })
const toAlert = (r: any): FraudAlert => ({ id: r.id, type: r.type, title: r.title, description: r.description, severity: r.severity, riskScore: r.risk_score, scope: r.scope, status: r.status, detectedAt: r.detected_at, metric: r.metric ?? '' })
const toAudit = (r: any): AuditEntry => ({ id: r.id, timestamp: r.timestamp, actor: r.actor, action: r.action, detail: r.detail ?? '', severity: r.severity })
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ---------- write-through (fire and forget) ---------- */

function run(p: PromiseLike<{ error: unknown }>) {
  Promise.resolve(p).then(
    (res) => { if (res?.error) console.warn('[sb] write error', res.error) },
    (e) => console.warn('[sb] write failed', e),
  )
}

export const sb = {
  upsertVoter: (v: Voter) => supabase && run(supabase.from('voters').upsert(voterRow(v))),
  insertVote: (v: VoteRecord) => supabase && run(supabase.from('votes').insert(voteRow(v))),
  insertBlock: (b: Block) => supabase && run(supabase.from('blocks').insert(blockRow(b))),
  upsertTally: (t: UnitTally) => supabase && run(supabase.from('unit_tallies').upsert(tallyRow(t))),
  insertAudit: (e: AuditEntry) => supabase && run(supabase.from('audit').insert(auditRow(e))),
  upsertCandidate: (c: Candidate) => supabase && run(supabase.from('candidates').upsert(candidateRow(c))),
  deleteCandidate: (id: string) => supabase && run(supabase.from('candidates').delete().eq('id', id)),
  upsertUnit: (u: PollingUnit) => supabase && run(supabase.from('polling_units').upsert(unitRow(u))),
  upsertOfficer: (o: Officer) => supabase && run(supabase.from('officers').upsert(officerRow(o))),
  upsertElection: (e: Election) => supabase && run(supabase.from('elections').upsert(electionRow(e))),
  upsertAlert: (a: FraudAlert) => supabase && run(supabase.from('fraud_alerts').upsert(alertRow(a))),
}

/* ---------- hydration ---------- */

export async function hydrateFromSupabase(): Promise<boolean> {
  if (!supabase) return false
  try {
    const [el, ca, pu, of, vo, ut, bl, vt, fa, au] = await Promise.all([
      supabase.from('elections').select('*'),
      supabase.from('candidates').select('*'),
      supabase.from('polling_units').select('*'),
      supabase.from('officers').select('*'),
      supabase.from('voters').select('*'),
      supabase.from('unit_tallies').select('*'),
      supabase.from('blocks').select('*').order('index', { ascending: true }),
      supabase.from('votes').select('*').order('timestamp', { ascending: true }),
      supabase.from('fraud_alerts').select('*').order('detected_at', { ascending: false }),
      supabase.from('audit').select('*').order('timestamp', { ascending: false }),
    ])
    const err = el.error || ca.error || pu.error || of.error || vo.error || ut.error || bl.error || vt.error || fa.error || au.error
    if (err) { console.warn('[sb] hydrate error', err); return false }
    if (!el.data?.length) return false // nothing seeded yet

    const pollingUnits = (pu.data ?? []).map(toUnit)
    const unitTalliesArr = (ut.data ?? []).map(toTally)
    const unitTallies: Record<string, UnitTally> = {}
    unitTalliesArr.forEach((t) => (unitTallies[t.unitId] = t))

    const regionStats: Record<string, { registered: number; voted: number }> = {}
    pollingUnits.forEach((u) => {
      const t = unitTallies[u.id]
      if (!t) return
      if (!regionStats[u.region]) regionStats[u.region] = { registered: 0, voted: 0 }
      regionStats[u.region].registered += t.registered
      regionStats[u.region].voted += t.cast
    })
    const validatedCast = unitTalliesArr.filter((t) => t.validation === 'validated').reduce((s, t) => s + t.cast, 0)

    useStore.setState({
      elections: (el.data ?? []).map(toElection),
      candidates: (ca.data ?? []).map(toCandidate),
      pollingUnits,
      officers: (of.data ?? []).map(toOfficer),
      voters: (vo.data ?? []).map(toVoter),
      unitTallies,
      blocks: (bl.data ?? []).map(toBlock),
      votes: (vt.data ?? []).map(toVote),
      regionStats,
      hourlyTurnout: buildHourly(validatedCast),
      alerts: (fa.data ?? []).map(toAlert),
      audit: (au.data ?? []).map(toAudit),
    })
    return true
  } catch (e) {
    console.warn('[sb] hydrate failed', e)
    return false
  }
}
