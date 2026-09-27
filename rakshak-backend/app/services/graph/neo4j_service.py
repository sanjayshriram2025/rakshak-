"""
Neo4j knowledge-graph service.

Idempotency: every node is MERGEd on (label, entity_id) — the Postgres
Entity.id — so re-ingesting the same source data never creates duplicate
nodes. Relationships are MERGEd on (start, end, type, evidence_id) so
re-processing a FIR does not duplicate edges either.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from neo4j import GraphDatabase

from app.core.config import settings


class Neo4jService:
    def __init__(self):
        self._driver = None

    def _get_driver(self):
        if self._driver is None:
            self._driver = GraphDatabase.driver(
                settings.NEO4J_URI, auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
            )
        return self._driver

    def close(self):
        if self._driver is not None:
            self._driver.close()
            self._driver = None

    def ensure_constraints(self):
        """Run once at startup: uniqueness constraints make MERGE idempotent and fast."""
        labels = ["Person", "Phone", "Vehicle", "Location", "Organization", "Case", "FIR"]
        with self._get_driver().session() as session:
            for label in labels:
                session.run(
                    f"CREATE CONSTRAINT IF NOT EXISTS FOR (n:{label}) REQUIRE n.entity_id IS UNIQUE"
                )

    @staticmethod
    def _label_for(entity_type: str) -> str:
        mapping = {
            "PERSON": "Person",
            "PHONE": "Phone",
            "VEHICLE": "Vehicle",
            "LOCATION": "Location",
            "ORGANIZATION": "Organization",
            "CASE": "Case",
            "FIR": "FIR",
        }
        return mapping.get(entity_type, "Entity")

    def upsert_entity_node(self, entity_id: str, entity_type: str, name: str, normalized_name: str) -> None:
        label = self._label_for(entity_type)
        query = (
            f"MERGE (n:{label} {{entity_id: $entity_id}}) "
            "SET n.name = $name, n.normalized_name = $normalized_name, n.entity_type = $entity_type"
        )
        with self._get_driver().session() as session:
            session.run(
                query,
                entity_id=entity_id,
                name=name,
                normalized_name=normalized_name,
                entity_type=entity_type,
            )

    def upsert_relationship(
        self,
        source_id: str,
        source_type: str,
        target_id: str,
        target_type: str,
        relationship_type: str,
        confidence: float,
        evidence_id: Optional[str],
        case_id: Optional[str],
    ) -> None:
        source_label = self._label_for(source_type)
        target_label = self._label_for(target_type)
        query = (
            f"MATCH (a:{source_label} {{entity_id: $source_id}}), (b:{target_label} {{entity_id: $target_id}}) "
            f"MERGE (a)-[r:{relationship_type} {{evidence_id: $evidence_id}}]->(b) "
            "SET r.confidence = $confidence, r.case_id = $case_id"
        )
        with self._get_driver().session() as session:
            session.run(
                query,
                source_id=source_id,
                target_id=target_id,
                confidence=confidence,
                evidence_id=evidence_id,
                case_id=case_id,
            )

    def get_entity_network(self, entity_id: str, depth: int = 2) -> Dict[str, List[dict]]:
        query = (
            "MATCH (n {entity_id: $entity_id}) "
            f"CALL apoc.path.subgraphAll(n, {{maxLevel: $depth}}) YIELD nodes, relationships "
            "RETURN nodes, relationships"
        )
        # Fallback query without APOC (APOC may not be installed in a plain
        # neo4j:community image) — variable-length pattern match instead.
        fallback_query = (
            "MATCH path = (n {entity_id: $entity_id})-[*0..%d]-(m) "
            "UNWIND relationships(path) AS rel "
            "WITH collect(DISTINCT startNode(rel)) + collect(DISTINCT endNode(rel)) + [n] AS allNodes, "
            "collect(DISTINCT rel) AS allRels "
            "RETURN allNodes AS nodes, allRels AS relationships" % depth
        )
        with self._get_driver().session() as session:
            try:
                result = session.run(fallback_query, entity_id=entity_id)
                record = result.single()
            except Exception:
                record = None

            if not record or not record["nodes"]:
                # Entity may be isolated (no relationships yet) — return it alone.
                single = session.run(
                    "MATCH (n {entity_id: $entity_id}) RETURN n", entity_id=entity_id
                ).single()
                nodes = [single["n"]] if single else []
                return {"nodes": nodes, "relationships": []}

            return {"nodes": record["nodes"], "relationships": record["relationships"]}

    def get_case_network(self, case_id: str) -> Dict[str, List[dict]]:
        query = (
            "MATCH (a)-[r {case_id: $case_id}]->(b) "
            "RETURN collect(DISTINCT a) + collect(DISTINCT b) AS nodes, collect(DISTINCT r) AS relationships"
        )
        with self._get_driver().session() as session:
            record = session.run(query, case_id=case_id).single()
            if not record:
                return {"nodes": [], "relationships": []}
            return {"nodes": record["nodes"], "relationships": record["relationships"]}

    def find_path(self, source_id: str, target_id: str, max_hops: int = 6) -> List[dict]:
        query = (
            "MATCH (a {entity_id: $source_id}), (b {entity_id: $target_id}), "
            f"path = shortestPath((a)-[*..{max_hops}]-(b)) "
            "RETURN nodes(path) AS nodes, relationships(path) AS relationships"
        )
        with self._get_driver().session() as session:
            record = session.run(query, source_id=source_id, target_id=target_id).single()
            if not record:
                return {"nodes": [], "relationships": []}
            return {"nodes": record["nodes"], "relationships": record["relationships"]}

    def export_full_graph(self) -> Dict[str, List[dict]]:
        """Used by analytics (centrality/community) to build a NetworkX graph."""
        query = "MATCH (a)-[r]->(b) RETURN a, r, b"
        nodes_by_id: Dict[str, dict] = {}
        edges: List[dict] = []
        with self._get_driver().session() as session:
            for record in session.run(query):
                a, r, b = record["a"], record["r"], record["b"]
                for node in (a, b):
                    nodes_by_id[node["entity_id"]] = dict(node)
                edges.append(
                    {
                        "source": a["entity_id"],
                        "target": b["entity_id"],
                        "type": r.type,
                        "confidence": r.get("confidence", 1.0),
                        "evidence_id": r.get("evidence_id"),
                        "case_id": r.get("case_id"),
                    }
                )
        return {"nodes": list(nodes_by_id.values()), "edges": edges}


neo4j_service = Neo4jService()
