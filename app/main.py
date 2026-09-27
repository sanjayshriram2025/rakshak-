import uvicorn
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import time

app = FastAPI(
    title="RAKSHAK Delhi Police Crime Branch Intelligence REST API",
    description="Central CCTNS REST Backend for Crime Branch & Special Cell Linkage Engine",
    version="2.4.0"
)

# Enable CORS for frontend Vite dev server (http://localhost:5173, 5174, 5175, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Datasets
MOCK_USER = {
    "id": "USR-DP-8849",
    "badgeNumber": "DP-IPS-8849",
    "name": "Vikramaditya Sharma, IPS",
    "rank": "Deputy Commissioner of Police (DCP)",
    "department": "Delhi Police Crime Branch & Special Cell",
    "clearanceLevel": "LEVEL 4 (TOP SECRET / ADMISSIBLE DOSSIER)",
    "email": "dcp.crimebranch@delhipolice.gov.in",
    "activeSessionId": "SESS-DP-99210-CCTNS",
    "lastLogin": "2026-09-16 14:05:10 IST"
}

MOCK_ENTITIES = [
    {
        "id": "ENT-PER-101",
        "type": "PERSON",
        "name": "Rajesh Kumar @ Raju Dwarka",
        "subtitle": "High Centrality Inter-State Syndicate Hub",
        "riskScore": 88,
        "riskLevel": "HIGH",
        "neutralTerm": "Person of Interest (Bridge Node)",
        "centrality": {
            "degreeCentrality": 0.85,
            "betweennessCentrality": 0.92,
            "closenessCentrality": 0.78,
            "eigenvectorCentrality": 0.89,
            "communityId": 1,
            "connectionCount": 14
        },
        "associatedCases": ["FIR-42/2026", "FIR-108/2026", "FIR-215/2026"],
        "attributes": {
            "Primary Alias": "Raju Dwarka",
            "Known Hub": "Dwarka Sector 21, New Delhi",
            "Associated Vehicles": 2,
            "Active CDR Lines": 3,
            "CCTNS Record Date": "2026-02-12"
        },
        "riskIndicators": [
            "Appears in 3 interconnected Delhi Police FIR records across Special Cell & Crime Branch",
            "High Betweenness Centrality (0.92) - links West Delhi ring to NCR interstate transport",
            "Bursts in CDR frequency with +91-98110-10001 following Special Cell raid",
            "Co-located at DND Toll Plaza during ANPR surveillance window"
        ],
        "xaiReasoning": [
            "Direct communication channel with Phone X (+91-98110-10001) verified in Delhi CDR dumps",
            "Vehicle DL-01-AB-1234 registered under associated firm Apex Transport Delhi Pvt Ltd",
            "Shared geofence coordinates detected with Person B (Amit Verma) on 3 separate dates"
        ],
        "createdDate": "2026-02-10",
        "lastActive": "2026-09-15 12:15"
    },
    {
        "id": "ENT-PER-102",
        "type": "PERSON",
        "name": "Amit Verma @ Amit CP",
        "subtitle": "Connaught Place Financial Operations Manager",
        "riskScore": 74,
        "riskLevel": "HIGH",
        "neutralTerm": "Associated Entity",
        "centrality": {
            "degreeCentrality": 0.65,
            "betweennessCentrality": 0.71,
            "closenessCentrality": 0.62,
            "eigenvectorCentrality": 0.68,
            "communityId": 1,
            "connectionCount": 9
        },
        "associatedCases": ["FIR-42/2026", "FIR-108/2026"],
        "attributes": {
            "Known Location": "Barakhamba Road, Connaught Place",
            "Bank Account": "HDFC-0012****99",
            "Firm": "VNS Trading CP"
        },
        "riskIndicators": [
            "Shared CDR call history with Phone X (+91-98110-10001)",
            "Multiple structured RTGS transfers to shell firm VNS Trading CP"
        ],
        "xaiReasoning": [
            "Extracted from FIR-108/2026 transcript line L45",
            "CDR match with Rajesh Kumar on 2026-08-10"
        ],
        "createdDate": "2026-04-05",
        "lastActive": "2026-09-15 09:30"
    },
    {
        "id": "ENT-PHN-201",
        "type": "PHONE",
        "name": "+91-98110-10001",
        "subtitle": "Airtel Delhi NCR Primary Identifier",
        "riskScore": 92,
        "riskLevel": "CRITICAL",
        "neutralTerm": "High-Risk Communication Hub",
        "centrality": {
            "degreeCentrality": 0.94,
            "betweennessCentrality": 0.88,
            "closenessCentrality": 0.82,
            "eigenvectorCentrality": 0.91,
            "communityId": 1,
            "connectionCount": 22
        },
        "associatedCases": ["FIR-42/2026", "FIR-108/2026", "FIR-215/2026"],
        "attributes": {
            "Service Provider": "Airtel India (Delhi NCR)",
            "Primary Tower Area": "Dwarka & CP Corridor",
            "Total Calls Logged": 1420,
            "Night Activity Index": "82%"
        },
        "riskIndicators": [
            "Bridge identifier connecting 5 key individuals across Special Cell files",
            "Burner phone behavioral pattern (no daytime personal calls)",
            "Cross-case link across FIR-42/2026 and FIR-108/2026"
        ],
        "xaiReasoning": [
            "Found in 4 separate CDR dumps submitted by Telecom Cell"
        ],
        "createdDate": "2026-01-15",
        "lastActive": "2026-09-15 11:02"
    },
    {
        "id": "ENT-VEH-301",
        "type": "VEHICLE",
        "name": "DL-01-AB-1234",
        "subtitle": "Mahindra Scorpio Black (Delhi RTO)",
        "riskScore": 82,
        "riskLevel": "HIGH",
        "neutralTerm": "Associated Transport Entity",
        "centrality": {
            "degreeCentrality": 0.70,
            "betweennessCentrality": 0.65,
            "closenessCentrality": 0.60,
            "eigenvectorCentrality": 0.72,
            "communityId": 1,
            "connectionCount": 8
        },
        "associatedCases": ["FIR-42/2026", "FIR-108/2026"],
        "attributes": {
            "RTO Registration": "Delhi Central RTO (DL-01)",
            "Registered Owner": "Apex Transport Delhi Pvt Ltd",
            "ANPR Detections": "42 Toll Checks",
            "Chassis No": "MAH-SCORP-DL991"
        },
        "riskIndicators": [
            "Automated Number Plate Recognition (ANPR) match at DND Flyway & Gurugram Border during incident timestamps",
            "Linked to both Rajesh Kumar and Apex Transport Delhi Pvt Ltd"
        ],
        "xaiReasoning": [
            "Camera snapshot ANPR-DND-881 verified against FIR-42/2026 timeline"
        ],
        "createdDate": "2026-02-14",
        "lastActive": "2026-09-15 07:15"
    }
]

MOCK_RELATIONSHIPS = [
    {
        "id": "REL-101",
        "source": "ENT-PER-101",
        "target": "ENT-PHN-201",
        "type": "COMMUNICATED_WITH",
        "label": "Primary Line (412 Calls)",
        "weight": 9,
        "timestamp": "2026-09-14",
        "firId": "FIR-42/2026",
        "frequency": 412,
        "details": "Heavy midnight calling activity logged in Special Cell CDR dump 4581"
    },
    {
        "id": "REL-102",
        "source": "ENT-PHN-201",
        "target": "ENT-PER-102",
        "type": "COMMUNICATED_WITH",
        "label": "Relayed Link (185 Calls)",
        "weight": 7,
        "timestamp": "2026-09-14",
        "firId": "FIR-108/2026",
        "frequency": 185,
        "details": "Cross-district communications matching incident dates"
    },
    {
        "id": "REL-103",
        "source": "ENT-PER-101",
        "target": "ENT-VEH-301",
        "type": "VEHICLE_LINKED",
        "label": "Frequent Driver / ANPR Match",
        "weight": 8,
        "timestamp": "2026-09-12",
        "firId": "FIR-42/2026",
        "details": "Driver recognized at toll check during FIR-42 timeline"
    }
]

MOCK_CASES = [
    {
        "id": "CASE-1024",
        "firNumber": "FIR-42/2026 Special Cell",
        "title": "Delhi NCR Hawala Routing & Cyber Financial Syndicate",
        "policeStation": "Special Cell PS, Lodhi Road, New Delhi",
        "date": "2026-03-15",
        "location": "Connaught Place & Dwarka Sector 21",
        "ipcSections": ["IPC 420", "IPC 120B", "IT Act Sec 66D", "BNS 318(4)"],
        "bnsSections": ["BNS 318(4)", "BNS 111 Organized Crime"],
        "status": "ACTIVE_INVESTIGATION",
        "assignedOfficer": "DCP Vikramaditya Sharma, IPS",
        "entityCount": 12,
        "summary": "Special Cell investigation into large-scale illegal money routing across Delhi NCR corridors using shell transport companies and burner communications.",
        "evidenceItems": ["EVD-8801", "EVD-8802", "EVD-8805"],
        "riskRating": "HIGH"
    },
    {
        "id": "CASE-1087",
        "firNumber": "FIR-108/2026 Crime Branch",
        "title": "Inter-State Luxury Vehicle Theft & Smuggling Gang",
        "policeStation": "Crime Branch PS, Chanakyapuri, New Delhi",
        "date": "2026-05-02",
        "location": "DND Flyway & Gurugram Border Checkpoint",
        "ipcSections": ["IPC 379", "IPC 411", "BNS 303"],
        "bnsSections": ["BNS 303(2)", "BNS 317(2)"],
        "status": "ACTIVE_INVESTIGATION",
        "assignedOfficer": "ACP Ananya Sen",
        "entityCount": 9,
        "summary": "Smuggling operation along Delhi National Highway involving coordinated vehicle swaps and shared communication nodes.",
        "evidenceItems": ["EVD-8803", "EVD-8804"],
        "riskRating": "HIGH"
    }
]

MOCK_ALERTS = [
    {
        "id": "ALT-9901",
        "severity": "HIGH",
        "patternName": "Cross-Case Phone Co-Occurrence",
        "title": "Suspicious Cross-Case Communication Hub Flagged",
        "description": "Person of Interest Rajesh Kumar and Associated Entity Amit Verma are linked via Phone X (+91-98110-10001) across FIR-42 Special Cell and FIR-108 Crime Branch.",
        "entitiesInvolved": [
            { "id": "ENT-PER-101", "name": "Rajesh Kumar", "type": "PERSON" },
            { "id": "ENT-PER-102", "name": "Amit Verma", "type": "PERSON" },
            { "id": "ENT-PHN-201", "name": "+91-98110-10001", "type": "PHONE" }
        ],
        "relatedCases": ["FIR-42/2026", "FIR-108/2026"],
        "detectedTime": "10 minutes ago",
        "reason": "Graph analytics detected a High Betweenness Centrality node (+91-98110-10001) bridging Special Cell and Crime Branch case files.",
        "status": "UNREVIEWED",
        "evidenceReferences": ["FIR-42/2026 (L42)", "CDR-4581 (Airtel)", "ANPR-DND-881"],
        "xaiConfidence": 89.4
    }
]

MOCK_EVIDENCE = [
    {
        "id": "EVD-8801",
        "caseId": "FIR-42/2026",
        "title": "Original Special Cell FIR Document (Signed Copy)",
        "type": "FIR_DOCUMENT",
        "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        "timestamp": "2026-03-15 10:30:00",
        "recordedBy": "DCP Vikramaditya Sharma, IPS (DP-IPS-8849)",
        "integrityStatus": "VERIFIED",
        "blockchainTxHash": "0x9a8f7c6b5a4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c",
        "blockNumber": 4891024,
        "fileSize": "4.2 MB",
        "fileFormat": "PDF / OCR Text Extracted",
        "auditTrail": [
            { "timestamp": "2026-03-15 10:30", "action": "Uploaded to Delhi Police CCTNS Ledger", "user": "DCP Vikramaditya Sharma" },
            { "timestamp": "2026-03-15 10:31", "action": "SHA-256 Digest Anchored to Ledger", "user": "Automated System Node" }
        ]
    }
]

MOCK_AUDIT_LOGS = [
    {
        "id": "LOG-4401",
        "timestamp": "2026-09-16 14:00:19",
        "officerName": "DCP Vikramaditya Sharma, IPS",
        "officerBadge": "DP-IPS-8849",
        "action": "VIEW_ENTITY_DOSSIER",
        "target": "Rajesh Kumar @ Raju Dwarka (ENT-PER-101)",
        "ipAddress": "127.0.0.1 (Axios Client)",
        "status": "SUCCESS",
        "details": "Axios REST API call executed for entity dossier."
    }
]

class LoginRequest(BaseModel):
    officerId: str
    password: str

class AlertStatusUpdate(BaseModel):
    status: str

class VerifyHashRequest(BaseModel):
    evidenceId: str
    calculatedHash: str

# Endpoints Implementation
@app.get("/")
def read_root():
    return {
        "system": "RAKSHAK Delhi Police CCTNS Backend",
        "status": "ONLINE",
        "client": "Axios REST Client Enabled",
        "jurisdiction": "Delhi Police Crime Branch & Special Cell",
        "docs": "/docs"
    }

@app.post("/api/v1/auth/login")
def login(req: LoginRequest):
    return {
        "token": "jwt_delhi_police_axios_token_884910",
        "user": {
            **MOCK_USER,
            "badgeNumber": req.officerId if req.officerId.startswith("DP-") else "DP-IPS-8849"
        }
    }

@app.get("/api/v1/auth/me")
def get_me():
    return MOCK_USER

@app.get("/api/v1/cases")
def get_cases():
    return MOCK_CASES

@app.get("/api/v1/cases/{case_id}")
def get_case(case_id: str):
    for c in MOCK_CASES:
        if c["id"] == case_id or case_id in c["firNumber"]:
            return c
    return MOCK_CASES[0]

@app.get("/api/v1/entities")
def get_entities():
    return MOCK_ENTITIES

@app.get("/api/v1/entities/{entity_id}")
def get_entity(entity_id: str):
    for e in MOCK_ENTITIES:
        if e["id"] == entity_id:
            return e
    return MOCK_ENTITIES[0]

@app.get("/api/v1/network/graph")
def get_graph():
    return {
        "nodes": MOCK_ENTITIES,
        "edges": MOCK_RELATIONSHIPS,
        "stats": {
            "totalNodes": len(MOCK_ENTITIES),
            "totalEdges": len(MOCK_RELATIONSHIPS),
            "density": 0.42,
            "communitiesCount": 2
        }
    }

@app.get("/api/v1/network/centrality")
def get_centrality():
    return sorted(MOCK_ENTITIES, key=lambda x: x["centrality"]["betweennessCentrality"], reverse=True)

@app.post("/api/v1/analysis/analyze-fir")
async def analyze_fir(file: UploadFile = File(...), case_id: Optional[str] = Form(None)):
    return {
        "caseId": case_id or "FIR-42/2026 Special Cell",
        "fileUploaded": file.filename,
        "extractedEntitiesCount": 12,
        "extractedRelationshipsCount": 18,
        "communitiesDetected": 2,
        "overallAnomalyScore": 88.4,
        "keyInsights": [
            "Multiple cross-case relationships identified connecting Dwarka Hawala syndicate to DND Expressway smuggling corridor.",
            "Phone number +91-98110-10001 acts as the central communication bridge across 3 separate Delhi Police FIR records.",
            "Apex Transport Delhi Pvt Ltd identified as primary shell corporate entity facilitating vehicle registrations and financial transfers."
        ],
        "extractedTriplets": [
            { "subject": "Rajesh Kumar", "predicate": "OPERATES_COMMUNICATION_HUB", "object": "+91-98110-10001", "confidence": 0.96 },
            { "subject": "+91-98110-10001", "predicate": "RELAYED_CALL_TO", "object": "Amit Verma", "confidence": 0.92 }
        ],
        "recommendedSteps": [
            "Issue judicial production warrant for CDR logs of +91-98110-10001.",
            "Initiate financial freeze under PMLA Act on HDFC Bank Account linked to Apex Transport Delhi Pvt Ltd."
        ]
    }

@app.get("/api/v1/analysis/{case_id}")
def get_analysis_by_case(case_id: str):
    return {
        "caseId": case_id,
        "fileUploaded": "Special_Cell_FIR_42_Dwarka_Report.pdf",
        "extractedEntitiesCount": 12,
        "extractedRelationshipsCount": 18,
        "communitiesDetected": 2,
        "overallAnomalyScore": 88.4,
        "keyInsights": [
            "Multiple cross-case relationships identified connecting Dwarka Hawala syndicate to DND Expressway smuggling corridor.",
            "Phone number +91-98110-10001 acts as the central communication bridge across 3 separate Delhi Police FIR records."
        ],
        "extractedTriplets": [
            { "subject": "Rajesh Kumar", "predicate": "OPERATES_COMMUNICATION_HUB", "object": "+91-98110-10001", "confidence": 0.96 }
        ],
        "recommendedSteps": [
            "Issue judicial production warrant for CDR logs of +91-98110-10001."
        ]
    }

@app.get("/api/v1/alerts")
def get_alerts():
    return MOCK_ALERTS

@app.patch("/api/v1/alerts/{alert_id}/status")
def update_alert_status(alert_id: str, body: AlertStatusUpdate):
    for a in MOCK_ALERTS:
        if a["id"] == alert_id:
            a["status"] = body.status
            return a
    return MOCK_ALERTS[0]

@app.get("/api/v1/cross-case")
def get_cross_case():
    return [
        {
            "id": "CCL-01",
            "caseA": "FIR-42/2026 Special Cell",
            "caseB": "FIR-108/2026 Crime Branch",
            "sharedPersons": 2,
            "sharedPhones": 1,
            "sharedVehicles": 1,
            "sharedLocations": 1,
            "sharedOrganizations": 1,
            "strengthScore": 92,
            "entities": [
                { "id": "ENT-PER-101", "name": "Rajesh Kumar @ Raju Dwarka", "type": "PERSON" },
                { "id": "ENT-PER-102", "name": "Amit Verma @ Amit CP", "type": "PERSON" }
            ]
        }
    ]

@app.get("/api/v1/evidence")
def get_evidence():
    return MOCK_EVIDENCE

@app.post("/api/v1/evidence/verify")
def verify_evidence(req: VerifyHashRequest):
    item = MOCK_EVIDENCE[0]
    for e in MOCK_EVIDENCE:
        if e["id"] == req.evidenceId:
            item = e
            break
    is_match = item["hash"].lower() == req.calculatedHash.strip().lower()
    return {
        "isMatch": is_match,
        "details": item
    }

@app.get("/api/v1/audit/logs")
def get_audit_logs():
    return MOCK_AUDIT_LOGS

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
