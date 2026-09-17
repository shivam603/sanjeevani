/**
 * Stage 5 API Client & Offline Storage Adapter for KisanCred Farmer PWA
 * Connects to FastAPI backend (/api/v1/...) with zero-breakage offline fallback.
 */

// Dynamic API Base URL supporting localhost, Render environment variables, and production
const getApiBase = () => {
  if (import.meta.env?.VITE_API_BASE_URL) {
    const custom = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
    return custom.endsWith('/api/v1') ? custom : `${custom}/api/v1`;
  }
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000/api/v1';
  }
  return '/api/v1';
};

const API_BASE = getApiBase();
export const DEFAULT_FARMER_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';


// Seeded high-fidelity fallback passbook matching Stage 3 & Stage 4 outputs
export const SEEDED_FALLBACK_PASSPORT = {
  passport_id: 'pass_78492019-d83a-493a-810a-203847291a0b',
  farmer_id: DEFAULT_FARMER_ID,
  agritrust_score: 78, // 0-100 scale
  score_grade: 'Grade A • Prime',
  data_confidence: 0.88, // 88% complete
  generated_at: new Date().toISOString(),
  safe_credit_min: 120000,
  safe_credit_max: 185000,
  safe_limit: 150000,
  recommended_tenure_months: 12,
  loan_purpose: 'Kharif Crop Production & Input Financing',
  expected_repayment_capacity: 195000,
  risk_profile: {
    crop_risk: 'LOW',
    market_volatility: 'MODERATE',
    climate_resilience: 'HIGH',
  },
  telemetry: {
    ndvi_mean: 0.74,
    ndvi_status: 'Optimal Biomass (Healthy Crop)',
    moisture_index: 0.45,
    moisture_status: 'Adequate Moisture',
    primary_crop: 'Nashik Export Onion & Grapes',
    parcel_area_ha: 2.4,
    survey_number: '184/A',
    fpo_name: 'Nashik Green Agro Farmer Producer Co. Ltd.',
    fpo_tenure_years: 2.4,
    fpo_verified_cycles: 5,
    last_mandi_price: 2450, // ₹/Quintal
    mandi_name: 'Lasalgaon APMC',
    insurance_active: true,
    insurance_scheme: 'PMFBY Kharif 2026',
  },
  // Stage 4 Plain-Language Explanation
  explanation: {
    audience: 'farmer',
    summary:
      'Namaste Rameshwar ji! Your AgriTrust score is 78/100 (Grade A • Prime). Your score is very strong because your last 3 seasons of Onion and Soybean harvests were fully verified with consistent yields and sold transparently through your Nashik FPO.',
    positive_drivers: [
      'Verified harvest yield consistency across 3 consecutive seasons (+18 pts)',
      'Active FPO membership with continuous transaction track record for 2.4 years (+14 pts)',
      'Sentinel-2 satellite radar confirmed healthy biomass (NDVI 0.74) on parcel #184/A (+12 pts)',
      'Active PMFBY crop insurance coverage protecting against monsoon delays (+10 pts)',
    ],
    caution_drivers: [
      'Mandi price volatility in Lasalgaon wholesale arrivals slightly elevated price risk (-4 pts)',
    ],
    actionable_prompts: [
      'Upload your last Lasalgaon APMC sale receipt to verify transaction volume (+8 to 12 points)',
      'Confirm parcel GPS boundaries using field photo tag (+5 points)',
      'Enroll upcoming Rabi cycle in PMFBY before the cut-off date (+10 points)',
    ],
  },
};

// Seeded registered institutional lenders
export const SEEDED_LENDERS = [
  {
    lender_id: '88888888-8888-8888-8888-888888888888',
    name: 'State Bank of India — Agri Division',
    branch: 'Nashik Rural Agri Banking Center',
    logo: '🏦',
    status: 'active',
    consent_id: 'cns_sbi_847192',
    granted_at: '2026-08-15T10:30:00Z',
    expires_at: '2026-11-15T10:30:00Z',
    token: 'hmac_sha256_sbi_demo.78f92ab84c019d3e8',
    shared_attributes: [
      'agritrust_score',
      'safe_limit',
      'crop_risk',
      'satellite_ndvi',
    ],
  },
  {
    lender_id: '99999999-9999-9999-9999-999999999999',
    name: 'HDFC Rural Lending',
    branch: 'Niphad Taluka Hub',
    logo: '🏛️',
    status: 'revoked',
    consent_id: 'cns_hdfc_392018',
    granted_at: '2026-05-10T12:00:00Z',
    expires_at: '2026-08-10T12:00:00Z',
    token: 'hmac_sha256_hdfc_demo.12e45da79b',
    shared_attributes: ['agritrust_score'],
  },
  {
    lender_id: '77777777-7777-7777-7777-777777777777',
    name: 'Bank of Baroda — Kisan Credit Center',
    branch: 'Dindori Branch',
    logo: '💳',
    status: 'none',
    consent_id: null,
    granted_at: null,
    expires_at: null,
    token: null,
    shared_attributes: ['agritrust_score', 'safe_limit'],
  },
  {
    lender_id: '66666666-6666-6666-6666-666666666666',
    name: 'NABARD Rural Development Cooperative',
    branch: 'Maharashtra Regional Office',
    logo: '🌱',
    status: 'none',
    consent_id: null,
    granted_at: null,
    expires_at: null,
    token: null,
    shared_attributes: ['agritrust_score', 'satellite_ndvi', 'market_history'],
  },
];

// The API stores credit scores on a 300–900 scale; the farmer UI displays the
// equivalent 0–100 AgriTrust scale.
const normalizePassport = (payload) => {
  const rawScore = Number(payload?.agritrust_score);
  const score = rawScore > 100
    ? Math.round(Math.max(0, Math.min(100, (rawScore - 300) / 6)))
    : (Number.isFinite(rawScore) ? rawScore : SEEDED_FALLBACK_PASSPORT.agritrust_score);
  const market = payload?.market_prices_scenario || {};
  const risk = payload?.crop_risk || {};
  const maxLimit = Number(payload?.safe_credit_max) || SEEDED_FALLBACK_PASSPORT.safe_credit_max;

  return {
    ...SEEDED_FALLBACK_PASSPORT,
    ...payload,
    agritrust_score: score,
    score_grade: payload?.rating_tier || SEEDED_FALLBACK_PASSPORT.score_grade,
    safe_credit_min: Number(payload?.safe_credit_min) || SEEDED_FALLBACK_PASSPORT.safe_credit_min,
    safe_credit_max: maxLimit,
    safe_limit: maxLimit,
    risk_profile: {
      ...SEEDED_FALLBACK_PASSPORT.risk_profile,
      crop_risk: risk.risk_category?.toUpperCase() || SEEDED_FALLBACK_PASSPORT.risk_profile.crop_risk,
    },
    telemetry: {
      ...SEEDED_FALLBACK_PASSPORT.telemetry,
      last_mandi_price: market.base_realization_price || SEEDED_FALLBACK_PASSPORT.telemetry.last_mandi_price,
      mandi_name: market.mandi_name || SEEDED_FALLBACK_PASSPORT.telemetry.mandi_name,
      primary_crop: market.crop_name || SEEDED_FALLBACK_PASSPORT.telemetry.primary_crop,
    },
  };
};

class ApiClient {
  constructor() {
    this.cachedPassport = null;
    this.cachedLenders = null;
  }

  /**
   * Fetch complete credit passport + Stage 4 plain-language explanation
   * @param {string} farmerId
   * @returns {Promise<Object>}
   */
  async getFarmerPassport(farmerId = DEFAULT_FARMER_ID) {
    try {
      const res = await fetch(`${API_BASE}/farmer/${farmerId}/passport`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        const passport = normalizePassport(data);
        this.cachedPassport = passport;
        localStorage.setItem('kisancred_cached_passport', JSON.stringify(passport));
        return passport;
      }
    } catch (err) {
      console.warn('API server unreachable, using cached/seeded passbook:', err.message);
    }

    // Try localStorage
    try {
      const stored = localStorage.getItem('kisancred_cached_passport');
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    // Fallback to seeded demo passbook
    return SEEDED_FALLBACK_PASSPORT;
  }

  /**
   * Request async credit passport refresh
   * @param {string} farmerId
   * @returns {Promise<Object>}
   */
  async refreshPassport(farmerId = DEFAULT_FARMER_ID) {
    try {
      const res = await fetch(`${API_BASE}/farmer/${farmerId}/refresh-passport`, {
        method: 'POST',
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Refresh API offline, simulated local update:', err.message);
    }

    return {
      job_id: 'job_' + Math.random().toString(36).substr(2, 9),
      farmer_id: farmerId,
      status: 'processing',
      message: 'Passport recalculation initiated.',
      queued_at: new Date().toISOString(),
    };
  }

  /**
   * Get all registered lenders and consent states
   */
  getLenders() {
    try {
      const stored = localStorage.getItem('kisancred_cached_lenders');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return SEEDED_LENDERS;
  }

  saveLenders(lenders) {
    try {
      localStorage.setItem('kisancred_cached_lenders', JSON.stringify(lenders));
    } catch (e) {}
  }

  /**
   * Grant sovereign consent to a lender
   * Calls POST /api/v1/consent
   */
  async grantConsent({ farmerId = DEFAULT_FARMER_ID, lenderId, sharedAttributes, validityDays = 30 }) {
    const payload = {
      farmer_id: farmerId,
      lender_id: lenderId,
      shared_attributes: sharedAttributes,
      validity_days: validityDays,
      purpose: 'Agricultural Loan & KCC Season Assessment',
    };

    let apiResult = null;
    try {
      const res = await fetch(`${API_BASE}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        apiResult = await res.json();
      }
    } catch (err) {
      console.warn('Backend consent API offline, local state updated:', err);
    }

    // Update local state
    const lenders = this.getLenders();
    const now = new Date();
    const expires = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);

    const updated = lenders.map((l) => {
      if (l.lender_id === lenderId) {
        return {
          ...l,
          status: 'active',
          consent_id: apiResult ? apiResult.consent_id : 'cns_' + Math.random().toString(36).substr(2, 8),
          token: apiResult ? apiResult.consent_token : 'hmac_sha256_offline.' + Math.random().toString(36).substr(2, 10),
          granted_at: now.toISOString(),
          expires_at: expires.toISOString(),
          shared_attributes: sharedAttributes,
        };
      }
      return l;
    });

    this.saveLenders(updated);
    return updated.find((l) => l.lender_id === lenderId);
  }

  /**
   * Revoke consent from a lender
   * Calls DELETE /api/v1/consent/{consent_id}
   */
  async revokeConsent(lenderId, consentId) {
    if (consentId) {
      try {
        await fetch(`${API_BASE}/consent/${consentId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.warn('Backend revoke offline, local state updated:', err);
      }
    }

    const lenders = this.getLenders();
    const updated = lenders.map((l) => {
      if (l.lender_id === lenderId) {
        return {
          ...l,
          status: 'revoked',
          token: null,
          expires_at: null,
        };
      }
      return l;
    });

    this.saveLenders(updated);
    return updated.find((l) => l.lender_id === lenderId);
  }
}

export const apiClient = new ApiClient();
