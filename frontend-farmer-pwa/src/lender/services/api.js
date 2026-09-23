/**
 * API Service for KisanCred Lender Underwriting Terminal.
 * Connects to FastAPI backend at http://localhost:8000/api/v1/lender/...
 * Includes local resilient fallbacks for offline demo operations.
 */

// Dynamic API Base URL supporting localhost, Render environment variables, and production
const getApiBase = () => {
  if (import.meta.env?.VITE_API_BASE_URL) {
    const custom = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
    return custom.endsWith('/lender') ? custom : `${custom}/api/v1/lender`;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000/api/v1/lender';
  }
  return '/api/v1/lender';
};

const API_BASE_URL = getApiBase();
const LENDER_API_KEY = 'test_lender_key_sbi_01';


// Default headers for lender authentication
const getHeaders = (consentToken = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': LENDER_API_KEY,
  };
  if (consentToken) {
    headers['X-Consent-Token'] = consentToken;
  }
  return headers;
};

// Fallback Mock Data for Portfolio (active consent only)
const MOCK_CONSENTED_PORTFOLIO = [
  {
    farmer_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    farmer_code: 'NSK-101',
    crop_name: 'Red Onion & Export Grapes',
    region: 'Dindori, Nashik',
    agritrust_score: 78,
    score_grade: 'Grade A • Prime',
    risk_category: 'LOW',
    safe_limit: 150000.0,
    consent_status: 'active',
    consent_expires_at: '2026-10-10T12:00:00Z',
    consent_token: 'hmac_sha256_sbi_demo.78f92ab84c019d3e8',
    lender_id: '88888888-8888-8888-8888-888888888888',
  },
  {
    farmer_id: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
    farmer_code: 'NSK-102',
    crop_name: 'Bhagawa Pomegranate',
    region: 'Niphad, Nashik',
    agritrust_score: 85,
    score_grade: 'Grade AA • Super Prime',
    risk_category: 'LOW',
    safe_limit: 220000.0,
    consent_status: 'active',
    consent_expires_at: '2026-10-04T12:00:00Z',
    consent_token: 'hmac_sha256_sbi_demo.99a81bc334e10c2a7',
    lender_id: '88888888-8888-8888-8888-888888888888',
  },
  {
    farmer_id: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
    farmer_code: 'NSK-104',
    crop_name: 'Soybean & Gram',
    region: 'Sinnar, Nashik',
    agritrust_score: 72,
    score_grade: 'Grade A • Prime',
    risk_category: 'LOW',
    safe_limit: 135000.0,
    consent_status: 'active',
    consent_expires_at: '2026-09-27T12:00:00Z',
    consent_token: 'hmac_sha256_sbi_demo.33d45ef889a71b2e1',
    lender_id: '88888888-8888-8888-8888-888888888888',
  },
];

// Fallback Mock Dossier
const MOCK_DOSSIER = {
  farmer_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  farmer_code: 'NSK-101',
  passport_id: 'pass_78492019-d83a-493a-810a-203847291a0b',
  consent_info: {
    status: 'active',
    expires_at: '2026-10-10T12:00:00Z',
    token: 'hmac_sha256_sbi_demo.78f92ab84c019d3e8',
    granted_scopes: ['agritrust_score', 'safe_limit', 'crop_risk', 'satellite_ndvi'],
  },
  agritrust_score: 78,
  score_grade: 'Grade A • Prime',
  data_confidence: 0.88,
  cash_flow: {
    expected_yield_qtl: 95.0,
    realization_price_inr: 2450.0,
    gross_revenue_inr: 232750.0,
    input_costs_inr: 65000.0,
    existing_obligations_inr: 15000.0,
    net_cashflow_inr: 152750.0,
    safe_credit_limit_inr: 150000.0,
    dscr: 1.75,
  },
  price_projections: {
    crop_name: 'Red Onion (Garva)',
    benchmark_mandi: 'Lasalgaon APMC, Nashik',
    current_modal_price: 2450.0,
    scenarios: [
      { horizon_days: 30, base_price: 2480.0, optimistic_price: 2850.0, downside_price: 2150.0 },
      { horizon_days: 60, base_price: 2520.0, optimistic_price: 2950.0, downside_price: 2050.0 },
      { horizon_days: 90, base_price: 2600.0, optimistic_price: 3100.0, downside_price: 1980.0 },
    ],
  },
  crop_risk: {
    crop_name: 'Red Onion & Table Grapes',
    overall_risk_score: 0.22,
    risk_category: 'LOW',
    climate_resilience_score: 0.88,
    pest_disease_index: 0.15,
    water_stress_score: 0.18,
    price_volatility_score: 0.32,
  },
  lender_explanation: {
    audience: 'lender',
    summary:
      'CREDIT COMMITTEE MEMORANDUM: Applicant demonstrates robust agricultural repayment capacity backed by 3 verified seasons of consistent onion/grape yields and active FPO marketing. Estimated Probability of Default (PD) is 3.8% (Rating: Grade A • Prime). Net seasonal cashflow supports a safe credit boundary of ₹1,50,000 with a healthy 1.75x Debt Service Coverage Ratio.',
    key_metrics: {
      probability_of_default_pct: 3.8,
      dscr: 1.75,
      safe_credit_boundary_inr: 150000.0,
      satellite_biomass_verified: true,
      fpo_guarantee_multiplier: 1.25,
    },
    underwriting_covenants: [
      'Mandatory PMFBY crop insurance enrollment before seasonal cut-off date',
      'Disbursement tied to verified input purchase vouchers at Nashik FPO store',
      'Harvest sale proceeds settlement via FPO escrow APMC bank account',
    ],
  },
};

// Fallback Mock Consent Requests
let mockConsentRequests = [
  {
    request_id: 'req_cns_89102',
    lender_id: '88888888-8888-8888-8888-888888888888',
    farmer_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    status: 'APPROVED',
    loan_purpose: 'KCC Season Limit Assessment',
    requested_attributes: ['agritrust_score', 'safe_limit', 'crop_risk', 'satellite_ndvi'],
    created_at: '2026-08-15T10:00:00Z',
  },
  {
    request_id: 'req_cns_89103',
    lender_id: '88888888-8888-8888-8888-888888888888',
    farmer_id: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
    status: 'PENDING',
    loan_purpose: 'Drip Irrigation Asset Finance',
    requested_attributes: ['agritrust_score', 'safe_limit'],
    created_at: '2026-09-01T14:20:00Z',
  },
];

// Fallback Mock Loan Decisions
let mockLoanDecisions = [
  {
    decision_id: 'dec_89101_init',
    passport_id: 'pass_78492019-d83a-493a-810a-203847291a0b',
    farmer_id: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
    decision: 'APPROVED',
    approved_amount: 220000.0,
    tenure_months: 12,
    interest_rate_pct: 7.0,
    covenants: 'Mandatory PMFBY crop insurance enrollment',
    underwriter_id: 'SBI_Underwriter_Vikram',
    created_at: '2026-08-25T11:00:00Z',
    message: 'Approved under SBI Agri Priority Sector Lending scheme.',
  },
];

export async function fetchConsentedPortfolio(filters = {}) {
  const query = new URLSearchParams();
  if (filters.crop) query.append('crop', filters.crop);
  if (filters.region) query.append('region', filters.region);
  if (filters.min_score) query.append('min_score', filters.min_score);
  if (filters.risk_category) query.append('risk_category', filters.risk_category);

  try {
    const res = await fetch(`${API_BASE_URL}/portfolio?${query.toString()}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using consented mock portfolio:', err);
    return MOCK_CONSENTED_PORTFOLIO.filter((f) => {
      if (filters.crop && !f.crop_name.toLowerCase().includes(filters.crop.toLowerCase())) return false;
      if (filters.region && !f.region.toLowerCase().includes(filters.region.toLowerCase())) return false;
      if (filters.min_score && f.agritrust_score < Number(filters.min_score)) return false;
      if (filters.risk_category && f.risk_category !== filters.risk_category) return false;
      return true;
    });
  }
}

export async function fetchUnderwritingDossier(farmerId, consentToken = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/farmer/${farmerId}/underwriting-dossier`, {
      headers: getHeaders(consentToken),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, returning fallback dossier:', err);
    return {
      ...MOCK_DOSSIER,
      farmer_id: farmerId,
    };
  }
}

export async function createConsentRequest(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/consent-requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, creating local mock consent request:', err);
    const mockCreated = {
      request_id: `req_cns_${Math.random().toString(36).substr(2, 8)}`,
      lender_id: '88888888-8888-8888-8888-888888888888',
      farmer_id: payload.farmer_id,
      status: 'PENDING',
      loan_purpose: payload.loan_purpose,
      requested_attributes: payload.requested_attributes || ['agritrust_score', 'safe_limit'],
      created_at: new Date().toISOString(),
    };
    mockConsentRequests.unshift(mockCreated);
    return mockCreated;
  }
}

export async function fetchConsentRequests() {
  try {
    const res = await fetch(`${API_BASE_URL}/consent-requests`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, returning mock consent requests:', err);
    return mockConsentRequests;
  }
}

export async function recordLoanDecision(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/loan-decisions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, recording mock loan decision:', err);
    const mockDecision = {
      decision_id: `dec_${Math.random().toString(36).substr(2, 8)}`,
      passport_id: payload.passport_id,
      farmer_id: payload.farmer_id,
      decision: payload.decision,
      approved_amount: payload.approved_amount,
      tenure_months: payload.tenure_months,
      interest_rate_pct: payload.interest_rate_pct,
      covenants: payload.covenants,
      underwriter_id: 'SBI_Underwriter_Vikram',
      created_at: new Date().toISOString(),
      message: `Loan decision '${payload.decision}' logged against passport '${payload.passport_id}'.`,
    };
    mockLoanDecisions.unshift(mockDecision);
    return mockDecision;
  }
}

export async function fetchLoanDecisions() {
  try {
    const res = await fetch(`${API_BASE_URL}/loan-decisions`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, returning mock decisions:', err);
    return mockLoanDecisions;
  }
}
