"""
Graph centrality analytics built on NetworkX, computed over a snapshot
exported from Neo4j. Pure, transparent graph-theoretic metrics — no
learned model, so every score is fully explainable by construction.
"""
from __future__ import annotations

from typing import Dict, List

import networkx as nx


def build_networkx_graph(nodes: List[dict], edges: List[dict]) -> nx.Graph:
    g = nx.Graph()  # undirected for centrality purposes (connectivity, not direction)
    for node in nodes:
        g.add_node(node["entity_id"], **{k: v for k, v in node.items() if k != "entity_id"})
    for edge in edges:
        g.add_edge(edge["source"], edge["target"], type=edge.get("type"), confidence=edge.get("confidence", 1.0))
    return g


def _interpret(degree: float, betweenness: float, closeness: float) -> str:
    """
    Deterministic, explainable interpretation labels. Thresholds are
    simple and documented — not a black-box classifier. These labels
    describe network position ONLY, never criminal involvement.
    """
    if betweenness >= 0.3 and degree < 0.3:
        return "Potential Bridge Entity (connects otherwise separate groups)"
    if degree >= 0.5:
        return "Potential Key Network Node (highly connected)"
    if betweenness >= 0.2:
        return "Potential Key Network Node (structurally significant bridge)"
    if degree >= 0.25:
        return "Moderately Connected Entity"
    return "Peripheral Entity"


def compute_centrality(nodes: List[dict], edges: List[dict]) -> List[dict]:
    g = build_networkx_graph(nodes, edges)
    if g.number_of_nodes() == 0:
        return []

    degree = nx.degree_centrality(g)
    betweenness = nx.betweenness_centrality(g, normalized=True)
    try:
        closeness = nx.closeness_centrality(g)
    except Exception:
        closeness = {n: 0.0 for n in g.nodes}

    results = []
    for node_id in g.nodes:
        node_data = g.nodes[node_id]
        results.append(
            {
                "entity_id": node_id,
                "name": node_data.get("name", node_id),
                "degree_centrality": round(degree.get(node_id, 0.0), 4),
                "betweenness_centrality": round(betweenness.get(node_id, 0.0), 4),
                "closeness_centrality": round(closeness.get(node_id, 0.0), 4),
                "interpretation": _interpret(
                    degree.get(node_id, 0.0), betweenness.get(node_id, 0.0), closeness.get(node_id, 0.0)
                ),
            }
        )
    results.sort(key=lambda r: r["degree_centrality"], reverse=True)
    return results


def top_connected_entities(nodes: List[dict], edges: List[dict], top_n: int = 10) -> List[dict]:
    return compute_centrality(nodes, edges)[:top_n]
