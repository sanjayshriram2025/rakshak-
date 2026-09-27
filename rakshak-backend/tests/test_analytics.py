from app.services.analytics.centrality import compute_centrality
from app.services.analytics.community_detection import detect_communities


def _star_graph():
    """Hub connected to 5 peripheral nodes — hub should have highest centrality."""
    nodes = [{"entity_id": "hub", "name": "Hub"}] + [
        {"entity_id": f"p{i}", "name": f"Peripheral {i}"} for i in range(5)
    ]
    edges = [{"source": "hub", "target": f"p{i}", "type": "ASSOCIATED_WITH"} for i in range(5)]
    return nodes, edges


def test_hub_has_highest_degree_centrality():
    nodes, edges = _star_graph()
    results = compute_centrality(nodes, edges)
    top = results[0]
    assert top["entity_id"] == "hub"


def test_empty_graph_returns_empty_centrality():
    assert compute_centrality([], []) == []


def test_community_detection_groups_two_clusters():
    # Two disconnected triangles = two communities.
    nodes = [{"entity_id": f"n{i}", "name": f"N{i}"} for i in range(6)]
    edges = [
        {"source": "n0", "target": "n1", "type": "ASSOCIATED_WITH"},
        {"source": "n1", "target": "n2", "type": "ASSOCIATED_WITH"},
        {"source": "n0", "target": "n2", "type": "ASSOCIATED_WITH"},
        {"source": "n3", "target": "n4", "type": "ASSOCIATED_WITH"},
        {"source": "n4", "target": "n5", "type": "ASSOCIATED_WITH"},
        {"source": "n3", "target": "n5", "type": "ASSOCIATED_WITH"},
    ]
    communities = detect_communities(nodes, edges)
    assert len(communities) >= 2
    total_members = sum(c["size"] for c in communities)
    assert total_members == 6
