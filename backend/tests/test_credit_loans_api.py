"""Comprehensive Unit and Integration Tests for Credit Eligibility & Farmer Loan Application Flow."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_credit_eligibility_wheat_calculation():
    """Test credit eligibility calculation for Wheat with positive NDVI and zero debt."""
    payload = {
        "farmer_id": "FMR-TEST-001",
        "land_area_acres": 4.0,
        "crop_type": "Wheat",
        "ndvi_crop_health_score": 0.85,
        "annual_income_inr": 350000.0,
        "existing_debt_inr": 0.0,
    }

    response = client.post("/api/v1/farmer/eligibility", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["farmer_id"] == "FMR-TEST-001"
    assert data["scale_of_finance_per_acre"] == 38000.0
    assert data["risk_category"] == "LOW"
    assert data["credit_score"] >= 750
    assert data["eligible_loan_amount_inr"] > 0
    assert len(data["basis_factors"]) >= 3
    assert "Instant Digital Sanction" in data["approval_recommendation"]


def test_credit_eligibility_sugarcane_with_debt():
    """Test credit eligibility for Sugarcane with existing debt deduction."""
    payload = {
        "farmer_id": "FMR-TEST-002",
        "land_area_acres": 2.5,
        "crop_type": "Sugarcane",
        "ndvi_crop_health_score": 0.65,
        "annual_income_inr": 200000.0,
        "existing_debt_inr": 50000.0,
    }

    response = client.post("/api/v1/farmer/eligibility", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["farmer_id"] == "FMR-TEST-002"
    assert data["scale_of_finance_per_acre"] == 65000.0
    # Check that debt deduction was recorded in factors
    debt_factor = next((f for f in data["basis_factors"] if "Debt" in f["factor_name"]), None)
    assert debt_factor is not None
    assert debt_factor["contribution_amount"] < 0


def test_loan_application_submit_and_list_flow():
    """Test applying for a loan and verifying it appears in the loans listing."""
    apply_payload = {
        "farmer_id": "FMR-PB-0099",
        "farmer_name": "Gurdeep Singh",
        "requested_amount_inr": 85000.0,
        "land_area_acres": 3.5,
        "crop_type": "Paddy",
        "purpose": "Fertilizers and seed procurement for Kharif season",
    }

    apply_res = client.post("/api/v1/farmer/loans/apply", json=apply_payload)
    assert apply_res.status_code == 201
    loan_data = apply_res.json()

    assert loan_data["loan_id"] is not None
    assert loan_data["farmer_id"] == "FMR-PB-0099"
    assert loan_data["farmer_name"] == "Gurdeep Singh"
    assert loan_data["status"] == "PENDING"
    assert loan_data["requested_amount_inr"] == 85000.0
    assert loan_data["eligible_amount_inr"] > 0
    loan_id = loan_data["loan_id"]

    # Test GET /loans
    list_res = client.get("/api/v1/farmer/loans")
    assert list_res.status_code == 200
    loans = list_res.json()
    assert isinstance(loans, list)
    assert any(l["loan_id"] == loan_id for l in loans)

    # Test GET /loans?farmer_id=FMR-PB-0099 filter
    filter_res = client.get("/api/v1/farmer/loans?farmer_id=FMR-PB-0099")
    assert filter_res.status_code == 200
    filtered_loans = filter_res.json()
    assert len(filtered_loans) >= 1
    assert all(l["farmer_id"] == "FMR-PB-0099" for l in filtered_loans)


def test_loan_action_approve_and_reject():
    """Test lender approving and rejecting a loan application."""
    # 1. Create a loan
    apply_payload = {
        "farmer_id": "FMR-MH-0044",
        "farmer_name": "Anil Deshmukh",
        "requested_amount_inr": 120000.0,
        "land_area_acres": 5.0,
        "crop_type": "Cotton",
        "purpose": "Drip irrigation pipe installation",
    }
    apply_res = client.post("/api/v1/farmer/loans/apply", json=apply_payload)
    assert apply_res.status_code == 201
    loan_id = apply_res.json()["loan_id"]

    # 2. Lender approves loan
    action_payload = {
        "action": "APPROVED",
        "approved_amount_inr": 115000.0,
        "comments": "Sanctioned at 7.0% interest rate under KCC scheme.",
    }
    action_res = client.post(f"/api/v1/farmer/loans/{loan_id}/action", json=action_payload)
    assert action_res.status_code == 200
    updated_loan = action_res.json()
    assert updated_loan["status"] == "APPROVED"
    assert updated_loan["eligible_amount_inr"] == 115000.0
    assert "Sanctioned at 7.0%" in updated_loan["lender_comments"]

    # 3. Test Invalid Action
    invalid_res = client.post(f"/api/v1/farmer/loans/{loan_id}/action", json={"action": "MAYBE"})
    assert invalid_res.status_code == 422

    # 4. Test Non-existent Loan ID
    not_found_res = client.post("/api/v1/farmer/loans/non-existent-loan-id/action", json={"action": "REJECTED"})
    assert not_found_res.status_code == 404
