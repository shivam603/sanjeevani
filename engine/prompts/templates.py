"""
Granite prompt templates for the 6-stage decision pipeline.
Optimized for IBM Granite-3-8B-Instruct.
"""
import json
from typing import Dict, Any, Optional
from engine.models import VerticalConfig


def format_granite_prompt(system_msg: str, user_msg: str) -> str:
    """
    Format chat prompt conforming to IBM Granite 3.0 Instruct chat template:
    <|start_of_role|>system<|end_of_role|>{system}<|end_of_text|>
    <|start_of_role|>user<|end_of_role|>{user}<|end_of_text|>
    <|start_of_role|>assistant<|end_of_role|>
    """
    return (
        f"<|start_of_role|>system<|end_of_role|>{system_msg}<|end_of_text|>\n"
        f"<|start_of_role|>user<|end_of_role|>{user_msg}<|end_of_text|>\n"
        f"<|start_of_role|>assistant<|end_of_role|>"
    )


def build_unified_pipeline_prompt(
    user_query: str,
    vertical: VerticalConfig,
    grounding_data: str = ""
) -> str:
    """
    Builds a high-efficiency single-pass chained prompt that instructs Granite
    to perform all 6 decision stages (Understand, Analyze, Predict, Detect Risk,
    Recommend, Explain) and return a structured JSON response.
    This drastically saves watsonx Lite tokens and satisfies the 2 req/sec rate limit.
    """
    system_msg = (
        f"You are the IBM watsonx.ai Decision Engine operating in the '{vertical.name}' vertical. "
        f"Your target persona is: {vertical.target_persona}.\n"
        f"Description: {vertical.description}\n\n"
        f"You MUST execute a strict 6-stage decision pipeline:\n"
        f"1. UNDERSTAND: Extract intent and key entities ({', '.join(vertical.entities_to_extract)}).\n"
        f"2. ANALYZE: Ground the situation against domain rules, observations, and benchmarks.\n"
        f"3. PREDICT: Forecast outcomes, time horizons, and probabilities for {', '.join(vertical.prediction_metrics)}.\n"
        f"4. DETECT RISK: Score overall severity (LOW, MEDIUM, HIGH, CRITICAL) and flag urgent triggers.\n"
        f"5. RECOMMEND: Output prioritized, concrete, and high-impact interventions.\n"
        f"6. EXPLAIN: Provide transparent rationale, confidence scores, and safety disclaimers.\n\n"
        f"Domain Risk Rules to enforce:\n{json.dumps(vertical.risk_rules, indent=2)}\n\n"
        f"Allowed Recommendation Types:\n{json.dumps(vertical.recommendation_types, indent=2)}\n\n"
        f"STRICT OUTPUT REQUIREMENT:\n"
        f"Output ONLY valid JSON with keys: 'understand', 'analyze', 'predict', 'risk', 'recommend', 'explain'. "
        f"Do NOT wrap with backticks or add preamble. Ensure valid JSON parsing."
    )

    user_msg = (
        f"USER INPUT QUERY:\n\"{user_query}\"\n\n"
        f"GROUNDING BENCHMARKS / CONTEXT:\n{grounding_data}\n\n"
        f"Run the complete 6-stage pipeline and return the JSON decision object."
    )

    return format_granite_prompt(system_msg, user_msg)
