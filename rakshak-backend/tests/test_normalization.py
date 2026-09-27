from app.services.entity_resolution.normalization import (
    normalize_person_name,
    normalize_phone,
    normalize_vehicle,
    propose_match,
)


def test_person_name_normalization_case_insensitive():
    assert normalize_person_name("rajEsh kumar") == normalize_person_name("RAJESH KUMAR")
    assert normalize_person_name("Rajesh Kumar") == "rajesh kumar"


def test_phone_normalization_strips_country_code():
    assert normalize_phone("+91 9000010001") == "9000010001"
    assert normalize_phone("09000010001") == "9000010001"


def test_vehicle_normalization_strips_separators():
    assert normalize_vehicle("BR-01 AB 1234") == "BR01AB1234"


def test_exact_match_high_confidence():
    result = propose_match("PERSON", "Rajesh Kumar", "rajesh kumar", "RAJESH KUMAR", "rajesh kumar")
    assert result["possible_match"] is True
    assert result["confidence"] >= 0.95


def test_dissimilar_names_no_match():
    result = propose_match("PERSON", "Rajesh Kumar", "rajesh kumar", "Amit Singh", "amit singh")
    assert result["possible_match"] is False


def test_near_miss_flagged_but_not_exact():
    result = propose_match("PERSON", "Rajesh Kumar", "rajesh kumar", "Rajesh Kumarr", "rajesh kumarr")
    assert result["possible_match"] is True
    assert result["confidence"] < 0.98
