from app.services.anomaly_detection.detector import anomaly_detector


def test_shared_phone_across_cases_flagged():
    finding = anomaly_detector.detect_shared_identifier_across_cases(
        "PHONE", "phone-1", "9000010001", ["case-a", "case-b"], ["ev-1", "ev-2"]
    )
    assert finding is not None
    assert finding.alert_type == "SHARED_PHONE_ACROSS_CASES"
    assert 0 < finding.score <= 1
    assert "case-a" in finding.reason or "case-a" in finding.cases


def test_single_case_not_flagged():
    finding = anomaly_detector.detect_shared_identifier_across_cases(
        "PHONE", "phone-1", "9000010001", ["case-a"], ["ev-1"]
    )
    assert finding is None


def test_highly_connected_entity_flagged_above_threshold():
    finding = anomaly_detector.detect_highly_connected_entity("p1", "Hub Person", 0.6, ["case-a"])
    assert finding is not None
    assert finding.severity in ("LOW", "MEDIUM", "HIGH", "CRITICAL")


def test_highly_connected_entity_not_flagged_below_threshold():
    finding = anomaly_detector.detect_highly_connected_entity("p1", "Peripheral", 0.1, ["case-a"])
    assert finding is None


def test_bridge_entity_requires_high_betweenness():
    assert anomaly_detector.detect_bridge_entity("p1", "P", 0.1, 0.1, ["case-a"]) is None
    finding = anomaly_detector.detect_bridge_entity("p1", "P", 0.4, 0.1, ["case-a"])
    assert finding is not None
    assert finding.alert_type == "BRIDGE_ENTITY"


def test_explanation_always_present():
    finding = anomaly_detector.detect_communication_concentration("p1", "P", 6, ["case-a"])
    assert finding is not None
    assert finding.reason
    assert finding.pattern
