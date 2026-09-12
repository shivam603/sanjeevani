"""
Data models for the Hackathon Engine decision pipeline.
"""
from typing import Dict, Any, List, Optional, Literal
from pydantic import BaseModel, Field


class VerticalConfig(BaseModel):
    vertical_id: str
    name: str
    description: str
    target_persona: str
    entities_to_extract: List[str] = Field(default_factory=list)
    analysis_focus: List[str] = Field(default_factory=list)
    prediction_metrics: List[str] = Field(default_factory=list)
    risk_rules: List[Dict[str, Any]] = Field(default_factory=list)
    recommendation_types: List[str] = Field(default_factory=list)
    disclaimer: str = ""


class EngineInput(BaseModel):
    """
    Canonical internal format after channel adapter normalization.
    """
    channel: str = Field(description="Ingress channel (e.g. web, whatsapp, api)")
    text: str = Field(description="User query or message text")
    vertical: str = Field(default="agriculture", description="Target domain identifier")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Channel-specific metadata (e.g. sender_id, headers)")
    context_data: Optional[Dict[str, Any]] = Field(default=None, description="Optional raw tabular or contextual data")


class UnderstandOutput(BaseModel):
    intent: str
    extracted_entities: Dict[str, Any] = Field(default_factory=dict)
    summary: str


class AnalyzeOutput(BaseModel):
    current_state_assessment: str
    key_observations: List[str] = Field(default_factory=list)
    grounded_benchmarks: Optional[str] = None


class PredictOutput(BaseModel):
    projected_outcomes: List[str] = Field(default_factory=list)
    probability_score: float = Field(default=0.85, ge=0.0, le=1.0)
    time_horizon: str = "Short-to-medium term"


class RiskItem(BaseModel):
    factor: str
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = "MEDIUM"
    warning: str


class RiskOutput(BaseModel):
    overall_severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = "MEDIUM"
    identified_risks: List[RiskItem] = Field(default_factory=list)
    urgent_action_required: bool = False


class RecommendationItem(BaseModel):
    priority: int
    action: str
    expected_impact: str
    category: str = "Immediate"


class RecommendOutput(BaseModel):
    recommendations: List[RecommendationItem] = Field(default_factory=list)


class ExplainOutput(BaseModel):
    rationale: str
    confidence_level: str
    supporting_evidence: List[str] = Field(default_factory=list)
    disclaimer: str


class EngineOutput(BaseModel):
    """
    Standard output produced by the 6-stage decision pipeline.
    """
    vertical_id: str
    vertical_name: str
    channel: str
    timestamp: str
    understand: UnderstandOutput
    analyze: AnalyzeOutput
    predict: PredictOutput
    risk: RiskOutput
    recommend: RecommendOutput
    explain: ExplainOutput
    execution_mode: str = "watsonx-granite"  # or "mock-granite"
