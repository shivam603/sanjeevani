"""
Fixed 6-stage AI decision engine pipeline powered by IBM watsonx.ai + Granite.
Pipeline stages: Understand -> Analyze -> Predict -> Detect Risk -> Recommend -> Explain
"""
from pathlib import Path
import json
import re
import datetime
import logging
from typing import Dict, Any, Optional

from engine.models import (
    VerticalConfig,
    EngineInput,
    EngineOutput,
    UnderstandOutput,
    AnalyzeOutput,
    PredictOutput,
    RiskOutput,
    RiskItem,
    RecommendOutput,
    RecommendationItem,
    ExplainOutput
)
from engine.client import watsonx_client
from engine.prompts.templates import build_unified_pipeline_prompt
from data.data_loader import default_loader

logger = logging.getLogger("hackathon_engine.pipeline")


class DecisionEngine:
    def __init__(self, verticals_dir: Optional[str] = None):
        if verticals_dir:
            self.verticals_dir = Path(verticals_dir)
        else:
            self.verticals_dir = Path(__file__).resolve().parent.parent / "verticals"

        self._vertical_cache: Dict[str, VerticalConfig] = {}

    def get_vertical_config(self, vertical_id: str) -> VerticalConfig:
        """
        Load vertical configuration file.
        """
        v_id = vertical_id.lower().strip()
        if v_id in self._vertical_cache:
            return self._vertical_cache[v_id]

        file_path = self.verticals_dir / f"{v_id}.json"
        if not file_path.exists():
            # Fallback to agriculture if unknown
            file_path = self.verticals_dir / "agriculture.json"
            if not file_path.exists():
                raise FileNotFoundError(f"Vertical config {vertical_id} not found and default unavailable.")

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            config = VerticalConfig(**data)
            self._vertical_cache[v_id] = config
            return config

    def list_verticals(self) -> Dict[str, Any]:
        """
        List all available domain configurations in the verticals directory.
        """
        configs = []
        if self.verticals_dir.exists():
            for p in self.verticals_dir.glob("*.json"):
                try:
                    with open(p, "r", encoding="utf-8") as f:
                        d = json.load(f)
                        configs.append({
                            "id": d.get("vertical_id", p.stem),
                            "name": d.get("name", p.stem.capitalize()),
                            "description": d.get("description", ""),
                            "target_persona": d.get("target_persona", "")
                        })
                except Exception:
                    continue
        return {"verticals": configs}

    def _extract_json_payload(self, raw_text: str) -> Dict[str, Any]:
        """
        Safely extract JSON from model output, handling potential markdown code blocks.
        """
        text = raw_text.strip()
        # Remove ```json ... ``` blocks if present
        if "```" in text:
            match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
            if match:
                text = match.group(1)
            else:
                # Try finding outermost braces
                start = text.find("{")
                end = text.rfind("}")
                if start != -1 and end != -1:
                    text = text[start:end+1]

        try:
            return json.loads(text)
        except Exception:
            # Fallback heuristic extraction
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1:
                return json.loads(text[start:end+1])
            raise ValueError(f"Could not parse valid JSON from Granite output: {raw_text[:200]}")

    def run_pipeline(self, engine_input: EngineInput) -> EngineOutput:
        """
        Execute the fixed 6-stage decision pipeline:
        Understand -> Analyze -> Predict -> Detect Risk -> Recommend -> Explain
        """
        vertical = self.get_vertical_config(engine_input.vertical)
        grounding_data = default_loader.get_summary(domain=vertical.vertical_id)

        # Build prompt optimized for IBM Granite
        prompt = build_unified_pipeline_prompt(
            user_query=engine_input.text,
            vertical=vertical,
            grounding_data=grounding_data
        )

        # Generate response from watsonx / smart simulator
        raw_output = watsonx_client.generate_text(prompt=prompt, max_tokens=1024, temperature=0.2)
        
        try:
            parsed = self._extract_json_payload(raw_output)
        except Exception as e:
            logger.warning(f"Error parsing model output: {e}. Generating fallback structured response.")
            parsed = json.loads(watsonx_client._mock_granite_response(f"{vertical.vertical_id} understand analyze"))

        # Stage 1: Understand
        u_data = parsed.get("understand", {})
        understand = UnderstandOutput(
            intent=u_data.get("intent", "Domain decision inquiry"),
            extracted_entities=u_data.get("extracted_entities", {}),
            summary=u_data.get("summary", engine_input.text[:120])
        )

        # Stage 2: Analyze
        a_data = parsed.get("analyze", {})
        analyze = AnalyzeOutput(
            current_state_assessment=a_data.get("current_state_assessment", "Baseline parameters assessed."),
            key_observations=a_data.get("key_observations", ["Analyzed input against domain constraints"]),
            grounded_benchmarks=a_data.get("grounded_benchmarks", grounding_data.split("\n")[0])
        )

        # Stage 3: Predict
        p_data = parsed.get("predict", {})
        predict = PredictOutput(
            projected_outcomes=p_data.get("projected_outcomes", ["Status progression without intervention"]),
            probability_score=float(p_data.get("probability_score", 0.85)),
            time_horizon=p_data.get("time_horizon", "Near-term")
        )

        # Stage 4: Detect Risk
        r_data = parsed.get("risk", {})
        risks_raw = r_data.get("identified_risks", [])
        risks = []
        for r in risks_raw:
            if isinstance(r, dict):
                risks.append(RiskItem(
                    factor=r.get("factor", "Operational Factor"),
                    severity=r.get("severity", "MEDIUM"),
                    warning=r.get("warning", "")
                ))
        if not risks:
            risks.append(RiskItem(factor="Default monitoring", severity="LOW", warning="Standard threshold surveillance"))

        risk = RiskOutput(
            overall_severity=r_data.get("overall_severity", "MEDIUM"),
            identified_risks=risks,
            urgent_action_required=r_data.get("urgent_action_required", False)
        )

        # Stage 5: Recommend
        rec_data = parsed.get("recommend", {})
        recs_raw = rec_data.get("recommendations", [])
        recommendations = []
        for idx, rec in enumerate(recs_raw, start=1):
            if isinstance(rec, dict):
                recommendations.append(RecommendationItem(
                    priority=rec.get("priority", idx),
                    action=rec.get("action", ""),
                    expected_impact=rec.get("expected_impact", ""),
                    category=rec.get("category", "General Intervention")
                ))
        if not recommendations:
            recommendations.append(RecommendationItem(
                priority=1,
                action="Continue monitoring indicators according to standard procedure.",
                expected_impact="Maintains operational baseline.",
                category="Standard Procedure"
            ))

        recommend = RecommendOutput(recommendations=recommendations)

        # Stage 6: Explain
        e_data = parsed.get("explain", {})
        explain = ExplainOutput(
            rationale=e_data.get("rationale", "Pipeline stages synthesised user observation and domain risk criteria."),
            confidence_level=e_data.get("confidence_level", "Standard (IBM Granite-3-8B)"),
            supporting_evidence=e_data.get("supporting_evidence", ["Domain taxonomy heuristics", "Grounding benchmarks"]),
            disclaimer=e_data.get("disclaimer", vertical.disclaimer)
        )

        exec_mode = "mock-granite" if watsonx_client.is_mock() else "watsonx-granite"

        return EngineOutput(
            vertical_id=vertical.vertical_id,
            vertical_name=vertical.name,
            channel=engine_input.channel,
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            understand=understand,
            analyze=analyze,
            predict=predict,
            risk=risk,
            recommend=recommend,
            explain=explain,
            execution_mode=exec_mode
        )


# Global decision engine instance
default_engine = DecisionEngine()
