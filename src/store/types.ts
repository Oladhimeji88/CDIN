/** Domain model for the CDIN voting system. */

export type Role = 'voter' | 'officer' | 'admin' | 'superadmin'

export type ElectionStatus = 'draft' | 'scheduled' | 'active' | 'closed'

export type VoterStatus = 'registered' | 'verified' | 'voted'

export type VerificationMethod = 'id_card' | 'biometric' | 'qr_code'

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'

export type AlertStatus = 'open' | 'reviewing' | 'confirmed' | 'dismissed'

export type BlockType = 'genesis' | 'vote' | 'election' | 'candidate' | 'system'

export interface Election {
  id: string
  title: string
  type: string // Presidential, Gubernatorial, Senatorial...
  region: string
  status: ElectionStatus
  startsAt: string
  endsAt: string
  createdAt: string
}

export interface Candidate {
  id: string
  electionId: string
  name: string
  party: string
  partyAbbr: string
  color: string
  manifesto: string
}

export interface PollingUnit {
  id: string
  code: string
  name: string
  region: string
  ward: string
  registeredVoters: number
  officerId: string | null
}

export interface Officer {
  id: string
  name: string
  email: string
  pollingUnitId: string | null
  active: boolean
  createdAt: string
}

export interface Voter {
  id: string // VIN
  name: string
  email: string
  phone: string
  nin: string // National Identification Number
  address: string
  photoUrl: string | null // voter-uploaded profile image (data URL)
  pollingUnitId: string
  region: string
  status: VoterStatus
  biometricHash: string
  verifiedAt: string | null
  verifiedMethod: VerificationMethod | null
  votedAt: string | null
}

export type UnitValidation = 'validated' | 'pending' | 'flagged'

/**
 * Polling Unit Verification Layer.
 * The three synchronized states each unit maintains; the invariant is
 * `accredited >= cast` and `cast === encrypted === Σ perCandidate`.
 */
export interface UnitTally {
  unitId: string
  registered: number
  accredited: number // issued tokens
  cast: number // used tokens
  encrypted: number // recorded encrypted votes on the ledger
  perCandidate: Record<string, number>
  validation: UnitValidation
}

export interface Block {
  index: number
  timestamp: string
  type: BlockType
  prevHash: string
  hash: string
  nonce: number
  summary: string
  payloadHash: string
}

export interface VoteRecord {
  id: string
  electionId: string
  candidateId: string
  anonToken: string // unlinkable to voter identity in the UI
  pollingUnitId: string
  region: string
  blockHash: string
  blockIndex: number
  timestamp: string
}

export interface FraudAlert {
  id: string
  type: string
  title: string
  description: string
  severity: AlertSeverity
  riskScore: number // 0..100
  scope: string // region / polling unit
  status: AlertStatus
  detectedAt: string
  metric: string
}

export interface AuditEntry {
  id: string
  timestamp: string
  actor: Role | 'system' | 'ai'
  action: string
  detail: string
  severity: 'info' | 'success' | 'warning' | 'critical'
}

export interface SessionUser {
  role: Role
  name: string
  refId: string // voterId for voters, officerId for officers, label otherwise
}
