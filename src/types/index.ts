export type ThemeMode = 'GOVT_LIGHT' | 'DELHI_DARK' | 'TACTICAL_AMBER' | 'CYBER_CELL';

export type ViewType = 
  | 'DASHBOARD'
  | 'UPLOAD'
  | 'AI_ANALYSIS'
  | 'NETWORK_EXPLORER'
  | 'DELHI_MAP'
  | 'ENTITIES'
  | 'CASES'
  | 'CASE_DETAILS'
  | 'ALERTS'
  | 'CROSS_CASE'
  | 'ANALYTICS'
  | 'INSIGHTS'
  | 'EVIDENCE'
  | 'AUDIT_LOGS'
  | 'SETTINGS';

export type EntityType = 
  | 'PERSON' 
  | 'PHONE' 
  | 'VEHICLE' 
  | 'LOCATION' 
  | 'ORGANIZATION' 
  | 'CASE' 
  | 'BANK_ACCOUNT';

export type RelationshipType = 
  | 'COMMUNICATED_WITH' 
  | 'ASSOCIATED_WITH' 
  | 'SHARED_LOCATION' 
  | 'VEHICLE_LINKED' 
  | 'ORGANIZATION_LINKED' 
  | 'MENTIONED_IN_FIR' 
  | 'FINANCIAL_TRANSACTION';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CentralityMetrics {
  degreeCentrality: number;
  betweennessCentrality: number;
  closenessCentrality: number;
  eigenvectorCentrality: number;
  communityId: number;
  connectionCount: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  subtitle?: string;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  neutralTerm: string; // e.g., "Person of Interest", "Associated Entity", "High-Centrality Node"
  centrality: CentralityMetrics;
  associatedCases: string[];
  attributes: Record<string, string | number>;
  riskIndicators: string[];
  xaiReasoning: string[]; // Investigator link reasoning
  createdDate: string;
  lastActive: string;
  avatarUrl?: string;
}

export interface Relationship {
  id: string;
  source: string; // Entity ID
  target: string; // Entity ID
  type: RelationshipType;
  label: string;
  weight: number;
  timestamp?: string;
  firId?: string;
  frequency?: number;
  details?: string;
}

export interface CaseFile {
  id: string;
  firNumber: string;
  title: string;
  policeStation: string;
  date: string;
  location: string;
  ipcSections: string[];
  bnsSections?: string[];
  status: 'ACTIVE_INVESTIGATION' | 'CHARGE_SHEET_DRAFTED' | 'UNDER_REVIEW' | 'CLOSED';
  assignedOfficer: string;
  entityCount: number;
  summary: string;
  evidenceItems: string[];
  riskRating: RiskLevel;
}

export interface AlertItem {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  patternName: string;
  title: string;
  description: string;
  entitiesInvolved: { id: string; name: string; type: EntityType }[];
  relatedCases: string[];
  detectedTime: string;
  reason: string;
  status: 'UNREVIEWED' | 'UNDER_INVESTIGATION' | 'VERIFIED' | 'DISMISSED';
  evidenceReferences: string[];
  xaiConfidence: number;
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  title: string;
  type: 'FIR_DOCUMENT' | 'CDR_DUMP' | 'FINANCIAL_STATEMENT' | 'SURVEILLANCE_NOTE' | 'SEIZURE_MEMO';
  hash: string;
  timestamp: string;
  recordedBy: string;
  integrityStatus: 'VERIFIED' | 'FAILED' | 'PENDING';
  blockchainTxHash: string;
  blockNumber: number;
  fileSize: string;
  fileFormat: string;
  auditTrail: { timestamp: string; action: string; user: string }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  officerName: string;
  officerBadge: string;
  action: string;
  target: string;
  ipAddress: string;
  status: 'SUCCESS' | 'DENIED' | 'FLAGGED';
  details: string;
}

export interface CrossCaseLink {
  id: string;
  caseA: string;
  caseB: string;
  sharedPersons: number;
  sharedPhones: number;
  sharedVehicles: number;
  sharedLocations: number;
  sharedOrganizations: number;
  strengthScore: number;
  entities: { id: string; name: string; type: EntityType }[];
}

export interface UserProfile {
  id: string;
  badgeNumber: string;
  name: string;
  rank: string;
  department: string;
  clearanceLevel: string;
  email: string;
  activeSessionId: string;
  lastLogin: string;
}

export interface AnalysisSummary {
  caseId: string;
  fileUploaded: string;
  extractedEntitiesCount: number;
  extractedRelationshipsCount: number;
  communitiesDetected: number;
  overallAnomalyScore: number;
  keyInsights: string[];
  extractedTriplets: { subject: string; predicate: string; object: string; confidence: number }[];
  recommendedSteps: string[];
}
