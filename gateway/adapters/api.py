"""
Public REST API channel adapter for B2B and microservice integrations.
"""
from typing import Dict, Any
from gateway.adapters.base import BaseAdapter
from engine.models import EngineInput, EngineOutput


class ApiAdapter(BaseAdapter):
    def normalize_request(self, payload: Dict[str, Any]) -> EngineInput:
        text = payload.get("query") or payload.get("text") or payload.get("prompt", "")
        vertical = payload.get("vertical") or payload.get("domain", "agriculture")
        metadata = {
            "api_version": payload.get("version", "v1"),
            "caller_id": payload.get("caller_id", "public_api_client"),
            "request_id": payload.get("request_id")
        }
        context_data = payload.get("context") or payload.get("context_data")

        return EngineInput(
            channel="api",
            text=text.strip(),
            vertical=vertical.strip().lower(),
            metadata=metadata,
            context_data=context_data
        )

    def format_response(self, output: EngineOutput) -> Dict[str, Any]:
        """
        Structured JSON envelope designed for enterprise backend ingestion.
        """
        return {
            "api_version": "v1",
            "status": "success",
            "data": {
                "decision_id": f"dec_{output.vertical_id}_{hash(output.timestamp) & 0xfffffff}",
                "timestamp_utc": output.timestamp,
                "vertical": {
                    "id": output.vertical_id,
                    "name": output.vertical_name
                },
                "intent": output.understand.intent,
                "entities": output.understand.extracted_entities,
                "assessment": output.analyze.current_state_assessment,
                "projections": {
                    "outcomes": output.predict.projected_outcomes,
                    "confidence": output.predict.probability_score,
                    "horizon": output.predict.time_horizon
                },
                "risk_profile": {
                    "severity": output.risk.overall_severity,
                    "urgent_action": output.risk.urgent_action_required,
                    "factors": [r.model_dump() for r in output.risk.identified_risks]
                },
                "actions": [rec.model_dump() for rec in output.recommend.recommendations],
                "audit_trail": {
                    "rationale": output.explain.rationale,
                    "confidence": output.explain.confidence_level,
                    "evidence": output.explain.supporting_evidence,
                    "disclaimer": output.explain.disclaimer,
                    "engine_runtime": output.execution_mode
                }
            }
        }
