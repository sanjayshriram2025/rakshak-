"""
python scripts/seed_demo.py

Generates a synthetic RAKSHAK demo dataset and runs it through the REAL
ingestion pipeline (text extraction -> entity extraction -> normalization
-> relationship extraction -> Neo4j -> analytics -> anomaly detection ->
alerts -> evidence hashing -> audit logs). Nothing here fabricates
alerts or graph data directly — every FIR narrative below is plain text
that the actual NLP/relationship/graph services process exactly like a
real upload would.

Deliberately engineered to produce:
- 1 highly-connected person (appears across many FIRs/cases)
- 1 bridge entity (connects two otherwise-separate communities)
- 2-3 communities
- a phone shared across multiple cases
- a vehicle shared across multiple cases
- a location shared across multiple cases
- multiple suspicious alerts

All names/numbers are fictional. No real records are used.
"""
import os
import sys
import uuid

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from faker import Faker

from app.core.database import Base, SessionLocal, engine
from app.core.security import hash_password
from app.models.case import Case, CaseStatus
from app.models.fir import FIR, FileType, ProcessingStatus
from app.models.user import User, UserRole
from app.services.evidence_integrity.hashing import sha256_hex
from app.services.ingestion.pipeline import ingestion_pipeline
from app.services.graph.neo4j_service import neo4j_service

fake = Faker("en_IN")
Faker.seed(42)

# ---------------------------------------------------------------------------
# Fixed synthetic identity pools (fictional, deliberately reused to create
# the demo patterns the spec asks for).
# ---------------------------------------------------------------------------
PERSONS = [fake.name() for _ in range(40)]
PHONES = [f"9{fake.numerify('#########')}" for _ in range(20)]
VEHICLES = [f"{fake.random_uppercase_letter()}{fake.random_uppercase_letter()}"
            f"{fake.random_int(10,99)}"
            f"{fake.random_uppercase_letter()}{fake.random_uppercase_letter()}"
            f"{fake.random_int(1000,9999)}" for _ in range(10)]
LOCATIONS = ["Patna", "Ranchi", "Lucknow", "Kanpur", "Bhopal", "Nagpur", "Surat",
             "Chennai", "Coimbatore", "Guwahati", "Bhubaneswar", "Raipur",
             "Indore", "Varanasi", "Amritsar"]
ORGANIZATIONS = ["Shakti Traders", "Ganga Logistics Pvt Ltd", "Bharat Freight Co",
                  "Silver Line Transport", "Eastline Enterprises"]

# Deliberate "highly connected" person and "bridge" person + shared identifiers.
HUB_PERSON = PERSONS[0]           # will appear in many FIRs -> highly connected
BRIDGE_PERSON = PERSONS[1]        # connects community A and community B
SHARED_PHONE = PHONES[0]          # appears across multiple cases
SHARED_VEHICLE = VEHICLES[0]      # appears across multiple cases
SHARED_LOCATION = LOCATIONS[0]    # appears across multiple cases

COMMUNITY_A = PERSONS[2:14]   # 12 people
COMMUNITY_B = PERSONS[14:26]  # 12 people
COMMUNITY_C = PERSONS[26:38]  # 12 people


def narrative_templates(case_index: int) -> list[str]:
    """Builds several FIR narrative paragraphs (plain text) for one case."""
    templates = []

    # Pick a community for this case, cycling through A/B/C.
    community = [COMMUNITY_A, COMMUNITY_B, COMMUNITY_C][case_index % 3]
    p1, p2 = fake.random_elements(community, length=2, unique=True)
    phone = fake.random_element(PHONES)
    vehicle = fake.random_element(VEHICLES)
    location = fake.random_element(LOCATIONS)
    org = fake.random_element(ORGANIZATIONS)

    templates.append(
        f"{p1} communicated with {p2} using phone number {phone} near {location}. "
        f"Vehicle {vehicle} was associated with the incident reported on "
        f"{fake.date_between(start_date='-2y', end_date='today').strftime('%d/%m/%Y')}."
    )
    templates.append(
        f"{p2} is a member of {org}, operating out of {location}. "
        f"{p1} was seen using vehicle {vehicle} in the same area."
    )

    # Every 3rd case, route the HUB_PERSON through it to build high connectivity.
    if case_index % 3 == 0:
        templates.append(
            f"{HUB_PERSON} was reported to have called {p1} and separately associated with {p2} "
            f"near {location}. {HUB_PERSON} uses phone number {fake.random_element(PHONES)}."
        )

    # Every 4th case, route the BRIDGE_PERSON connecting two communities.
    if case_index % 4 == 0:
        other_community = COMMUNITY_B if community is COMMUNITY_A else COMMUNITY_A
        other_person = fake.random_element(other_community)
        templates.append(
            f"{BRIDGE_PERSON} communicated with {p1} and was separately linked to {other_person}, "
            f"an associate connected to a different case file."
        )

    # Every 5th case, plant the SHARED_PHONE / SHARED_VEHICLE / SHARED_LOCATION.
    if case_index % 5 == 0:
        templates.append(
            f"{p1} was found to be using phone number {SHARED_PHONE}, previously linked to another case. "
            f"Vehicle {SHARED_VEHICLE} was also seen near {SHARED_LOCATION} during the same period."
        )

    return templates


def get_or_create_seed_user(db) -> User:
    user = db.query(User).filter(User.email == "admin@rakshak.demo").first()
    if user:
        return user
    user = User(
        name="Demo Administrator",
        email="admin@rakshak.demo",
        password_hash=hash_password("ChangeMe123!"),
        role=UserRole.ADMIN,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def main():
    print("Creating database schema...")
    Base.metadata.create_all(bind=engine)

    print("Initializing Neo4j constraints...")
    try:
        neo4j_service.ensure_constraints()
    except Exception as exc:
        print(f"  Warning: could not set Neo4j constraints ({exc}). Continuing.")

    db = SessionLocal()
    try:
        admin = get_or_create_seed_user(db)
        print(f"Seed user ready: {admin.email} / ChangeMe123! (role={admin.role.value})")

        print("Creating 15 synthetic cases and FIRs...")
        for i in range(15):
            case_number = f"CASE-2024-{i+1:03d}"
            case = db.query(Case).filter(Case.case_number == case_number).first()
            if not case:
                case = Case(
                    case_number=case_number,
                    title=f"Synthetic Investigation File {i+1}",
                    description="Synthetic demo case generated for RAKSHAK prototype demonstration.",
                    status=CaseStatus.UNDER_INVESTIGATION,
                )
                db.add(case)
                db.commit()
                db.refresh(case)

            fir_number = f"FIR-{1000+i}"
            existing = db.query(FIR).filter(FIR.fir_number == fir_number).first()
            if existing:
                print(f"  {fir_number} already exists, skipping.")
                continue

            text = "\n".join(narrative_templates(i))
            file_bytes = text.encode("utf-8")
            file_hash = sha256_hex(file_bytes)

            fir = FIR(
                fir_number=fir_number,
                case_id=case.id,
                file_name=f"{fir_number}.txt",
                file_type=FileType.TXT,
                original_hash=file_hash,
                processing_status=ProcessingStatus.UPLOADED,
                uploaded_by=admin.id,
            )
            db.add(fir)
            db.commit()
            db.refresh(fir)

            print(f"  Processing {fir_number} (case {case_number})...")
            try:
                ingestion_pipeline.process_fir(db, fir, file_bytes, admin.id)
                print(f"    -> {fir.processing_status.value}")
            except Exception as exc:
                print(f"    -> FAILED: {exc}")

        print("\nDemo dataset seeded successfully.")
        print("Login with: admin@rakshak.demo / ChangeMe123!")
        print("Explore: GET /api/alerts, /api/cross-case/connections, /api/analysis/centrality")
    finally:
        db.close()


if __name__ == "__main__":
    main()
