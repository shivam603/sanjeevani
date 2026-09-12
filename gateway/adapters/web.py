"""
Web channel adapter for frontend dashboards and web UI.
"""
from typing import Dict, Any
from gateway.adapters.base import BaseAdapter
from engine.models import EngineInput, EngineOutput


class WebAdapter(BaseAdapter):
    def normalize_request(self, payload: Dict[str, Any]) -> EngineInput:
        text = payload.get("text") or payload.get("message") or payload.get("query", "")
        vertical = payload.get("vertical", "agriculture")
        metadata = payload.get("metadata", {})
        context_data = payload.get("context_data")

        return EngineInput(
            channel="web",
            text=text.strip(),
            vertical=vertical.strip().lower(),
            metadata=metadata,
            context_data=context_data
        )

    def format_response(self, output: EngineOutput) -> Dict[str, Any]:
        """
        Web format includes full structured stages ready for modern UI cards.
        """
        return {
            "status": "success",
            "channel": "web",
            "vertical": {
                "id": output.vertical_id,
                "name": output.vertical_name
            },
            "timestamp": output.timestamp,
            "pipeline": {
                "understand": output.understand.model_dump(),
                "analyze": output.analyze.model_dump(),
                "predict": output.predict.model_dump(),
                "risk": output.risk.model_dump(),
                "recommend": output.recommend.model_dump(),
                "explain": output.explain.model_dump()
            },
            "execution_mode": output.execution_mode
        }
