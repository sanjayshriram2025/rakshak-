"""
Community detection using the Louvain algorithm (python-louvain, which
operates on NetworkX graphs). Falls back to NetworkX's built-in greedy
modularity communities if python-louvain isn't importable, so this
never hard-fails the analytics pipeline.
"""
from __future__ import annotations

from typing import Dict, List

import networkx as nx

from app.services.analytics.centrality import build_networkx_graph


def detect_communities(nodes: List[dict], edges: List[dict]) -> List[dict]:
    g = build_networkx_graph(nodes, edges)
    if g.number_of_nodes() == 0:
        return []

    partition = _run_louvain(g)

    communities: Dict[int, List[str]] = {}
    for node_id, community_id in partition.items():
        communities.setdefault(community_id, []).append(node_id)

    degree = dict(g.degree())
    results = []
    for community_id, members in communities.items():
        # Key nodes = top 3 members by degree within this community.
        sorted_members = sorted(members, key=lambda m: degree.get(m, 0), reverse=True)
        key_nodes = sorted_members[:3]
        internal_edges = sum(
            1 for u, v in g.edges() if partition.get(u) == community_id and partition.get(v) == community_id
        )
        results.append(
            {
                "community_id": community_id,
                "members": members,
                "size": len(members),
                "key_nodes": key_nodes,
                "connection_count": internal_edges,
            }
        )
    results.sort(key=lambda c: c["size"], reverse=True)
    return results


def _run_louvain(g: nx.Graph) -> Dict[str, int]:
    try:
        import community as community_louvain  # python-louvain package

        return community_louvain.best_partition(g)
    except Exception:
        # Fallback: NetworkX's built-in greedy modularity communities.
        communities = nx.algorithms.community.greedy_modularity_communities(g)
        partition = {}
        for idx, community_set in enumerate(communities):
            for node in community_set:
                partition[node] = idx
        return partition
