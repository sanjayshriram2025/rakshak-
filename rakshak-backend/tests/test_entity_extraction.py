from app.services.nlp.entity_extraction import entity_extractor


def test_extracts_phone_number():
    text = "Rajesh Kumar communicated with Amit Singh using phone number 9000010001 near Patna."
    result = entity_extractor.extract_as_dict(text)
    values = [e["value"] for e in result["entities"] if e["type"] == "PHONE"]
    assert "9000010001" in values


def test_extracts_vehicle_number():
    text = "Vehicle BR01AB1234 was associated with the incident."
    result = entity_extractor.extract_as_dict(text)
    values = [e["value"] for e in result["entities"] if e["type"] == "VEHICLE"]
    assert "BR01AB1234" in values


def test_extracts_fir_number():
    text = "This is documented under FIR-1024 filed last week."
    result = entity_extractor.extract_as_dict(text)
    values = [e["value"] for e in result["entities"] if e["type"] == "FIR"]
    assert any("1024" in v for v in values)


def test_extracts_case_id():
    text = "Reference CASE-2024/045 for prior history."
    result = entity_extractor.extract_as_dict(text)
    values = [e["value"] for e in result["entities"] if e["type"] == "CASE"]
    assert len(values) >= 1


def test_extracts_date():
    text = "The incident occurred on 12/01/2024 near the market."
    result = entity_extractor.extract_as_dict(text)
    values = [e["value"] for e in result["entities"] if e["type"] == "DATE"]
    assert "12/01/2024" in values


def test_empty_text_returns_no_entities():
    assert entity_extractor.extract_as_dict("")["entities"] == []


def test_overlapping_matches_are_deduplicated():
    # A phone-like number should not also produce a spurious overlapping match.
    text = "Contact 9000010001 for details."
    entities = entity_extractor.extract(text)
    spans = [(e.start, e.end) for e in entities]
    # No two spans should overlap.
    for i in range(len(spans)):
        for j in range(i + 1, len(spans)):
            a, b = spans[i], spans[j]
            assert a[1] <= b[0] or a[0] >= b[1]
