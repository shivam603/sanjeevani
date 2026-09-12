"""Database seed and fixture generator for KisanCred / AgriTrust.

Generates:
- 1 FPO (Sahyadri Farmers Producer Co. Ltd.)
- 2 Lenders (SBI Agri-Credit, NABARD Financial Services)
- 25 Synthetic Farmers with model-layer hashed Aadhaar
- 25 Land Parcels with PostGIS SRID 4326 Polygons (Nashik district coordinates)
- 25+ Crop Cycles (Grapes, Onions, Pomegranates, Soybeans, Tomatoes)
- 50+ Market Transactions (Lasalgaon, Pimpalgaon, Nashik APMC Mandis)
- 25 Credit Passports (Scores 620 - 825)
- 25 Data Consents (Stage 5 Scopes)
- 25 Insurance Records (PMFBY)
"""

import os
import json
import uuid
from datetime import datetime, date, timedelta, timezone
from typing import Dict, List, Any
import hashlib

# Seed Data Constants
FPO_DATA = {
    "fpo_id": "9a3e26b1-4702-4d1a-a1b7-7e6d78201a01",
    "fpo_name": "Sahyadri Farmers Producer Co. Ltd.",
    "registration_number": "FPO-MH-NSK-2021-0894",
    "region": "Nashik, Maharashtra",
    "member_count": 25,
}

LENDERS_DATA = [
    {
        "lender_id": "b1a73204-6819-49ef-92ea-2a81903e1b01",
        "institution_name": "State Bank of India (Agri-Business Division)",
        "api_key_hash": hashlib.sha256(b"sbi_agri_live_key_2026").hexdigest(),
        "tier": "Tier-1 Public Sector Bank",
    },
    {
        "lender_id": "b2c94315-7920-40fa-a3fb-3b92014f2c02",
        "institution_name": "NABARD Financial Services Ltd. (NABFINS)",
        "api_key_hash": hashlib.sha256(b"nabard_nabfins_key_2026").hexdigest(),
        "tier": "Apex Development Financial Institution",
    },
]

FARMER_NAMES = [
    ("Rameshwar Patel", "9823011001", "123456780001", "Dindori", "Black Cotton"),
    ("Sunita Deshmukh", "9823011002", "123456780002", "Niphad", "Clay Loam"),
    ("Babanrao Kadam", "9823011003", "123456780003", "Chandwad", "Medium Black"),
    ("Ganesh Shinde", "9823011004", "123456780004", "Sinnar", "Red Sandy Loam"),
    ("Anita More", "9823011005", "123456780005", "Dindori", "Black Cotton"),
    ("Vijay Thoke", "9823011006", "123456780006", "Niphad", "Alluvial Loam"),
    ("Prakash Jadhav", "9823011007", "123456780007", "Yeola", "Medium Black"),
    ("Sanjay Gaikwad", "9823011008", "123456780008", "Kalwan", "Black Cotton"),
    ("Surekha Sanap", "9823011009", "123456780009", "Sinnar", "Clay Loam"),
    ("Santosh Wagh", "9823011010", "123456780010", "Chandwad", "Red Loam"),
    ("Dnyaneshwar Bhor", "9823011011", "123456780011", "Dindori", "Black Cotton"),
    ("Mangala Aher", "9823011012", "123456780012", "Niphad", "Alluvial Silt"),
    ("Nitin Gite", "9823011013", "123456780013", "Sinnar", "Medium Black"),
    ("Sachin Avhad", "9823011014", "123456780014", "Yeola", "Clay Loam"),
    ("Savita Borse", "9823011015", "123456780015", "Kalwan", "Black Cotton"),
    ("Pandurang Khairnar", "9823011016", "123456780016", "Dindori", "Black Cotton"),
    ("Alka Dhatrak", "9823011017", "123456780017", "Niphad", "Clay Loam"),
    ("Ashok Sonawane", "9823011018", "123456780018", "Sinnar", "Red Sandy Loam"),
    ("Rohini Jagtap", "9823011019", "123456780019", "Chandwad", "Medium Black"),
    ("Sunil Suryawanshi", "9823011020", "123456780020", "Yeola", "Black Cotton"),
    ("Usha Gunjal", "9823011021", "123456780021", "Kalwan", "Alluvial Silt"),
    ("Kailas Pagare", "9823011022", "123456780022", "Dindori", "Black Cotton"),
    ("Vandana Pote", "9823011023", "123456780023", "Niphad", "Clay Loam"),
    ("Babasaheb Mate", "9823011024", "123456780024", "Sinnar", "Medium Black"),
    ("Pratibha Hande", "9823011025", "123456780025", "Chandwad", "Black Cotton"),
]

CROPS_CATALOG = [
    ("Thompson Seedless Grapes", "Rabi 2025-26", 14.5, 15.2, 6200.0, "Pimpalgaon Baswant APMC"),
    ("Nashik Red Onion", "Kharif 2025", 28.0, 27.4, 2450.0, "Lasalgaon APMC"),
    ("Bhagwa Pomegranate", "Late Kharif 2025", 9.5, 9.8, 8800.0, "Nashik APMC"),
    ("Pusa Ruby Tomato", "Kharif 2025", 45.0, 43.8, 1650.0, "Dindori Sub-Market"),
    ("JS 335 Soybean", "Kharif 2025", 12.0, 11.5, 4850.0, "Sinnar APMC"),
]


def generate_seed_records() -> Dict[str, List[Dict[str, Any]]]:
    """Build interconnected synthetic fixtures for all 9 entities."""
    fpo_id = FPO_DATA["fpo_id"]
    lender_sbi = LENDERS_DATA[0]["lender_id"]
    lender_nabard = LENDERS_DATA[1]["lender_id"]

    farmers = []
    parcels = []
    crop_cycles = []
    transactions = []
    credit_passports = []
    consents = []
    insurance_records = []

    base_lat = 20.0120
    base_lon = 73.8150

    for i, (name, phone, raw_aadhaar, village, soil) in enumerate(FARMER_NAMES):
        f_id = f"f0000000-0000-0000-0000-{i+1:012d}"
        p_id = f"p0000000-0000-0000-0000-{i+1:012d}"

        # 1. Farmer (One-way hashed Aadhaar)
        aadhaar_hash = hashlib.sha256(raw_aadhaar.encode("utf-8")).hexdigest()
        farmers.append({
            "farmer_id": f_id,
            "aadhaar_hash": aadhaar_hash,
            "full_name": name,
            "mobile_number": phone,
            "fpo_id": fpo_id,
            "is_active": True,
            "is_archived": False,
        })

        # 2. Land Parcel (PostGIS SRID 4326 Polygon around Nashik district)
        acreage = round(2.0 + (i % 5) * 1.25, 2)
        offset_lat = (i % 6) * 0.015
        offset_lon = (i // 6) * 0.018
        p1 = (round(base_lon + offset_lon, 5), round(base_lat + offset_lat, 5))
        p2 = (round(base_lon + offset_lon + 0.008, 5), round(base_lat + offset_lat, 5))
        p3 = (round(base_lon + offset_lon + 0.008, 5), round(base_lat + offset_lat + 0.007, 5))
        p4 = (round(base_lon + offset_lon, 5), round(base_lat + offset_lat + 0.007, 5))
        
        # WKT representation
        wkt_polygon = f"POLYGON(({p1[0]} {p1[1]}, {p2[0]} {p2[1]}, {p3[0]} {p3[1]}, {p4[0]} {p4[1]}, {p1[0]} {p1[1]}))"

        parcels.append({
            "parcel_id": p_id,
            "farmer_id": f_id,
            "survey_number": f"{140 + i * 4}/{1 + (i % 3)}",
            "acreage": acreage,
            "soil_type": soil,
            "irrigation_source": "Drip Irrigation (Canal)" if i % 2 == 0 else "Borewell + Solar Pump",
            "boundary_polygon": wkt_polygon,
        })

        # 3. Crop Cycle
        crop_info = CROPS_CATALOG[i % len(CROPS_CATALOG)]
        crop_name, season, exp_yield, act_yield, price, mandi = crop_info
        cycle_id = f"c0000000-0000-0000-0000-{i+1:012d}"
        
        sown = date(2025, 6, 15) if "Kharif" in season else date(2025, 10, 20)
        harvest = date(2025, 10, 10) if "Kharif" in season else date(2026, 2, 28)

        crop_cycles.append({
            "cycle_id": cycle_id,
            "farmer_id": f_id,
            "parcel_id": p_id,
            "crop_name": crop_name,
            "season": season,
            "expected_yield": round(exp_yield * float(acreage), 2),
            "actual_yield": round(act_yield * float(acreage), 2),
            "sown_date": sown.isoformat(),
            "harvest_date": harvest.isoformat(),
        })

        # 4. Market Transactions (2 transactions per farmer)
        for t_idx in range(2):
            t_id = f"t0000000-0000-0000-{(i*2)+t_idx+1:012d}"
            q_sold = round((act_yield * float(acreage)) * (0.45 if t_idx == 0 else 0.50), 2)
            t_date = harvest + timedelta(days=5 + t_idx * 12)
            transactions.append({
                "transaction_id": t_id,
                "farmer_id": f_id,
                "crop_name": crop_name,
                "quantity_sold": q_sold,
                "realization_price": round(price * (0.98 if t_idx == 0 else 1.02), 2),
                "mandi_name": mandi,
                "transaction_date": t_date.isoformat(),
                "verified_by_fpo": True if (i + t_idx) % 5 != 0 else False,
            })

        # 5. Credit Passport (Score 640 - 820)
        score = 660 + ((i * 19) % 155)
        credit_passports.append({
            "passport_id": f"cp000000-0000-0000-0000-{i+1:012d}",
            "farmer_id": f_id,
            "agritrust_score": score,
            "data_confidence": round(0.88 + ((i % 10) * 0.01), 4),
            "safe_credit_min": round(float(acreage) * 60000.0, 2),
            "safe_credit_max": round(float(acreage) * 140000.0, 2),
            "model_version": "v1.2.0-ensemble",
        })

        # 6. Data Consent (Stage 5)
        target_lender = lender_sbi if i % 2 == 0 else lender_nabard
        now = datetime.now(timezone.utc)
        consents.append({
            "consent_id": f"cn000000-0000-0000-0000-{i+1:012d}",
            "farmer_id": f_id,
            "lender_id": target_lender,
            "shared_attributes": ["credit_score", "satellite_ndvi", "harvest_history"],
            "expires_at": (now + timedelta(days=30 + (i % 30))).isoformat(),
            "is_active": True if i != 2 else False,  # 1 revoked for testing
            "granted_at": now.isoformat(),
            "revoked_at": (now - timedelta(days=2)).isoformat() if i == 2 else None,
        })

        # 7. Insurance Record (PMFBY)
        insurance_records.append({
            "insurance_id": f"in000000-0000-0000-0000-{i+1:012d}",
            "farmer_id": f_id,
            "scheme_name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
            "season": season,
            "premium_paid": round(float(acreage) * 1850.0, 2),
            "claim_amount": round(float(acreage) * 12000.0, 2) if i % 6 == 0 else 0.0,
            "claim_status": "SETTLED" if i % 6 == 0 else "NO_CLAIM",
        })

    return {
        "fpos": [FPO_DATA],
        "lenders": LENDERS_DATA,
        "farmers": farmers,
        "land_parcels": parcels,
        "crop_cycles": crop_cycles,
        "market_transactions": transactions,
        "credit_passports": credit_passports,
        "data_consents": consents,
        "insurance_records": insurance_records,
    }


def generate_sql_insert_script(data: Dict[str, List[Dict[str, Any]]]) -> str:
    """Generate pure SQL INSERT script compatible with psql / docker-compose init."""
    lines = [
        "-- =============================================================================",
        "-- KisanCred / AgriTrust — Synthetic Seed Data Fixtures",
        "-- 1 FPO, 2 Lenders, 25 Farmers, Parcels (PostGIS Polygons), Cycles, Mandi & Insurance",
        "-- =============================================================================",
        "BEGIN;",
        "",
    ]

    # 1. FPO
    f = data["fpos"][0]
    lines.append(f"INSERT INTO fpos (fpo_id, fpo_name, registration_number, region, member_count) "
                 f"VALUES ('{f['fpo_id']}', '{f['fpo_name']}', '{f['registration_number']}', '{f['region']}', {f['member_count']}) "
                 f"ON CONFLICT (fpo_id) DO NOTHING;")

    # 2. Lenders
    for l in data["lenders"]:
        lines.append(f"INSERT INTO lenders (lender_id, institution_name, api_key_hash, tier) "
                     f"VALUES ('{l['lender_id']}', '{l['institution_name']}', '{l['api_key_hash']}', '{l['tier']}') "
                     f"ON CONFLICT (lender_id) DO NOTHING;")

    # 3. Farmers
    for fm in data["farmers"]:
        lines.append(f"INSERT INTO farmers (farmer_id, aadhaar_hash, full_name, mobile_number, fpo_id, is_active, is_archived) "
                     f"VALUES ('{fm['farmer_id']}', '{fm['aadhaar_hash']}', '{fm['full_name']}', '{fm['mobile_number']}', '{fm['fpo_id']}', {str(fm['is_active']).lower()}, {str(fm['is_archived']).lower()}) "
                     f"ON CONFLICT (farmer_id) DO NOTHING;")

    # 4. Land Parcels with PostGIS ST_GeomFromText
    for lp in data["land_parcels"]:
        lines.append(f"INSERT INTO land_parcels (parcel_id, farmer_id, survey_number, acreage, soil_type, irrigation_source, boundary_polygon) "
                     f"VALUES ('{lp['parcel_id']}', '{lp['farmer_id']}', '{lp['survey_number']}', {lp['acreage']}, '{lp['soil_type']}', '{lp['irrigation_source']}', ST_GeomFromText('{lp['boundary_polygon']}', 4326)) "
                     f"ON CONFLICT (parcel_id) DO NOTHING;")

    # 5. Crop Cycles
    for cc in data["crop_cycles"]:
        act_val = cc['actual_yield'] if cc['actual_yield'] is not None else "NULL"
        lines.append(f"INSERT INTO crop_cycles (cycle_id, farmer_id, parcel_id, crop_name, season, expected_yield, actual_yield, sown_date, harvest_date) "
                     f"VALUES ('{cc['cycle_id']}', '{cc['farmer_id']}', '{cc['parcel_id']}', '{cc['crop_name']}', '{cc['season']}', {cc['expected_yield']}, {act_val}, '{cc['sown_date']}', '{cc['harvest_date']}') "
                     f"ON CONFLICT (cycle_id) DO NOTHING;")

    # 6. Market Transactions
    for mt in data["market_transactions"]:
        lines.append(f"INSERT INTO market_transactions (transaction_id, farmer_id, crop_name, quantity_sold, realization_price, mandi_name, transaction_date, verified_by_fpo) "
                     f"VALUES ('{mt['transaction_id']}', '{mt['farmer_id']}', '{mt['crop_name']}', {mt['quantity_sold']}, {mt['realization_price']}, '{mt['mandi_name']}', '{mt['transaction_date']}', {str(mt['verified_by_fpo']).lower()}) "
                     f"ON CONFLICT (transaction_id) DO NOTHING;")

    # 7. Credit Passports
    for cp in data["credit_passports"]:
        lines.append(f"INSERT INTO credit_passports (passport_id, farmer_id, agritrust_score, data_confidence, safe_credit_min, safe_credit_max, model_version) "
                     f"VALUES ('{cp['passport_id']}', '{cp['farmer_id']}', {cp['agritrust_score']}, {cp['data_confidence']}, {cp['safe_credit_min']}, {cp['safe_credit_max']}, '{cp['model_version']}') "
                     f"ON CONFLICT (passport_id) DO NOTHING;")

    # 8. Data Consents
    for dc in data["data_consents"]:
        attrs = "ARRAY['" + "','".join(dc['shared_attributes']) + "']"
        rev_val = f"'{dc['revoked_at']}'" if dc['revoked_at'] else "NULL"
        lines.append(f"INSERT INTO data_consents (consent_id, farmer_id, lender_id, shared_attributes, expires_at, is_active, granted_at, revoked_at) "
                     f"VALUES ('{dc['consent_id']}', '{dc['farmer_id']}', '{dc['lender_id']}', {attrs}, '{dc['expires_at']}', {str(dc['is_active']).lower()}, '{dc['granted_at']}', {rev_val}) "
                     f"ON CONFLICT (consent_id) DO NOTHING;")

    # 9. Insurance Records
    for ir in data["insurance_records"]:
        lines.append(f"INSERT INTO insurance_records (insurance_id, farmer_id, scheme_name, season, premium_paid, claim_amount, claim_status) "
                     f"VALUES ('{ir['insurance_id']}', '{ir['farmer_id']}', '{ir['scheme_name']}', '{ir['season']}', {ir['premium_paid']}, {ir['claim_amount']}, '{ir['claim_status']}') "
                     f"ON CONFLICT (insurance_id) DO NOTHING;")

    lines.append("")
    lines.append("COMMIT;")
    return "\n".join(lines)


if __name__ == "__main__":
    records = generate_seed_records()
    print(f"Generated {len(records['farmers'])} Farmers, {len(records['land_parcels'])} Parcels, {len(records['crop_cycles'])} Cycles, {len(records['market_transactions'])} Transactions")
    
    # Save SQL fixture file for Docker/psql import
    sql_script = generate_sql_insert_script(records)
    fixture_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "infra", "docker")
    os.makedirs(fixture_dir, exist_ok=True)
    sql_path = os.path.join(fixture_dir, "seed-data.sql")
    with open(sql_path, "w", encoding="utf-8") as f:
        f.write(sql_script)
    print(f"Written SQL fixture to {sql_path}")
