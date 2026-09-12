"""Prompt Templates and SHAP Feature Verbalizers for KisanCred Explanation Layer."""

from decimal import Decimal
from typing import Any, Dict, List, Tuple

FEATURE_DESCRIPTIONS = {
    "yield_variance": {
        "name": "Production Consistency",
        "positive": "consistent crop yield across recent seasons with low variability",
        "negative": "fluctuating or unverified harvest yield across recent seasons",
        "farmer_action": "Record your seasonal harvest numbers with your FPO field coordinator to demonstrate consistency.",
        "lender_insight": "Yield volatility index indicates production stability and climate adaptation.",
    },
    "transaction_count_12m": {
        "name": "Market Transaction Frequency",
        "positive": "regular and verified harvest sale records over the past 12 months",
        "negative": "limited documented harvest sales in official mandi or FPO channels",
        "farmer_action": "Route your produce sales through your registered FPO or APMC mandi to build transaction history.",
        "lender_insight": "Transaction frequency validates commercial engagement and active market monetization.",
    },
    "transaction_volume_inr": {
        "name": "Market Sales Volume",
        "positive": "healthy total crop sales volume realized through verified market channels",
        "negative": "low documented gross sales volume relative to operational acreage",
        "farmer_action": "Upload your mandi payment receipts or bills to ensure all sales are credited to your profile.",
        "lender_insight": "Sales volume confirms top-line turnover and capacity to generate cash surplus.",
    },
    "fpo_membership_months": {
        "name": "FPO Participation Tenure",
        "positive": "established tenure and active participation in your Farmer Producer Organization",
        "negative": "short or newly registered FPO membership history",
        "farmer_action": "Continue active participation in your FPO collective purchasing and aggregation activities.",
        "lender_insight": "FPO membership tenure provides institutional governance, collective bargaining, and group peer oversight.",
    },
    "pmfby_claim_ratio": {
        "name": "Crop Insurance History",
        "positive": "disciplined crop insurance coverage without excessive distress claims",
        "negative": "elevated crop insurance claims reflecting regional weather or pest vulnerability",
        "farmer_action": "Enroll your acreage under PMFBY each Kharif and Rabi season to maintain insurance protection.",
        "lender_insight": "PMFBY claim intensity reflects exposure to systemic weather shock and localized crop loss.",
    },
    "loan_repayment_rate": {
        "name": "Repayment Track Record",
        "positive": "strong on-time repayment history on prior agricultural credit and input advances",
        "negative": "delayed repayments or past due balances on prior loan obligations",
        "farmer_action": "Make timely repayments on current input loans before harvest due dates to maximize your rating.",
        "lender_insight": "Historical repayment behavior serves as primary empirical proxy for borrower willingness to pay.",
    },
    "ndvi_mean": {
        "name": "Satellite Crop Health (NDVI)",
        "positive": "healthy crop canopy greenness confirmed by Sentinel-2 satellite imagery",
        "negative": "below-average crop vigor or delayed sowing detected via satellite monitoring",
        "farmer_action": "Ensure your parcel GPS boundary is accurately mapped on the portal so satellite checks see your full field.",
        "lender_insight": "Independent optical remote sensing corroborates actual biomass growth and eliminates phantom parcel risk.",
    },
    "ndvi_variance": {
        "name": "Canopy Uniformity",
        "positive": "even crop growth and consistent soil moisture across the entire field parcel",
        "negative": "uneven plant growth or localized water stress detected across parcel quadrants",
        "farmer_action": "Check irrigation distribution across field corners to improve uniform plant emergence.",
        "lender_insight": "Intra-parcel NDVI variance highlights micro-drainage or pest-patch hotspots.",
    },
}


def analyze_shap_drivers(shap_dict: Dict[str, float]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Sort and categorize SHAP values into positive score drivers and risk/improvement drivers.
    Positive SHAP value in Model A increases the creditworthiness score.
    """
    sorted_features = sorted(shap_dict.items(), key=lambda item: item[1], reverse=True)
    
    positives = []
    risks = []

    for fname, val in sorted_features:
        meta = FEATURE_DESCRIPTIONS.get(fname, {
            "name": fname.replace("_", " ").title(),
            "positive": f"positive trend in {fname.replace('_', ' ')}",
            "negative": f"room for improvement in {fname.replace('_', ' ')}",
            "farmer_action": f"Update your records for {fname.replace('_', ' ')}.",
            "lender_insight": f"{fname} influences overall risk scoring.",
        })
        entry = {
            "feature_key": fname,
            "feature_name": meta["name"],
            "impact_weight": round(float(val), 4),
            "description": meta["positive"] if val >= 0 else meta["negative"],
            "farmer_action": meta["farmer_action"],
            "lender_insight": meta["lender_insight"],
        }
        if val >= 0:
            positives.append(entry)
        else:
            risks.append(entry)

    return positives, risks


def build_farmer_prompt(passport: Dict[str, Any], positives: List[Dict[str, Any]], risks: List[Dict[str, Any]]) -> Tuple[str, str]:
    """
    Build prompt tailored for smallholder farmers and FPO cultivators.
    Tone: Simple, encouraging, respectful, actionable.
    """
    system_prompt = (
        "You are 'AgriTrust Sahayak', a supportive and knowledgeable agricultural credit advisor for Indian farmers. "
        "Your task is to explain the farmer's credit intelligence score in simple, encouraging, and actionable terms. "
        "Do NOT use financial jargon like 'SHAP', 'variance', 'default probability', or 'loss given default'. "
        "Use respectful, warm language. Explicitly mention their crop, FPO participation, and practical steps to increase credit."
    )

    score = passport.get("agritrust_score", 700)
    tier = passport.get("rating_tier", "A (Standard Risk)")
    min_credit = f"{float(passport.get('safe_credit_min', 0)):,.0f}"
    max_credit = f"{float(passport.get('safe_credit_max', 0)):,.0f}"

    repayment = passport.get("repayment_capacity", {})
    cashflow = f"{float(repayment.get('net_cashflow', 0)):,.0f}"
    
    crop_risk = passport.get("crop_risk", {})
    crop_category = crop_risk.get("risk_category", "Moderate")

    top_positives = [p["description"] for p in positives[:3]]
    top_actions = [r["farmer_action"] for r in risks[:3]]
    if not top_actions:
        top_actions = [
            "Upload your latest mandi receipt after every harvest sale.",
            "Ensure your parcel GPS boundary is mapped on your FPO portal.",
            "Register your upcoming sowing schedule to pre-qualify for seasonal credit.",
        ]

    prompt = (
        f"AUDIENCE: FARMER\n"
        f"Farmer ID: {passport.get('farmer_id')}\n"
        f"AgriTrust Score: {score} out of 900\n"
        f"Rating Tier: {tier}\n"
        f"Safe Credit Limit: ₹{min_credit} - ₹{max_credit}\n"
        f"Projected Net Cashflow Surplus: ₹{cashflow}\n"
        f"Regional Crop Risk Profile: {crop_category}\n\n"
        f"Key Strengths Identified from Farm Data:\n"
        + "\n".join([f"- {p}" for p in top_positives]) + "\n\n"
        f"Recommended Steps to Improve Score & Credit Limit:\n"
        + "\n".join([f"- {a}" for a in top_actions]) + "\n\n"
        f"Please generate a 3-part explanation for the farmer:\n"
        f"1. Headline Summary: Friendly congratulation explaining what their score means and their borrowing range.\n"
        f"2. Why Your Score Looked Good: 2-3 specific farm factors that helped them.\n"
        f"3. Next Steps: Concrete actions they can take today to grow their score."
    )
    return prompt, system_prompt


def build_lender_prompt(passport: Dict[str, Any], positives: List[Dict[str, Any]], risks: List[Dict[str, Any]]) -> Tuple[str, str]:
    """
    Build prompt tailored for bank underwriters and NBFC credit officers.
    Tone: Concise, analytical, risk-calibrated, credit-committee style.
    """
    system_prompt = (
        "You are an Institutional Agricultural Credit Underwriting Analyst for KisanCred. "
        "Your task is to provide an analytical credit evaluation memo for bank risk committees. "
        "Structure your response with clear financial logic, citing probability of default, debt service headroom, "
        "satellite verification certainty, and specific sanction conditions or covenants."
    )

    score = passport.get("agritrust_score", 700)
    tier = passport.get("rating_tier", "A (Standard Risk)")
    min_credit = f"{float(passport.get('safe_credit_min', 0)):,.0f}"
    max_credit = f"{float(passport.get('safe_credit_max', 0)):,.0f}"
    pd = f"{float(passport.get('probability_of_default', 0.05)) * 100:.2f}%"
    confidence = f"{float(passport.get('data_confidence', 0.85)) * 100:.1f}%"

    repayment = passport.get("repayment_capacity", {})
    revenue = f"{float(repayment.get('gross_revenue', 0)):,.0f}"
    costs = f"{float(repayment.get('input_costs', 0)):,.0f}"
    debt = f"{float(repayment.get('existing_debt_obligations', 0)):,.0f}"
    cashflow = f"{float(repayment.get('net_cashflow', 0)):,.0f}"

    prices = passport.get("market_prices_scenario", {})
    base_price = prices.get("base_realization_price", "N/A")
    downside_price = prices.get("downside_price", "N/A")

    crop_risk = passport.get("crop_risk", {})
    risk_score = crop_risk.get("risk_score", "N/A")
    risk_category = crop_risk.get("risk_category", "Moderate")

    top_strengths = [f"{p['feature_name']}: {p['description']} (SHAP weight: +{p['impact_weight']})" for p in positives[:3]]
    top_vulnerabilities = [f"{r['feature_name']}: {r['description']} (SHAP weight: {r['impact_weight']})" for r in risks[:3]]

    prompt = (
        f"AUDIENCE: LENDER (Bank / NBFC Credit Officer)\n"
        f"Borrower Farmer ID: {passport.get('farmer_id')}\n"
        f"Credit Passport ID: {passport.get('passport_id')}\n"
        f"AgriTrust Score: {score} / 900 | Rating Grade: {tier}\n"
        f"Calibrated Probability of Default (PD): {pd}\n"
        f"Ingestion Data Confidence: {confidence}\n"
        f"Safe Credit Window: ₹{min_credit} - ₹{max_credit}\n"
        f"Cashflow Mechanics: Gross Rev: ₹{revenue} | Input Costs: ₹{costs} | Existing Debt: ₹{debt} | Net Surplus: ₹{cashflow}\n"
        f"Price Stress Horizon: Base: ₹{base_price} | Downside Floor: ₹{downside_price}\n"
        f"Crop & Regional Risk: Score {risk_score}/100 ({risk_category})\n\n"
        f"Empirical Strengths (Top Positive SHAP Weights):\n"
        + "\n".join([f"• {s}" for s in top_strengths]) + "\n\n"
        f"Risk Underwriting Considerations (Negative SHAP Drivers):\n"
        + "\n".join([f"• {v}" for v in top_vulnerabilities]) + "\n\n"
        f"Please generate a concise credit underwriting executive brief:\n"
        f"1. Executive Credit Assessment & Limit Recommendation\n"
        f"2. Cashflow & Downside Stress Analysis\n"
        f"3. Recommended Sanction Conditions and Monitoring Covenants"
    )
    return prompt, system_prompt
