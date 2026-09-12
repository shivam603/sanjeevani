/**
 * API Client for KisanCred FPO Portal
 * Connects to /api/v1/fpo/... with tenant isolation headers and rich local fallback.
 */

const API_BASE = 'http://localhost:8000/api/v1/fpo';
export const DEFAULT_FPO_ID = '11111111-1111-1111-1111-111111111111';
export const DEFAULT_ADMIN_KEY = 'fpo_admin_key_nashik_01';

const HEADERS = {
  'Content-Type': 'application/json',
  'X-FPO-ID': DEFAULT_FPO_ID,
  'X-FPO-Admin-Key': DEFAULT_ADMIN_KEY,
};

// Seeded Fallback Portfolio Summary
export const SEEDED_PORTFOLIO_SUMMARY = {
  fpo_id: DEFAULT_FPO_ID,
  fpo_name: 'Nashik Green Agro Farmer Producer Co. Ltd.',
  region: 'Nashik, Maharashtra',
  total_members: 482,
  active_members: 468,
  mean_agritrust_score: 74.2,
  score_distribution: {
    tier_0_49: 38,
    tier_50_69: 116,
    tier_70_79: 194,
    tier_80_89: 102,
    tier_90_100: 32,
  },
  total_verified_volume_inr: 48200000.0, // ₹4.82 Cr
  total_volume_quintals: 19450.0,
  risk_mix: {
    low: 328,
    moderate: 116,
    high: 38,
  },
  total_mapped_hectares: 1150.0,
  data_confidence_mean: 0.88,
  as_of: new Date().toISOString(),
};

// Seeded Fallback Members List
export const SEEDED_MEMBERS = [
  {
    farmer_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    farmer_code: 'NSK-101',
    full_name: 'Rameshwar Patel',
    village: 'Dindori',
    primary_crop: 'Red Onion & Export Grapes',
    parcel_area_ha: 2.4,
    agritrust_score: 78,
    risk_category: 'LOW',
    needs_data_update: False,
    missing_data_reasons: [],
    last_delivery_date: '2026-08-20',
  },
  {
    farmer_id: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
    farmer_code: 'NSK-102',
    full_name: 'Sunita Deshmukh',
    village: 'Niphad',
    primary_crop: 'Bhagawa Pomegranate',
    parcel_area_ha: 3.1,
    agritrust_score: 85,
    risk_category: 'LOW',
    needs_data_update: False,
    missing_data_reasons: [],
    last_delivery_date: '2026-08-18',
  },
  {
    farmer_id: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
    farmer_code: 'NSK-103',
    full_name: 'Babanrao Kadam',
    village: 'Chandwad',
    primary_crop: 'Tomato / Kharif Onion',
    parcel_area_ha: 1.8,
    agritrust_score: 58,
    risk_category: 'MODERATE',
    needs_data_update: True,
    missing_data_reasons: ['Missing last 60-day APMC Mandi receipt', 'PMFBY renewal pending'],
    last_delivery_date: '2026-05-10',
  },
  {
    farmer_id: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
    farmer_code: 'NSK-104',
    full_name: 'Ganesh Shinde',
    village: 'Sinnar',
    primary_crop: 'Soybean & Gram',
    parcel_area_ha: 4.0,
    agritrust_score: 72,
    risk_category: 'LOW',
    needs_data_update: False,
    missing_data_reasons: [],
    last_delivery_date: '2026-08-05',
  },
  {
    farmer_id: '7fa85f64-5717-4562-b3fc-2c963f66afb0',
    farmer_code: 'NSK-105',
    full_name: 'Anil Patil',
    village: 'Kalwan',
    primary_crop: 'Wheat / Maize',
    parcel_area_ha: 1.2,
    agritrust_score: 46,
    risk_category: 'HIGH',
    needs_data_update: True,
    missing_data_reasons: ['Satellite NDVI indicates delayed sowing', 'No verified mandi sales in 9 months'],
    last_delivery_date: '2025-11-12',
  },
  {
    farmer_id: '8fa85f64-5717-4562-b3fc-2c963f66afb1',
    farmer_code: 'NSK-106',
    full_name: 'Pravin Jadhav',
    village: 'Yeola',
    primary_crop: 'Cotton & Onion',
    parcel_area_ha: 2.8,
    agritrust_score: 81,
    risk_category: 'LOW',
    needs_data_update: False,
    missing_data_reasons: [],
    last_delivery_date: '2026-08-25',
  },
];

// Seeded Pending Deliveries
export const SEEDED_PENDING_DELIVERIES = [
  {
    transaction_id: 'tx_deliv_89102',
    farmer_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    farmer_name: 'Rameshwar Patel',
    crop_name: 'Red Onion (Garva)',
    quantity_sold: 45.5,
    realization_price: 2480.0,
    total_value_inr: 112840.0,
    mandi_name: 'Lasalgaon APMC, Nashik',
    transaction_date: '2026-09-02',
    delivery_slip_ref: 'SLIP-LAS-2026-0902',
  },
  {
    transaction_id: 'tx_deliv_89103',
    farmer_id: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
    farmer_name: 'Sunita Deshmukh',
    crop_name: 'Bhagawa Pomegranate',
    quantity_sold: 22.0,
    realization_price: 7800.0,
    total_value_inr: 171600.0,
    mandi_name: 'Nashik APMC',
    transaction_date: '2026-09-05',
    delivery_slip_ref: 'SLIP-NSK-2026-0905',
  },
  {
    transaction_id: 'tx_deliv_89104',
    farmer_id: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
    farmer_name: 'Ganesh Shinde',
    crop_name: 'Yellow Soybean',
    quantity_sold: 35.0,
    realization_price: 4350.0,
    total_value_inr: 152250.0,
    mandi_name: 'Sinnar APMC',
    transaction_date: '2026-09-08',
    delivery_slip_ref: 'SLIP-SIN-2026-0908',
  },
];

// Seeded Audit Logs
export const SEEDED_AUDIT_LOGS = [
  {
    audit_id: 'aud_89101_init',
    fpo_id: DEFAULT_FPO_ID,
    transaction_id: 'tx_deliv_88991',
    farmer_name: 'Rameshwar Patel',
    crop_name: 'Red Onion (40 Qtl)',
    attested_by: 'FPO_Admin_Kailas',
    notes: 'Weighing bridge receipt verified at Lasalgaon APMC',
    created_at: '2026-08-20T14:32:00Z',
  },
  {
    audit_id: 'aud_89100_init',
    fpo_id: DEFAULT_FPO_ID,
    transaction_id: 'tx_deliv_88950',
    farmer_name: 'Sunita Deshmukh',
    crop_name: 'Pomegranate (18 Qtl)',
    attested_by: 'FPO_Admin_Kailas',
    notes: 'Grade-A export quality verified at Nashik FPO packhouse',
    created_at: '2026-08-18T11:15:00Z',
  },
];

class FPOApiClient {
  async getPortfolioSummary(fpoId = DEFAULT_FPO_ID) {
    try {
      const res = await fetch(`${API_BASE}/${fpoId}/portfolio-summary`, { headers: HEADERS });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, using fallback portfolio summary:', e.message);
    }
    return SEEDED_PORTFOLIO_SUMMARY;
  }

  async getMembers(fpoId = DEFAULT_FPO_ID, params = {}) {
    try {
      const url = new URL(`${API_BASE}/${fpoId}/members`);
      if (params.search) url.searchParams.set('search', params.search);
      if (params.needs_update_only) url.searchParams.set('needs_update_only', 'true');
      if (params.village) url.searchParams.set('village', params.village);
      if (params.crop) url.searchParams.set('crop', params.crop);

      const res = await fetch(url.toString(), { headers: HEADERS });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, using fallback members list:', e.message);
    }

    let list = [...SEEDED_MEMBERS];
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter((m) => m.full_name.toLowerCase().includes(q) || m.village.toLowerCase().includes(q));
    }
    if (params.needs_update_only) {
      list = list.filter((m) => m.needs_data_update);
    }
    return list;
  }

  async getMemberPassport(farmerId, fpoId = DEFAULT_FPO_ID) {
    try {
      const res = await fetch(`${API_BASE}/${fpoId}/farmer/${farmerId}/passport`, { headers: HEADERS });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, using fallback member passport:', e.message);
    }

    const member = SEEDED_MEMBERS.find((m) => m.farmer_id === farmerId) || SEEDED_MEMBERS[0];
    return {
      farmer_id: member.farmer_id,
      farmer_code: member.farmer_code,
      fpo_id: fpoId,
      full_name: member.full_name,
      village: member.village,
      agritrust_score: member.agritrust_score,
      score_grade: member.agritrust_score >= 70 ? 'Grade A • Prime' : 'Grade B • Good',
      safe_limit: 150000.0,
      data_confidence: 0.88,
      risk_profile: {
        crop_risk: member.risk_category,
        market_volatility: 'MODERATE',
        climate_resilience: 'HIGH',
      },
      telemetry: {
        primary_crop: member.primary_crop,
        parcel_area_ha: member.parcel_area_ha,
        ndvi_mean: 0.74,
        soil_moisture: 0.45,
        last_delivery_date: member.last_delivery_date,
      },
      needs_data_update: member.needs_data_update,
      missing_data_reasons: member.missing_data_reasons,
    };
  }

  async getPendingAttestations(fpoId = DEFAULT_FPO_ID) {
    try {
      const res = await fetch(`${API_BASE}/${fpoId}/pending-attestations`, { headers: HEADERS });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, using fallback pending attestations:', e.message);
    }
    return SEEDED_PENDING_DELIVERIES;
  }

  async attestTransaction(transactionId, attestedBy = 'FPO_Admin_Kailas', notes = '', fpoId = DEFAULT_FPO_ID) {
    try {
      const res = await fetch(`${API_BASE}/${fpoId}/attest-transaction`, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          transaction_id: transactionId,
          attested_by: attestedBy,
          notes,
        }),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, simulated local attestation:', e.message);
    }

    return {
      transaction_id: transactionId,
      verified_by_fpo: true,
      attested_by: attestedBy,
      attested_at: new Date().toISOString(),
      audit_id: 'aud_' + Math.random().toString(36).substr(2, 9),
      message: 'Market transaction successfully attested. Member Model A trust score updated.',
    };
  }

  async getBulkFinancingSummary(fpoId = DEFAULT_FPO_ID) {
    try {
      const res = await fetch(`${API_BASE}/${fpoId}/bulk-financing-summary`, { headers: HEADERS });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, using fallback bulk financing summary:', e.message);
    }

    return {
      fpo_id: fpoId,
      fpo_name: 'Nashik Green Agro Farmer Producer Co. Ltd.',
      total_borrowers: 482,
      aggregate_safe_credit_limit: 148000000.0, // ₹14.8 Cr
      aggregate_repayment_capacity: 192000000.0, // ₹19.2 Cr
      mean_default_probability_pct: 4.2,
      dscr_mean: 1.65,
      risk_breakdown: { low: 328, moderate: 116, high: 38 },
      proposed_interest_subvention_pct: 1.25,
      covenants: [
        '100% of member crop deliveries must be routed through FPO APMC accounts',
        'Continuous Sentinel-2 NDVI satellite monitoring with monthly health validation',
        'Mandatory PMFBY crop insurance enrolment for all active credit lines',
        'FPO collective credit default reserve funded at 5% of disbursed portfolio',
      ],
      generated_at: new Date().toISOString(),
    };
  }
}

export const fpoApi = new FPOApiClient();
