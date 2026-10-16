import { sha256ish, uid, anonToken } from '@/lib/hash'
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
} from './types'

const now = Date.now()
const iso = (msAgo: number) => new Date(now - msAgo).toISOString()
const MIN = 60_000
const HOUR = 60 * MIN

/* ------------------------------------------------------------------ */
/*  Static reference data                                              */
/* ------------------------------------------------------------------ */

export const ELECTION: Election = {
  id: 'elc_presidential_2027',
  title: '2027 Presidential Election',
  type: 'Presidential',
  region: 'National',
  status: 'active',
  startsAt: iso(8 * HOUR),
  endsAt: iso(-4 * HOUR), // ends 4h in the future
  createdAt: iso(40 * 24 * HOUR),
}

export const CANDIDATES: Candidate[] = [
  {
    id: 'cnd_apc',
    electionId: ELECTION.id,
    name: 'Bola Ahmed Tinubu',
    party: 'All Progressives Congress',
    partyAbbr: 'APC',
    color: '#1ca672',
    manifesto: 'Continuity on economic reform, infrastructure and national security.',
  },
  {
    id: 'cnd_ndc',
    electionId: ELECTION.id,
    name: 'Peter Obi',
    party: 'Nigeria Democratic Congress',
    partyAbbr: 'NDC',
    color: '#0ea5e9',
    manifesto: 'Fiscal discipline and a shift from consumption to production.',
  },
  {
    id: 'cnd_adc',
    electionId: ELECTION.id,
    name: 'Atiku Abubakar',
    party: 'African Democratic Congress',
    partyAbbr: 'ADC',
    color: '#d99008',
    manifesto: 'Restructuring, private-sector growth and education investment.',
  },
  {
    id: 'cnd_pdp',
    electionId: ELECTION.id,
    name: 'Goodluck Jonathan',
    party: 'Peoples Democratic Party',
    partyAbbr: 'PDP',
    color: '#e0463c',
    manifesto: 'Stability, power-sector revival and inclusive development.',
  },
  {
    id: 'cnd_apm',
    electionId: ELECTION.id,
    name: 'Seyi Makinde',
    party: 'Allied Peoples Movement',
    partyAbbr: 'APM',
    color: '#7c5cfc',
    manifesto: 'Grassroots development, agriculture and state-level industrialisation.',
  },
]

const REGIONS = [
  'Lagos',
  'Kano',
  'Rivers',
  'FCT Abuja',
  'Oyo',
  'Kaduna',
  'Enugu',
  'Anambra',
]

export const POLLING_UNITS: PollingUnit[] = REGIONS.flatMap((region, ri) =>
  [1, 2].map((n) => ({
    id: `pu_${ri}_${n}`,
    code: `PU/${String(ri + 1).padStart(2, '0')}/${String(n).padStart(3, '0')}`,
    name: `${region} Ward ${n} Unit`,
    region,
    ward: `Ward ${n}`,
    registeredVoters: 800 + ((ri * 7 + n * 31) % 9) * 120,
    officerId: null as string | null,
  })),
)

export const OFFICERS: Officer[] = [
  'Tunde Afolabi',
  'Aisha Bello',
  'Chinedu Okeke',
  'Grace Effiong',
  'Ibrahim Sani',
].map((name, i) => ({
  id: `ofc_${i}`,
  name,
  email: `${name.split(' ')[0].toLowerCase()}.officer@cdin.gov`,
  pollingUnitId: POLLING_UNITS[i]?.id ?? null,
  active: true,
  createdAt: iso(30 * 24 * HOUR),
}))

// link officers back onto units
OFFICERS.forEach((o) => {
  const u = POLLING_UNITS.find((p) => p.id === o.pollingUnitId)
  if (u) u.officerId = o.id
})

/* ------------------------------------------------------------------ */
/*  Voter roster (for the verification officer screen)                */
/* ------------------------------------------------------------------ */

const FIRST = [
  'Emeka', 'Bisi', 'Hauwa', 'Tobi', 'Amara', 'Suleiman', 'Ifeoma', 'Kunle',
  'Zainab', 'Chioma', 'Musa', 'Folarin', 'Ada', 'Bashir', 'Ngozi', 'Segun',
  'Hadiza', 'Uche', 'Yemi', 'Damilola', 'Obinna', 'Funke', 'Idris', 'Halima',
]
const LAST = [
  'Okafor', 'Adeyemi', 'Bello', 'Eze', 'Mohammed', 'Olawale', 'Nwosu', 'Abubakar',
  'Ogunleye', 'Chukwu', 'Aliyu', 'Balogun', 'Okonkwo', 'Sanusi', 'Adeleke',
]

const pick = <T,>(arr: T[], i: number) => arr[i % arr.length]

const PHONE_PREFIX = ['803', '805', '807', '810', '813', '816', '906', '708']
const STREETS = ['Adeola', 'Marina', 'Awolowo', 'Ahmadu Bello', 'Aminu Kano', 'Ogui', 'Wuse', 'Ring Road', 'Aba', 'Ikoyi']
const pad = (n: number, len: number) => String(Math.abs(n)).padStart(len, '0').slice(-len)

/** Deterministic contact details for a roster voter. */
export function buildContact(name: string, k: number, region: string) {
  const [first, last] = name.split(' ')
  return {
    email: `${(first ?? 'voter').toLowerCase()}.${(last ?? 'ng').toLowerCase()}@cdinmail.ng`,
    phone: `+234 ${PHONE_PREFIX[k % PHONE_PREFIX.length]} ${pad(k * 317 + 421, 3)} ${pad(k * 911 + 77, 4)}`,
    nin: pad(k * 8675309 + 10000000000, 11),
    address: `${(k * 7) % 240 + 1} ${pick(STREETS, k)} Street, ${region}`,
  }
}

export function buildVoters(): Voter[] {
  const voters: Voter[] = []
  let k = 0
  POLLING_UNITS.forEach((unit, ui) => {
    const count = 7 // roster sample per unit
    for (let j = 0; j < count; j++) {
      k++
      const name = `${pick(FIRST, ui * 5 + j)} ${pick(LAST, ui * 3 + j)}`
      // distribute statuses: ~45% voted, ~20% verified, rest registered
      const r = (ui * 7 + j) % 10
      const status = r < 4 ? 'voted' : r < 6 ? 'verified' : 'registered'
      const contact = buildContact(name, k, unit.region)
      voters.push({
        id: `VIN-${String(90210000 + k)}`,
        name,
        ...contact,
        photoUrl: null,
        pollingUnitId: unit.id,
        region: unit.region,
        status,
        biometricHash: sha256ish(`bio::${name}::${k}`).slice(0, 32),
        verifiedAt: status === 'registered' ? null : iso((j + 1) * 11 * MIN),
        verifiedMethod:
          status === 'registered' ? null : (['id_card', 'biometric', 'qr_code'] as const)[j % 3],
        votedAt: status === 'voted' ? iso((j + 1) * 9 * MIN) : null,
      })
    }
  })
  return voters
}

/* ------------------------------------------------------------------ */
/*  Polling Unit Verification Layer — per-unit synchronized states     */
/*  National totals are derived as the sum of these unit outputs.      */
/* ------------------------------------------------------------------ */

const rotate = <T,>(arr: T[], n: number): T[] => arr.map((_, i) => arr[(i + n) % arr.length])

// Two units are intentionally not yet cryptographically validated so the
// aggregation layer can demonstrate excluding non-validated unit data.
const FLAGGED_UNIT = 'pu_1_2' // Kano Ward 2 — matches the seeded fraud alert
const PENDING_UNIT = 'pu_6_1' // Enugu Ward 1 — awaiting validation

export function buildUnitTallies(): Record<string, UnitTally> {
  const baseWeights = [0.27, 0.26, 0.2, 0.18, 0.09] // apc · ndc · adc · pdp · apm
  const out: Record<string, UnitTally> = {}

  POLLING_UNITS.forEach((u, i) => {
    const registered = u.registeredVoters
    const accredited = Math.round(registered * (0.55 + (i % 5) * 0.04)) // issued tokens
    const cast = Math.round(accredited * (0.9 + (i % 4) * 0.02)) // used tokens
    const encrypted = cast // one encrypted record per used token (invariant)

    const w = rotate(baseWeights, i % baseWeights.length)
    const raw = CANDIDATES.map((_, ci) => (w[ci] ?? 0.1) * (1 + ((i * 7 + ci * 13) % 5) / 40))
    const sumRaw = raw.reduce((s, x) => s + x, 0)
    const allocated = CANDIDATES.map((_, ci) => Math.floor((cast * raw[ci]) / sumRaw))
    let rem = cast - allocated.reduce((s, x) => s + x, 0)
    let k = 0
    while (rem > 0) {
      allocated[k % allocated.length] += 1
      rem -= 1
      k += 1
    }
    const perCandidate: Record<string, number> = {}
    CANDIDATES.forEach((c, ci) => (perCandidate[c.id] = allocated[ci]))

    out[u.id] = {
      unitId: u.id,
      registered,
      accredited,
      cast,
      encrypted,
      perCandidate,
      validation: u.id === FLAGGED_UNIT ? 'flagged' : u.id === PENDING_UNIT ? 'pending' : 'validated',
    }
  })

  return out
}

/** Derive regional registered / voted figures from the unit tallies. */
export function computeRegionStats(
  tallies: Record<string, UnitTally>,
): Record<string, { registered: number; voted: number }> {
  const acc: Record<string, { registered: number; voted: number }> = {}
  POLLING_UNITS.forEach((u) => {
    const t = tallies[u.id]
    if (!t) return
    if (!acc[u.region]) acc[u.region] = { registered: 0, voted: 0 }
    acc[u.region].registered += t.registered
    acc[u.region].voted += t.cast
  })
  return acc
}

/** Hourly turnout shape that sums to (approximately) the validated total. */
export function buildHourly(totalCast: number): { label: string; votes: number }[] {
  const hours = 9
  const weights = Array.from({ length: hours }, (_, i) => 0.3 + Math.sin((i / (hours - 1)) * Math.PI))
  const sumW = weights.reduce((s, w) => s + w, 0)
  return weights.map((w, i) => ({
    label: `${String(8 + i).padStart(2, '0')}:00`,
    votes: Math.round((totalCast * w) / sumW),
  }))
}

/* ------------------------------------------------------------------ */
/*  Blockchain + recent votes                                          */
/* ------------------------------------------------------------------ */

function makeBlock(
  index: number,
  prevHash: string,
  type: Block['type'],
  summary: string,
  payload: unknown,
  timestamp: string,
): Block {
  const payloadHash = sha256ish(JSON.stringify(payload))
  const nonce = (index * 7919) % 100000
  const hash = sha256ish(`${index}|${prevHash}|${payloadHash}|${timestamp}|${nonce}`)
  return { index, timestamp, type, prevHash, hash, nonce, summary, payloadHash }
}

export interface SeedChain {
  blocks: Block[]
  votes: VoteRecord[]
}

export function buildChain(): SeedChain {
  const blocks: Block[] = []
  const votes: VoteRecord[] = []

  const genesis = makeBlock(
    0,
    '0'.repeat(64),
    'genesis',
    'Genesis block — CDIN ledger initialised',
    { network: 'cdin-mainnet' },
    iso(40 * 24 * HOUR),
  )
  blocks.push(genesis)

  let prev = genesis.hash
  let idx = 1

  // election + candidate registration blocks
  const elcBlock = makeBlock(idx++, prev, 'election', `Election registered: ${ELECTION.title}`, ELECTION, iso(40 * 24 * HOUR - HOUR))
  blocks.push(elcBlock)
  prev = elcBlock.hash

  CANDIDATES.forEach((c) => {
    const b = makeBlock(idx++, prev, 'candidate', `Candidate registered: ${c.name} (${c.partyAbbr})`, c, iso(38 * 24 * HOUR))
    blocks.push(b)
    prev = b.hash
  })

  // recent live vote blocks (the visible tail of the chain)
  const RECENT = 24
  for (let i = 0; i < RECENT; i++) {
    const unit = POLLING_UNITS[(i * 3) % POLLING_UNITS.length]
    const cand = CANDIDATES[(i * 2 + 1) % CANDIDATES.length]
    const ts = iso((RECENT - i) * 3 * MIN)
    const voteId = `vote_seed_${i}`
    const token = anonToken(`seedvoter${i}`, ELECTION.id)
    const b = makeBlock(
      idx++,
      prev,
      'vote',
      `Encrypted vote recorded · ${unit.code}`,
      { token, unit: unit.id, t: ts },
      ts,
    )
    blocks.push(b)
    votes.push({
      id: voteId,
      electionId: ELECTION.id,
      candidateId: cand.id,
      anonToken: token,
      pollingUnitId: unit.id,
      region: unit.region,
      blockHash: b.hash,
      blockIndex: b.index,
      timestamp: ts,
    })
    prev = b.hash
  }

  return { blocks, votes }
}

/* ------------------------------------------------------------------ */
/*  Fraud alerts + audit trail                                         */
/* ------------------------------------------------------------------ */

export const FRAUD_ALERTS: FraudAlert[] = [
  {
    id: uid('flt'),
    type: 'Turnout anomaly',
    title: 'Vote spike detected in Kano Ward 2',
    description:
      'Voting velocity at PU/02/002 exceeded the regional 95th percentile by 3.2× within a 12-minute window. Pattern consistent with possible ballot stuffing.',
    severity: 'high',
    riskScore: 82,
    scope: 'Kano · PU/02/002',
    status: 'open',
    detectedAt: iso(22 * MIN),
    metric: '3.2× velocity baseline',
  },
  {
    id: uid('flt'),
    type: 'Duplicate attempt',
    title: 'Repeated verification attempts blocked',
    description:
      'A single biometric signature was presented 4 times across 2 polling units. All duplicate attempts were rejected at the verification layer.',
    severity: 'medium',
    riskScore: 57,
    scope: 'Rivers · PU/03/001',
    status: 'reviewing',
    detectedAt: iso(1 * HOUR + 14 * MIN),
    metric: '4 duplicate signatures',
  },
  {
    id: uid('flt'),
    type: 'Coordinated pattern',
    title: 'Sequential voting cadence flagged',
    description:
      'Votes recorded at near-uniform 6-second intervals suggest automated or coordinated submission. Confidence is moderate; manual audit recommended.',
    severity: 'medium',
    riskScore: 49,
    scope: 'Lagos · PU/01/002',
    status: 'open',
    detectedAt: iso(2 * HOUR + 3 * MIN),
    metric: 'σ of inter-vote time = 0.4s',
  },
  {
    id: uid('flt'),
    type: 'Integrity check',
    title: 'Ledger continuity verified',
    description:
      'Full chain hash-linkage validated end-to-end. No tampering detected across 2,418 blocks.',
    severity: 'low',
    riskScore: 6,
    scope: 'National ledger',
    status: 'dismissed',
    detectedAt: iso(3 * HOUR),
    metric: '0 broken links',
  },
]

export function buildAudit(): AuditEntry[] {
  return [
    { id: uid('aud'), timestamp: iso(2 * MIN), actor: 'ai', action: 'Anomaly scan completed', detail: 'Scanned 2,418 blocks · 1 new high-severity alert', severity: 'warning' },
    { id: uid('aud'), timestamp: iso(8 * MIN), actor: 'voter', action: 'Vote recorded', detail: 'Encrypted ballot committed to ledger · PU/06/001', severity: 'success' },
    { id: uid('aud'), timestamp: iso(15 * MIN), actor: 'officer', action: 'Voter verified', detail: 'Biometric match · VIN-90210042', severity: 'info' },
    { id: uid('aud'), timestamp: iso(34 * MIN), actor: 'admin', action: 'Results snapshot published', detail: 'Live tally checkpoint #128', severity: 'info' },
    { id: uid('aud'), timestamp: iso(1 * HOUR), actor: 'system', action: 'Block finalised', detail: 'Block #2417 sealed · 1 vote', severity: 'success' },
    { id: uid('aud'), timestamp: iso(2 * HOUR), actor: 'superadmin', action: 'Polling unit activated', detail: 'PU/08/002 brought online', severity: 'info' },
  ]
}
