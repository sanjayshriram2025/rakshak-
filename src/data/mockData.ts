import { Entity, Relationship, CaseFile, AlertItem, EvidenceItem, AuditLog, CrossCaseLink, UserProfile, AnalysisSummary } from '../types';

export const mockCurrentUser: UserProfile = {
  id: 'USR-DP-8849',
  badgeNumber: 'DP-IPS-8849',
  name: 'Vikramaditya Sharma, IPS',
  rank: 'Deputy Commissioner of Police (DCP)',
  department: 'Delhi Police Crime Branch & Special Cell',
  clearanceLevel: 'LEVEL 4 (TOP SECRET / ADMISSIBLE DOSSIER)',
  email: 'dcp.crimebranch@delhipolice.gov.in',
  activeSessionId: 'SESS-DP-99210-CCTNS',
  lastLogin: '2026-09-15 14:05:10 IST'
};

export const mockEntities: Entity[] = [
  {
    id: 'ENT-PER-101',
    type: 'PERSON',
    name: 'Rajesh Kumar @ Raju Dwarka',
    subtitle: 'High Centrality Inter-State Syndicate Hub',
    riskScore: 88,
    riskLevel: 'HIGH',
    neutralTerm: 'Person of Interest (Bridge Node)',
    centrality: {
      degreeCentrality: 0.85,
      betweennessCentrality: 0.92,
      closenessCentrality: 0.78,
      eigenvectorCentrality: 0.89,
      communityId: 1,
      connectionCount: 14
    },
    associatedCases: ['FIR-42/2026', 'FIR-108/2026', 'FIR-215/2026'],
    attributes: {
      'Primary Alias': 'Raju Dwarka',
      'Known Hub': 'Dwarka Sector 21, New Delhi',
      'Associated Vehicles': 2,
      'Active CDR Lines': 3,
      'CCTNS Record Date': '2026-02-12'
    },
    riskIndicators: [
      'Appears in 3 interconnected Delhi Police FIR records across Special Cell & Crime Branch',
      'High Betweenness Centrality (0.92) - links West Delhi ring to NCR interstate transport',
      'Bursts in CDR frequency with +91-98110-10001 following Special Cell raid',
      'Co-located at DND Toll Plaza during ANPR surveillance window'
    ],
    xaiReasoning: [
      'Direct communication channel with Phone X (+91-98110-10001) verified in Delhi CDR dumps',
      'Vehicle DL-01-AB-1234 registered under associated firm Apex Transport Delhi Pvt Ltd',
      'Shared geofence coordinates detected with Person B (Amit Verma) on 3 separate dates'
    ],
    createdDate: '2026-02-10',
    lastActive: '2026-09-15 12:15'
  },
  {
    id: 'ENT-PER-102',
    type: 'PERSON',
    name: 'Amit Verma @ Amit CP',
    subtitle: 'Connaught Place Financial Operations Manager',
    riskScore: 74,
    riskLevel: 'HIGH',
    neutralTerm: 'Associated Entity',
    centrality: {
      degreeCentrality: 0.65,
      betweennessCentrality: 0.71,
      closenessCentrality: 0.62,
      eigenvectorCentrality: 0.68,
      communityId: 1,
      connectionCount: 9
    },
    associatedCases: ['FIR-42/2026', 'FIR-108/2026'],
    attributes: {
      'Known Location': 'Barakhamba Road, Connaught Place',
      'Bank Account': 'HDFC-0012****99',
      'Firm': 'VNS Trading CP'
    },
    riskIndicators: [
      'Shared CDR call history with Phone X (+91-98110-10001)',
      'Multiple structured RTGS transfers to shell firm VNS Trading CP'
    ],
    xaiReasoning: [
      'Extracted from FIR-108/2026 transcript line L45',
      'CDR match with Rajesh Kumar on 2026-08-10'
    ],
    createdDate: '2026-04-05',
    lastActive: '2026-09-15 09:30'
  },
  {
    id: 'ENT-PER-103',
    type: 'PERSON',
    name: 'Vikram Singh @ Vicky South',
    subtitle: 'Logistics Supervisor (NCR Transport)',
    riskScore: 52,
    riskLevel: 'MEDIUM',
    neutralTerm: 'Connected Node',
    centrality: {
      degreeCentrality: 0.42,
      betweennessCentrality: 0.35,
      closenessCentrality: 0.48,
      eigenvectorCentrality: 0.40,
      communityId: 2,
      connectionCount: 5
    },
    associatedCases: ['FIR-108/2026'],
    attributes: {
      'Location': 'Okhla Industrial Estate, Phase III',
      'Role': 'Freight Facilitator'
    },
    riskIndicators: [
      'Registered driver for vehicle DL-02-CD-5678',
      'Connected to DND Flyway Toll checkpoint'
    ],
    xaiReasoning: [
      'Identified via ANPR camera records linked to Vehicle Z'
    ],
    createdDate: '2026-06-18',
    lastActive: '2026-09-12 18:40'
  },
  {
    id: 'ENT-PHN-201',
    type: 'PHONE',
    name: '+91-98110-10001',
    subtitle: 'Airtel Delhi NCR Primary Identifier',
    riskScore: 92,
    riskLevel: 'CRITICAL',
    neutralTerm: 'High-Risk Communication Hub',
    centrality: {
      degreeCentrality: 0.94,
      betweennessCentrality: 0.88,
      closenessCentrality: 0.82,
      eigenvectorCentrality: 0.91,
      communityId: 1,
      connectionCount: 22
    },
    associatedCases: ['FIR-42/2026', 'FIR-108/2026', 'FIR-215/2026'],
    attributes: {
      'Service Provider': 'Airtel India (Delhi NCR)',
      'Primary Tower Area': 'Dwarka & CP Corridor',
      'Total Calls Logged': 1420,
      'Night Activity Index': '82%'
    },
    riskIndicators: [
      'Bridge identifier connecting 5 key individuals across Special Cell files',
      'Burner phone behavioral pattern (no daytime personal calls)',
      'Cross-case link across FIR-42/2026 and FIR-108/2026'
    ],
    xaiReasoning: [
      'Found in 4 separate CDR dumps submitted by Telecom Cell'
    ],
    createdDate: '2026-01-15',
    lastActive: '2026-09-15 11:02'
  },
  {
    id: 'ENT-PHN-202',
    type: 'PHONE',
    name: '+91-98711-20002',
    subtitle: 'Secondary Dispatch Contact (Jio Delhi)',
    riskScore: 61,
    riskLevel: 'MEDIUM',
    neutralTerm: 'Associated Contact Line',
    centrality: {
      degreeCentrality: 0.45,
      betweennessCentrality: 0.38,
      closenessCentrality: 0.51,
      eigenvectorCentrality: 0.44,
      communityId: 2,
      connectionCount: 6
    },
    associatedCases: ['FIR-215/2026'],
    attributes: {
      'Service Provider': 'Reliance Jio (South Delhi)',
      'Subscriber': 'VNS Trading Office'
    },
    riskIndicators: [
      'Frequent contact with Vikram Singh during nocturnal hours'
    ],
    xaiReasoning: [
      'Extracted from CDR analysis report for FIR-215/2026'
    ],
    createdDate: '2026-05-20',
    lastActive: '2026-09-13 14:10'
  },
  {
    id: 'ENT-VEH-301',
    type: 'VEHICLE',
    name: 'DL-01-AB-1234',
    subtitle: 'Mahindra Scorpio Black (Delhi RTO)',
    riskScore: 82,
    riskLevel: 'HIGH',
    neutralTerm: 'Associated Transport Entity',
    centrality: {
      degreeCentrality: 0.70,
      betweennessCentrality: 0.65,
      closenessCentrality: 0.60,
      eigenvectorCentrality: 0.72,
      communityId: 1,
      connectionCount: 8
    },
    associatedCases: ['FIR-42/2026', 'FIR-108/2026'],
    attributes: {
      'RTO Registration': 'Delhi Central RTO (DL-01)',
      'Registered Owner': 'Apex Transport Delhi Pvt Ltd',
      'ANPR Detections': '42 Toll Checks',
      'Chassis No': 'MAH-SCORP-DL991'
    },
    riskIndicators: [
      'Automated Number Plate Recognition (ANPR) match at DND Flyway & Gurugram Border during incident timestamps',
      'Linked to both Rajesh Kumar and Apex Transport Delhi Pvt Ltd'
    ],
    xaiReasoning: [
      'Camera snapshot ANPR-DND-881 verified against FIR-42/2026 timeline'
    ],
    createdDate: '2026-02-14',
    lastActive: '2026-09-15 07:15'
  },
  {
    id: 'ENT-VEH-302',
    type: 'VEHICLE',
    name: 'DL-02-CD-5678',
    subtitle: 'Tata Goods Container (Delhi North)',
    riskScore: 58,
    riskLevel: 'MEDIUM',
    neutralTerm: 'Linked Logistics Vehicle',
    centrality: {
      degreeCentrality: 0.48,
      betweennessCentrality: 0.41,
      closenessCentrality: 0.50,
      eigenvectorCentrality: 0.46,
      communityId: 2,
      connectionCount: 6
    },
    associatedCases: ['FIR-108/2026', 'FIR-215/2026'],
    attributes: {
      'RTO': 'Delhi North RTO',
      'Owner': 'VNS Trading CP'
    },
    riskIndicators: [
      'Inter-state route overlap with NCR border checkpoints'
    ],
    xaiReasoning: [
      'Toll record analysis matching Vikram Singh'
    ],
    createdDate: '2026-04-12',
    lastActive: '2026-09-14 16:50'
  },
  {
    id: 'ENT-LOC-401',
    type: 'LOCATION',
    name: 'Dwarka Sector 21 Junction',
    subtitle: 'West Delhi Transit & Command Coordinates',
    riskScore: 75,
    riskLevel: 'HIGH',
    neutralTerm: 'Identified Co-location Site',
    centrality: {
      degreeCentrality: 0.88,
      betweennessCentrality: 0.79,
      closenessCentrality: 0.84,
      eigenvectorCentrality: 0.85,
      communityId: 1,
      connectionCount: 16
    },
    associatedCases: ['FIR-42/2026', 'FIR-215/2026'],
    attributes: {
      'GPS Coordinates': '28.5522° N, 77.0588° E',
      'Cell Tower IDs': 'BTS-DEL-901 / BTS-DEL-902',
      'District': 'South West Delhi'
    },
    riskIndicators: [
      'Frequent co-presence of Rajesh Kumar and Phone X',
      'Location mentioned in FIR-42/2026 Special Cell seizure memo'
    ],
    xaiReasoning: [
      'Cell tower triangulation data overlay'
    ],
    createdDate: '2026-01-10',
    lastActive: '2026-09-15 12:00'
  },
  {
    id: 'ENT-LOC-402',
    type: 'LOCATION',
    name: 'DND Expressway Toll Plaza',
    subtitle: 'Noida-Delhi Interstate Corridor',
    riskScore: 71,
    riskLevel: 'HIGH',
    neutralTerm: 'Transit Rendezvous Point',
    centrality: {
      degreeCentrality: 0.76,
      betweennessCentrality: 0.82,
      closenessCentrality: 0.70,
      eigenvectorCentrality: 0.74,
      communityId: 1,
      connectionCount: 11
    },
    associatedCases: ['FIR-108/2026'],
    attributes: {
      'GPS Coordinates': '28.5688° N, 77.2911° E',
      'District': 'East / South East Delhi Border'
    },
    riskIndicators: [
      'Key bridge location between Dwarka cluster and Noida transit cluster'
    ],
    xaiReasoning: [
      'Location extracted from surveillance notes'
    ],
    createdDate: '2026-03-01',
    lastActive: '2026-09-14 20:30'
  },
  {
    id: 'ENT-ORG-501',
    type: 'ORGANIZATION',
    name: 'Apex Transport Delhi Pvt Ltd',
    subtitle: 'Shell Registered Entity (Barakhamba Road)',
    riskScore: 85,
    riskLevel: 'HIGH',
    neutralTerm: 'Associated Corporate Entity',
    centrality: {
      degreeCentrality: 0.79,
      betweennessCentrality: 0.74,
      closenessCentrality: 0.71,
      eigenvectorCentrality: 0.78,
      communityId: 1,
      connectionCount: 10
    },
    associatedCases: ['FIR-42/2026', 'FIR-108/2026'],
    attributes: {
      'CIN Registration': 'U60231DL2024PTC099812',
      'Registered Address': 'Statesman House, Barakhamba Road, Connaught Place',
      'Bank Account': 'HDFC-0012****88',
      'Reported Directors': 'Rajesh Kumar / Suresh Prasad'
    },
    riskIndicators: [
      'Registered owner of vehicle DL-01-AB-1234',
      'Financial transfers flagged in FIU-IND transaction analytics'
    ],
    xaiReasoning: [
      'Corporate MCA database lookup match with Special Cell entities'
    ],
    createdDate: '2026-02-01',
    lastActive: '2026-09-15 10:00'
  },
  {
    id: 'ENT-ORG-502',
    type: 'ORGANIZATION',
    name: 'VNS Trading CP',
    subtitle: 'Trading Unit (Connaught Place)',
    riskScore: 60,
    riskLevel: 'MEDIUM',
    neutralTerm: 'Connected Business Unit',
    centrality: {
      degreeCentrality: 0.52,
      betweennessCentrality: 0.44,
      closenessCentrality: 0.55,
      eigenvectorCentrality: 0.49,
      communityId: 2,
      connectionCount: 7
    },
    associatedCases: ['FIR-108/2026', 'FIR-215/2026'],
    attributes: {
      'GSTIN': '07AAAAA0000A1Z5',
      'Location': 'Connaught Circus, New Delhi'
    },
    riskIndicators: [
      'Holds registered ownership for vehicle DL-02-CD-5678'
    ],
    xaiReasoning: [
      'Identified in FIR-215/2026 financial trail'
    ],
    createdDate: '2026-05-15',
    lastActive: '2026-09-13 16:15'
  }
];

export const mockRelationships: Relationship[] = [
  {
    id: 'REL-101',
    source: 'ENT-PER-101',
    target: 'ENT-PHN-201',
    type: 'COMMUNICATED_WITH',
    label: 'Primary Line (412 Calls)',
    weight: 9,
    timestamp: '2026-09-14',
    firId: 'FIR-42/2026',
    frequency: 412,
    details: 'Heavy midnight calling activity logged in Special Cell CDR dump 4581'
  },
  {
    id: 'REL-102',
    source: 'ENT-PHN-201',
    target: 'ENT-PER-102',
    type: 'COMMUNICATED_WITH',
    label: 'Relayed Link (185 Calls)',
    weight: 7,
    timestamp: '2026-09-14',
    firId: 'FIR-108/2026',
    frequency: 185,
    details: 'Cross-district communications matching incident dates'
  },
  {
    id: 'REL-103',
    source: 'ENT-PER-101',
    target: 'ENT-VEH-301',
    type: 'VEHICLE_LINKED',
    label: 'Frequent Driver / ANPR Match',
    weight: 8,
    timestamp: '2026-09-12',
    firId: 'FIR-42/2026',
    details: 'Driver recognized at toll check during FIR-42 timeline'
  },
  {
    id: 'REL-104',
    source: 'ENT-VEH-301',
    target: 'ENT-LOC-402',
    type: 'SHARED_LOCATION',
    label: 'Toll & GPS Check (DND)',
    weight: 8,
    timestamp: '2026-09-11',
    firId: 'FIR-108/2026',
    details: 'ANPR capture at DND Expressway camera'
  },
  {
    id: 'REL-105',
    source: 'ENT-LOC-402',
    target: 'ENT-PER-102',
    type: 'SHARED_LOCATION',
    label: 'Resident / Hub Co-presence',
    weight: 6,
    timestamp: '2026-09-10',
    firId: 'FIR-108/2026'
  },
  {
    id: 'REL-106',
    source: 'ENT-PER-101',
    target: 'ENT-ORG-501',
    type: 'ORGANIZATION_LINKED',
    label: 'Managing Director / Signatory',
    weight: 9,
    firId: 'FIR-42/2026',
    details: 'Listed as key executive in MCA filing'
  },
  {
    id: 'REL-107',
    source: 'ENT-ORG-501',
    target: 'ENT-LOC-401',
    type: 'SHARED_LOCATION',
    label: 'Dwarka Operational Base',
    weight: 7,
    firId: 'FIR-42/2026'
  },
  {
    id: 'REL-108',
    source: 'ENT-PER-102',
    target: 'ENT-ORG-502',
    type: 'FINANCIAL_TRANSACTION',
    label: 'Hawala Transfer (₹18.5 Lakhs)',
    weight: 8,
    firId: 'FIR-108/2026',
    details: 'Multiple structured RTGS transfers flagged by FIU-IND'
  },
  {
    id: 'REL-109',
    source: 'ENT-ORG-502',
    target: 'ENT-PER-103',
    type: 'ORGANIZATION_LINKED',
    label: 'Transport Supervisor',
    weight: 5,
    firId: 'FIR-215/2026'
  },
  {
    id: 'REL-110',
    source: 'ENT-PER-103',
    target: 'ENT-PHN-202',
    type: 'COMMUNICATED_WITH',
    label: 'Field Line (94 Calls)',
    weight: 6,
    firId: 'FIR-215/2026'
  },
  {
    id: 'REL-111',
    source: 'ENT-PER-103',
    target: 'ENT-VEH-302',
    type: 'VEHICLE_LINKED',
    label: 'Registered Driver',
    weight: 6,
    firId: 'FIR-215/2026'
  }
];

export const mockCases: CaseFile[] = [
  {
    id: 'CASE-1024',
    firNumber: 'FIR-42/2026 Special Cell',
    title: 'Delhi NCR Hawala Routing & Cyber Financial Syndicate',
    policeStation: 'Special Cell PS, Lodhi Road, New Delhi',
    date: '2026-03-15',
    location: 'Connaught Place & Dwarka Sector 21',
    ipcSections: ['IPC 420', 'IPC 120B', 'IT Act Sec 66D', 'BNS 318(4)'],
    bnsSections: ['BNS 318(4)', 'BNS 111 Organized Crime'],
    status: 'ACTIVE_INVESTIGATION',
    assignedOfficer: 'DCP Vikramaditya Sharma, IPS',
    entityCount: 12,
    summary: 'Special Cell investigation into large-scale illegal money routing across Delhi NCR corridors using shell transport companies and burner communications.',
    evidenceItems: ['EVD-8801', 'EVD-8802', 'EVD-8805'],
    riskRating: 'HIGH'
  },
  {
    id: 'CASE-1087',
    firNumber: 'FIR-108/2026 Crime Branch',
    title: 'Inter-State Luxury Vehicle Theft & Smuggling Gang',
    policeStation: 'Crime Branch PS, Chanakyapuri, New Delhi',
    date: '2026-05-02',
    location: 'DND Flyway & Gurugram Border Checkpoint',
    ipcSections: ['IPC 379', 'IPC 411', 'BNS 303'],
    bnsSections: ['BNS 303(2)', 'BNS 317(2)'],
    status: 'ACTIVE_INVESTIGATION',
    assignedOfficer: 'ACP Ananya Sen',
    entityCount: 9,
    summary: 'Smuggling operation along Delhi National Highway involving coordinated vehicle swaps and shared communication nodes.',
    evidenceItems: ['EVD-8803', 'EVD-8804'],
    riskRating: 'HIGH'
  },
  {
    id: 'CASE-1132',
    firNumber: 'FIR-215/2026 Special Cell',
    title: 'Trans-National VoIP & Counterfeit Syndicate',
    policeStation: 'Dwarka Sector 23 PS, Delhi',
    date: '2026-07-19',
    location: 'Okhla Industrial Phase III',
    ipcSections: ['IPC 468', 'IPC 471', 'BNS 336'],
    bnsSections: ['BNS 336', 'BNS 61'],
    status: 'UNDER_REVIEW',
    assignedOfficer: 'Inspector R.K. Sharma',
    entityCount: 7,
    summary: 'Warehouse logistics network utilizing fraudulent GST registrations and secondary phone dispatches.',
    evidenceItems: ['EVD-8806'],
    riskRating: 'MEDIUM'
  }
];

export const mockAlerts: AlertItem[] = [
  {
    id: 'ALT-9901',
    severity: 'HIGH',
    patternName: 'Cross-Case Phone Co-Occurrence',
    title: 'Suspicious Cross-Case Communication Hub Flagged',
    description: 'Person of Interest Rajesh Kumar and Associated Entity Amit Verma are linked via Phone X (+91-98110-10001) across FIR-42 Special Cell and FIR-108 Crime Branch.',
    entitiesInvolved: [
      { id: 'ENT-PER-101', name: 'Rajesh Kumar', type: 'PERSON' },
      { id: 'ENT-PER-102', name: 'Amit Verma', type: 'PERSON' },
      { id: 'ENT-PHN-201', name: '+91-98110-10001', type: 'PHONE' }
    ],
    relatedCases: ['FIR-42/2026', 'FIR-108/2026'],
    detectedTime: '10 minutes ago (2026-09-15 13:40)',
    reason: 'Graph analytics detected a High Betweenness Centrality node (+91-98110-10001) bridging Special Cell and Crime Branch case files.',
    status: 'UNREVIEWED',
    evidenceReferences: ['FIR-42/2026 (L42)', 'CDR-4581 (Airtel)', 'ANPR-DND-881'],
    xaiConfidence: 89.4
  },
  {
    id: 'ALT-9902',
    severity: 'HIGH',
    patternName: 'Geographic Co-Location Anomaly',
    title: 'Co-Location Detected at DND Flyway Toll',
    description: 'Vehicle DL-01-AB-1234 and Person of Interest Rajesh Kumar recorded simultaneous presence near DND Flyway Plaza.',
    entitiesInvolved: [
      { id: 'ENT-PER-101', name: 'Rajesh Kumar', type: 'PERSON' },
      { id: 'ENT-VEH-301', name: 'DL-01-AB-1234', type: 'VEHICLE' },
      { id: 'ENT-LOC-402', name: 'DND Expressway Toll Plaza', type: 'LOCATION' }
    ],
    relatedCases: ['FIR-108/2026'],
    detectedTime: '1 hour ago (2026-09-15 12:45)',
    reason: 'Spatial-temporal matching engine confirmed ANPR timestamp alignment with CDR tower sector ping within 80m radius.',
    status: 'UNDER_INVESTIGATION',
    evidenceReferences: ['ANPR Toll Log #9902', 'BTS Tower GPS Feed'],
    xaiConfidence: 93.1
  },
  {
    id: 'ALT-9903',
    severity: 'MEDIUM',
    patternName: 'Rapid Financial Transfer Spike',
    title: 'Structured Hawala Routing Alert',
    description: 'Apex Transport Delhi executed 4 rapid transactions below ₹5 Lakhs threshold to VNS Trading CP.',
    entitiesInvolved: [
      { id: 'ENT-ORG-501', name: 'Apex Transport Delhi Pvt Ltd', type: 'ORGANIZATION' },
      { id: 'ENT-ORG-502', name: 'VNS Trading CP', type: 'ORGANIZATION' }
    ],
    relatedCases: ['FIR-42/2026', 'FIR-215/2026'],
    detectedTime: '4 hours ago',
    reason: 'Anomaly detection algorithm flagged smurfing transaction pattern across inter-firm bank accounts.',
    status: 'UNREVIEWED',
    evidenceReferences: ['FIU-IND Alert #7712', 'Bank Statement HDFC-88'],
    xaiConfidence: 84.7
  },
  {
    id: 'ALT-9904',
    severity: 'LOW',
    patternName: 'New Sub-Graph Connection',
    title: 'Secondary Logistics Vehicle Linked',
    description: 'Vehicle DL-02-CD-5678 added to Okhla sub-network.',
    entitiesInvolved: [
      { id: 'ENT-VEH-302', name: 'DL-02-CD-5678', type: 'VEHICLE' },
      { id: 'ENT-PER-103', name: 'Vikram Singh', type: 'PERSON' }
    ],
    relatedCases: ['FIR-215/2026'],
    detectedTime: '1 day ago',
    reason: 'RTO database sync match with supervisor name.',
    status: 'VERIFIED',
    evidenceReferences: ['RTO Verification Certificate #441'],
    xaiConfidence: 96.0
  }
];

export const mockEvidenceItems: EvidenceItem[] = [
  {
    id: 'EVD-8801',
    caseId: 'FIR-42/2026',
    title: 'Original Special Cell FIR Document (Signed Copy)',
    type: 'FIR_DOCUMENT',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    timestamp: '2026-03-15 10:30:00',
    recordedBy: 'DCP Vikramaditya Sharma, IPS (DP-IPS-8849)',
    integrityStatus: 'VERIFIED',
    blockchainTxHash: '0x9a8f7c6b5a4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c',
    blockNumber: 4891024,
    fileSize: '4.2 MB',
    fileFormat: 'PDF / OCR Text Extracted',
    auditTrail: [
      { timestamp: '2026-03-15 10:30', action: 'Uploaded to Delhi Police CCTNS Ledger', user: 'DCP Vikramaditya Sharma' },
      { timestamp: '2026-03-15 10:31', action: 'SHA-256 Digest Anchored to Ledger', user: 'Automated System Node' },
      { timestamp: '2026-09-15 13:00', action: 'Integrity Verification Check Passed', user: 'Security Daemon' }
    ]
  },
  {
    id: 'EVD-8802',
    caseId: 'FIR-42/2026',
    title: 'CDR Master Dump (Airtel & Jio Delhi Corridor)',
    type: 'CDR_DUMP',
    hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    timestamp: '2026-03-18 14:15:22',
    recordedBy: 'Delhi Telecom Intelligence Cell (ACP A. Kumar)',
    integrityStatus: 'VERIFIED',
    blockchainTxHash: '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0',
    blockNumber: 4892110,
    fileSize: '18.6 MB',
    fileFormat: 'CSV / 14,200 Rows',
    auditTrail: [
      { timestamp: '2026-03-18 14:15', action: 'Received via Encrypted Cyber Portal', user: 'ACP A. Kumar' },
      { timestamp: '2026-03-18 14:16', action: 'Hashed & Sealed', user: 'Delhi Police Vault' }
    ]
  },
  {
    id: 'EVD-8803',
    caseId: 'FIR-108/2026',
    title: 'DND Expressway Toll Camera ANPR Logs',
    type: 'SURVEILLANCE_NOTE',
    hash: '7f83b1657ff1fc53b92dc18148a1d65dfc61dd3000861ed7302f3069a19c1619',
    timestamp: '2026-05-03 09:10:00',
    recordedBy: 'ACP Ananya Sen',
    integrityStatus: 'VERIFIED',
    blockchainTxHash: '0x8899aabbccddeeff00112233445566778899aabbccddeeff0011223344556677',
    blockNumber: 4912004,
    fileSize: '1.8 MB',
    fileFormat: 'JSON / Image Metadata',
    auditTrail: [
      { timestamp: '2026-05-03 09:10', action: 'Hashed & Verified against DND Toll Feed', user: 'ACP Ananya Sen' }
    ]
  },
  {
    id: 'EVD-8804',
    caseId: 'FIR-108/2026',
    title: 'Bank Statement - FIU Hawala Seizure Memo',
    type: 'FINANCIAL_STATEMENT',
    hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    timestamp: '2026-05-10 16:45:00',
    recordedBy: 'Financial Intelligence Unit (FIU-IND)',
    integrityStatus: 'VERIFIED',
    blockchainTxHash: '0xccbbaa99887766554433221100ffeeddccbbaa99887766554433221100ffeedd',
    blockNumber: 4915430,
    fileSize: '8.4 MB',
    fileFormat: 'PDF / Verified Watermark',
    auditTrail: [
      { timestamp: '2026-05-10 16:45', action: 'Uploaded to Case Evidence File', user: 'FIU-IND Officer' }
    ]
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'LOG-4401',
    timestamp: '2026-09-15 13:42:19',
    officerName: 'DCP Vikramaditya Sharma, IPS',
    officerBadge: 'DP-IPS-8849',
    action: 'VIEW_ENTITY_DOSSIER',
    target: 'Rajesh Kumar @ Raju Dwarka (ENT-PER-101)',
    ipAddress: '10.14.202.89 (Delhi Police VPN)',
    status: 'SUCCESS',
    details: 'Viewed entity profile, link reasoning graph, and associated FIR connections.'
  },
  {
    id: 'LOG-4402',
    timestamp: '2026-09-15 13:20:05',
    officerName: 'DCP Vikramaditya Sharma, IPS',
    officerBadge: 'DP-IPS-8849',
    action: 'UPLOAD_CRIME_DATA',
    target: 'FIR-42_Special_Cell_CDR_Sept.csv',
    ipAddress: '10.14.202.89',
    status: 'SUCCESS',
    details: 'Executed CCTNS automated parsing pipeline (Entities: 14, Triples: 22).'
  },
  {
    id: 'LOG-4403',
    timestamp: '2026-09-15 12:15:44',
    officerName: 'ACP Ananya Sen',
    officerBadge: 'DP-2099',
    action: 'VERIFY_EVIDENCE_HASH',
    target: 'EVD-8801 (Special Cell FIR-42 Document)',
    ipAddress: '10.14.180.12',
    status: 'SUCCESS',
    details: 'CCTNS SHA-256 ledger match confirmed (Block #4891024).'
  },
  {
    id: 'LOG-4404',
    timestamp: '2026-09-15 11:04:10',
    officerName: 'Inspector R.K. Sharma',
    officerBadge: 'DP-3104',
    action: 'EXPORT_NETWORK_SUBGRAPH',
    target: 'Cross-Case Cluster Special Cell <-> Crime Branch',
    ipAddress: '10.14.195.44',
    status: 'SUCCESS',
    details: 'Exported encrypted intelligence briefing document for judicial clearance.'
  }
];

export const mockCrossCaseLinks: CrossCaseLink[] = [
  {
    id: 'CCL-01',
    caseA: 'FIR-42/2026 Special Cell',
    caseB: 'FIR-108/2026 Crime Branch',
    sharedPersons: 2,
    sharedPhones: 1,
    sharedVehicles: 1,
    sharedLocations: 1,
    sharedOrganizations: 1,
    strengthScore: 92,
    entities: [
      { id: 'ENT-PER-101', name: 'Rajesh Kumar @ Raju Dwarka', type: 'PERSON' },
      { id: 'ENT-PER-102', name: 'Amit Verma @ Amit CP', type: 'PERSON' },
      { id: 'ENT-PHN-201', name: '+91-98110-10001', type: 'PHONE' },
      { id: 'ENT-VEH-301', name: 'DL-01-AB-1234', type: 'VEHICLE' },
      { id: 'ENT-ORG-501', name: 'Apex Transport Delhi Pvt Ltd', type: 'ORGANIZATION' }
    ]
  },
  {
    id: 'CCL-02',
    caseA: 'FIR-108/2026 Crime Branch',
    caseB: 'FIR-215/2026 Special Cell',
    sharedPersons: 1,
    sharedPhones: 1,
    sharedVehicles: 1,
    sharedLocations: 1,
    sharedOrganizations: 1,
    strengthScore: 68,
    entities: [
      { id: 'ENT-PER-103', name: 'Vikram Singh', type: 'PERSON' },
      { id: 'ENT-VEH-302', name: 'DL-02-CD-5678', type: 'VEHICLE' },
      { id: 'ENT-ORG-502', name: 'VNS Trading CP', type: 'ORGANIZATION' }
    ]
  },
  {
    id: 'CCL-03',
    caseA: 'FIR-42/2026 Special Cell',
    caseB: 'FIR-215/2026 Special Cell',
    sharedPersons: 1,
    sharedPhones: 1,
    sharedVehicles: 0,
    sharedLocations: 1,
    sharedOrganizations: 1,
    strengthScore: 54,
    entities: [
      { id: 'ENT-PER-101', name: 'Rajesh Kumar @ Raju Dwarka', type: 'PERSON' },
      { id: 'ENT-LOC-401', name: 'Dwarka Sector 21 Junction', type: 'LOCATION' }
    ]
  }
];

export const mockAnalysisSummary: AnalysisSummary = {
  caseId: 'FIR-42/2026 Special Cell',
  fileUploaded: 'Special_Cell_FIR_42_Dwarka_Report.pdf',
  extractedEntitiesCount: 12,
  extractedRelationshipsCount: 18,
  communitiesDetected: 2,
  overallAnomalyScore: 88.4,
  keyInsights: [
    'Multiple cross-case relationships identified connecting Dwarka Hawala syndicate to DND Expressway smuggling corridor.',
    'Phone number +91-98110-10001 acts as the central communication bridge across 3 separate Delhi Police FIR records.',
    'Apex Transport Delhi Pvt Ltd identified as primary shell corporate entity facilitating vehicle registrations and financial transfers.',
    'Anomaly detection algorithm flagged a 340% surge in midnight call volume following Special Cell raid.'
  ],
  extractedTriplets: [
    { subject: 'Rajesh Kumar', predicate: 'OPERATES_COMMUNICATION_HUB', object: '+91-98110-10001', confidence: 0.96 },
    { subject: '+91-98110-10001', predicate: 'RELAYED_CALL_TO', object: 'Amit Verma', confidence: 0.92 },
    { subject: 'Rajesh Kumar', predicate: 'MANAGING_DIRECTOR_OF', object: 'Apex Transport Delhi Pvt Ltd', confidence: 0.98 },
    { subject: 'Apex Transport Delhi Pvt Ltd', predicate: 'REGISTERED_OWNER_OF', object: 'DL-01-AB-1234', confidence: 0.99 },
    { subject: 'DL-01-AB-1234', predicate: 'CO_LOCATED_AT', object: 'DND Expressway Toll Plaza', confidence: 0.91 }
  ],
  recommendedSteps: [
    'Issue judicial production warrant for CDR logs of +91-98110-10001.',
    'Initiate financial freeze under PMLA Act on HDFC Bank Account linked to Apex Transport Delhi Pvt Ltd.',
    'Conduct joint inter-district coordination check with Noida & Gurugram Police Divisions.',
    'Verify CCTNS SHA-256 evidence integrity hash before submitting final charge sheet.'
  ]
};
