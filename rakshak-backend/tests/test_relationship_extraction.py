from app.services.nlp.entity_extraction import entity_extractor
from app.services.relationship_extraction.extractor import relationship_extractor


def test_communicated_with_relationship_detected():
    text = "Rajesh Kumar communicated with Amit Singh using phone number 9000010001 near Patna."
    entities = entity_extractor.extract(text)
    relationships = relationship_extractor.extract(text, entities)
    types_found = {r.relationship_type for r in relationships}
    assert "COMMUNICATED_WITH" in types_found


def test_relationship_has_evidence_snippet():
    text = "Vehicle BR01AB1234 was associated with the incident involving Amit Singh."
    entities = entity_extractor.extract(text)
    relationships = relationship_extractor.extract(text, entities)
    assert all(r.evidence_snippet for r in relationships)


def test_no_relationships_for_single_entity():
    text = "Amit Singh was mentioned."
    entities = entity_extractor.extract(text)
    relationships = relationship_extractor.extract(text, entities)
    assert relationships == [] or len(entities) < 2
