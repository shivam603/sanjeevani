"""KisanCred / AgriTrust Stage 4 Explanation Layer.

Translates numeric credit passports and Model A SHAP feature importances
into natural language explanations for farmers and institutional lenders.
"""

from explanation.engine import ExplanationEngine, explain_passport
from explanation.prompts import (
    analyze_shap_drivers,
    build_farmer_prompt,
    build_lender_prompt,
)
from explanation.providers import (
    BaseLLMProvider,
    MockLocalLLMProvider,
    OpenAICompatibleProvider,
    WatsonxGraniteProvider,
    get_llm_provider,
)

__all__ = [
    "ExplanationEngine",
    "explain_passport",
    "get_llm_provider",
    "BaseLLMProvider",
    "WatsonxGraniteProvider",
    "OpenAICompatibleProvider",
    "MockLocalLLMProvider",
    "analyze_shap_drivers",
    "build_farmer_prompt",
    "build_lender_prompt",
]
