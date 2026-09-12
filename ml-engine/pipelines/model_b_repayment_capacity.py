"""Model B — Repayment Capacity Calculator (Deterministic Cashflow Engine).

NOTE: This is a purely deterministic agricultural cashflow calculation engine.
It does NOT use ML or LLMs.
Formula:
  Net Cashflow = (Expected Yield * Realization Price) - (Input Costs + Existing Obligations)
  Safe Credit Min = max(0, Net Cashflow * 0.40)
  Safe Credit Max = max(Safe Credit Min, Net Cashflow * 0.75)
"""

import logging
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pipelines.base_model import ScoringModel

logger = logging.getLogger("kisancred.ml.model_b")

# Benchmark regional default input costs (INR per acre) if table lookup missing
DEFAULT_INPUT_COSTS_PER_ACRE = {
    "Grapes": 55000.0,
    "Onion": 28000.0,
    "Pomegranate": 48000.0,
    "Tomato": 32000.0,
    "Soybean": 16000.0,
    "Wheat": 14000.0,
    "Maize": 15000.0,
    "Cotton": 22000.0,
    "Sugarcane": 42000.0,
}


class RepaymentCapacityCalculator(ScoringModel):
    """
    Model B: Deterministic cashflow engine calculating farmer repayment
    capacity and safe credit borrowing limits.
    """

    model_name = "RepaymentCapacityCalculator_Deterministic"
    version = "v1.1.0"

    def fit(self, X: Any, y: Optional[Any] = None, **kwargs) -> "RepaymentCapacityCalculator":
        # Deterministic engine: no fitting required
        return self

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate net cashflow and safe credit range.

        Expected input features:
        - `crop_cycles`: list of dicts with `crop_name`, `expected_yield`, `acreage`
        - `realization_prices`: dict of crop_name -> price_per_quintal (from Model D)
        - `input_costs_per_acre`: dict of crop_name -> cost_per_acre (from input_costs table)
        - `existing_debt_obligations`: float (sum of active loan amounts due this season)
        - `total_acreage`: float
        """
        crop_cycles = features.get("crop_cycles", [])
        realization_prices = features.get("realization_prices", {})
        custom_input_costs = features.get("input_costs_per_acre", {})
        existing_debt = float(features.get("existing_debt_obligations", 0.0))
        total_acreage = float(features.get("total_acreage", 2.5))

        total_gross_revenue = 0.0
        total_input_expenditure = 0.0
        crop_breakdown = []

        if not crop_cycles:
            # Default single cycle fallback
            crop_cycles = [{
                "crop_name": features.get("primary_crop", "Soybean"),
                "expected_yield": float(features.get("expected_yield", 15.0)),  # Quintals
                "acreage": total_acreage,
            }]

        for cycle in crop_cycles:
            crop = cycle.get("crop_name", "General").title()
            exp_yield = float(cycle.get("expected_yield", 10.0))  # Total expected quintals
            acres = float(cycle.get("acreage", total_acreage))

            # 1. Realization price (from Model D or benchmark)
            price_per_qtl = float(realization_prices.get(crop, 0.0))
            if price_per_qtl <= 0:
                # Fallbacks based on typical MSP / APMC
                price_per_qtl = {
                    "Grapes": 4500.0, "Onion": 2200.0, "Tomato": 1600.0,
                    "Soybean": 4600.0, "Pomegranate": 6000.0, "Wheat": 2400.0,
                }.get(crop, 2500.0)

            crop_rev = exp_yield * price_per_qtl
            total_gross_revenue += crop_rev

            # 2. Input costs per acre
            cost_per_acre = float(custom_input_costs.get(crop, DEFAULT_INPUT_COSTS_PER_ACRE.get(crop, 20000.0)))
            crop_input_cost = cost_per_acre * acres
            total_input_expenditure += crop_input_cost

            crop_breakdown.append({
                "crop": crop,
                "acreage": acres,
                "expected_yield_qtl": exp_yield,
                "realization_price_inr": price_per_qtl,
                "gross_revenue_inr": round(crop_rev, 2),
                "input_cost_inr": round(crop_input_cost, 2),
            })

        # Total operational expenditure + debt service
        total_obligations = total_input_expenditure + existing_debt
        net_cashflow = total_gross_revenue - total_obligations

        # Safe credit bounds based on debt service coverage ratio (DSCR)
        # Minimum safe credit: 35% of net surplus
        # Maximum safe credit: 70% of net surplus
        if net_cashflow > 10000.0:
            safe_credit_min = round(net_cashflow * 0.35, -2)  # Round to hundreds
            safe_credit_max = round(net_cashflow * 0.70, -2)
        else:
            # Micro-credit floor if cashflow is tight but land exists
            safe_credit_min = max(0.0, round(total_acreage * 8000.0, -2))
            safe_credit_max = max(safe_credit_min, round(total_acreage * 18000.0, -2))

        return {
            "gross_revenue": round(total_gross_revenue, 2),
            "input_costs": round(total_input_expenditure, 2),
            "existing_debt_obligations": round(existing_debt, 2),
            "total_obligations": round(total_obligations, 2),
            "net_cashflow": round(net_cashflow, 2),
            "safe_credit_min": round(safe_credit_min, 2),
            "safe_credit_max": round(safe_credit_max, 2),
            "crop_breakdown": crop_breakdown,
            "model_name": self.model_name,
            "model_version": self.version,
        }
