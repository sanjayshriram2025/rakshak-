# RAKSHAK — AI-Powered Criminal Network Intelligence System

Backend + AI/ML + Graph intelligence engine for **SIH Problem Statement SIH26189**.

RAKSHAK transforms fragmented crime records into an explainable, evidence-backed
knowledge graph that helps investigators discover connections hidden across
cases — it never declares that a person is a criminal. All findings use
investigator-facing language: *Person of Interest*, *Associated Entity*,
*Potential Key Network Node*, *Relationship Requiring Verification*.

The frontend (built separately, e.g. with Antigravity) consumes this backend
purely over REST/JSON — nothing here renders UI.

## What's implemented

| Area | Status |
|---|---|
| FastAPI backend, modular structure | ✅ |
| PostgreSQL relational model (users, cases, FIRs, entities, relationships, alerts, evidence, audit) | ✅ |
| FIR ingestion: PDF / DOCX / TXT / CSV / JSON | ✅ |
| Hybrid NLP entity extraction (regex + spaCy NER, graceful fallback) | ✅ |
| Entity normalization + non-destructive fuzzy-match flagging | ✅ |
| Relationship extraction (keyword rules + co-occurrence) | ✅ |
| Neo4j knowledge graph, idempotent MERGE-based updates | ✅ |
| Graph analytics: degree / betweenness / closeness centrality | ✅ |
| Community detection (Louvain, with NetworkX fallback) | ✅ |
| Cross-case intelligence (shared phone/vehicle/location/person/org) | ✅ |
| Explainable anomaly/suspicious-pattern detection | ✅ |
| Investigation summaries | ✅ |
| SHA-256 evidence hashing + tamper-evident hash chain | ✅ |
| JWT auth + RBAC (ADMIN / INVESTIGATOR / ANALYST) | ✅ |
| Audit logging on every sensitive action | ✅ |
| Synthetic demo dataset + one-click seed script | ✅ |
| Automated tests (pytest) | ✅ |
| Docker + docker-compose (backend, Postgres, Neo4j) | ✅ |
| Swagger API docs | ✅ (auto-generated at `/docs`) |

## Quick start

```bash
cp .env.example .env
# Edit .env and set a real JWT_SECRET_KEY and passwords before any real deployment.

docker compose up --build
```

This starts Postgres, Neo4j, and the FastAPI backend. On first boot the backend
creates all tables and Neo4j constraints automatically.

Then, in a second terminal, seed the demo dataset (creates 15 cases, 40
persons, 20 phones, 10 vehicles, 15 locations, 5 organizations, and pushes them
through the **real** ingestion pipeline — nothing is faked):

```bash
docker compose exec rakshak-backend python scripts/seed_demo.py
```

Login with `admin@rakshak.demo` / `ChangeMe123!` against `POST /api/auth/login`,
then explore:

- `GET /api/alerts` — generated suspicious-pattern alerts
- `GET /api/cross-case/connections` — shared identifiers across cases
- `GET /api/analysis/centrality` / `/api/analysis/communities`
- `GET /api/analysis/case/{case_id}/summary` — full investigation summary
- `GET /docs` — full interactive Swagger UI

## Running without Docker (local dev)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Point DATABASE_URL / NEO4J_URI at locally running Postgres/Neo4j instances,
# or `docker compose up postgres neo4j` and point at those.
export $(cat .env.example | grep -v '^#' | xargs)

uvicorn app.main:app --reload
```

## Running tests

```bash
pytest tests/ -v
```

The test suite covers pure logic (entity extraction, normalization,
relationship extraction, centrality, community detection, anomaly detection,
hashing, file validation, text extraction) without requiring a live database —
these run anywhere. Full end-to-end pipeline tests additionally require a
running Postgres + Neo4j (see docker-compose).

## The end-to-end flow (what actually happens on FIR upload)

```
POST /api/firs/upload
  -> file validated (extension, size, non-empty)
  -> SHA-256 computed over the raw bytes
  -> text extracted (PyPDF/pdfplumber, python-docx, csv, json, or plain text)
  -> text cleaned (whitespace/newline normalization)
  -> entities extracted (regex: phone/vehicle/FIR/case/date; spaCy NER: person/location/org)
  -> each entity normalized and resolved against existing Entity rows
     (exact normalized match reuses the entity; near-misses create a new
      entity AND a recorded EntityMatch for investigator review — never
      auto-merged)
  -> relationships extracted from the same text (keyword-triggered +
     co-occurrence), each carrying its source sentence
  -> Entity + Relationship rows persisted to Postgres, referencing the
     Evidence row (SHA-256 hash) they came from
  -> Evidence hash appended to the tamper-evident hash chain
  -> Neo4j graph updated via idempotent MERGE (re-uploading the same FIR
     never creates duplicate nodes/edges)
  -> centrality + community detection run over the full graph
  -> anomaly detectors run (shared identifiers across cases, highly
     connected entities, bridge entities, communication concentration,
     location overlap, repeated co-occurrence, relationship-count outliers)
  -> any new finding is persisted as an Alert with a full explanation
     (WHAT / WHY / entities / cases / relationships / evidence + the
      mandatory "requires verification" disclaimer)
  -> FIR.processing_status -> COMPLETE
```

If any stage fails, `FIR.processing_status` is set to `FAILED` with
`processing_error` populated — the pipeline never silently swallows errors
or fabricates a fake "success".

## Project structure

```
rakshak-backend/
├── app/
│   ├── main.py                     # FastAPI app, CORS, error handlers, router wiring
│   ├── api/                        # One router module per resource
│   ├── core/                       # config, database, security
│   ├── models/                     # SQLAlchemy models
│   ├── schemas/                    # Pydantic request/response models
│   ├── services/
│   │   ├── ingestion/              # file validation, text extraction, pipeline orchestrator
│   │   ├── nlp/                    # hybrid entity extraction
│   │   ├── entity_resolution/      # normalization + resolver
│   │   ├── relationship_extraction/
│   │   ├── graph/                  # Neo4j service
│   │   ├── analytics/              # centrality, community detection
│   │   ├── anomaly_detection/      # explainable pattern detectors
│   │   ├── explainability/         # WHAT/WHY explanation builder
│   │   ├── evidence_integrity/     # SHA-256 hashing + hash chain
│   │   └── analysis/               # case-level orchestration, cross-case, summaries
│   └── utils/
├── data/synthetic/
├── scripts/seed_demo.py            # one-click synthetic demo dataset
├── tests/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example
```

## Design principles enforced throughout the codebase

- **No unsupported accusations.** The system never labels anyone a criminal.
  All output uses Person of Interest / Associated Entity / Potential Key
  Network Node / Relationship Requiring Verification language.
- **Everything is traceable.** Every Entity has `EntityMention` rows back to
  the FIR it came from; every Relationship carries an `evidence_id`; every
  Alert's metadata lists the exact entities/cases/evidence behind it.
- **Uncertain matches are never silently merged.** Fuzzy identity matches are
  recorded as `EntityMatch` rows with a confidence score and reason, pending
  investigator confirmation.
- **Explainable over opaque.** Anomaly detection is built from transparent,
  documented rules and graph metrics. The one place a statistical model is
  used (Isolation Forest for relationship-count outliers) still returns the
  concrete numbers behind the flag, not just a black-box score.
- **Evidence integrity is real, not decorative.** SHA-256 hashes are computed
  over actual uploaded bytes, and the hash chain is independently verifiable
  by replaying `previous_hash` linkage (`GET /api/evidence/hash-chain/status`).

## Security notes before any real deployment

- Change `JWT_SECRET_KEY`, `POSTGRES_PASSWORD`, and `NEO4J_PASSWORD` in `.env`.
- `CORS_ORIGINS` should be restricted to your actual frontend origin(s).
- This prototype's hash chain is a Postgres table by design (see
  `app/services/evidence_integrity/hash_chain.py`) so it can be swapped for a
  real Hyperledger Fabric ledger later without changing the calling code.
