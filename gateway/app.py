"""
FastAPI application entry point for the Hackathon Engine.
"""
from pathlib import Path
import os
import logging
from typing import Dict, Any, Optional

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ConfigDict

from gateway.adapters import get_adapter
from engine.pipeline import default_engine
from engine.client import watsonx_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hackathon_engine.gateway")

app = FastAPI(
    title="IBM watsonx.ai Hackathon Decision Engine",
    description="Domain-agnostic AI decision engine powered by IBM watsonx.ai + Granite stack.",
    version="1.0.0"
)

# CORS middleware for web / dashboard clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for dashboard
static_dir = Path(__file__).resolve().parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


class IngressRequest(BaseModel):
    channel: str = Field(default="web", description="Channel type: web, whatsapp, api")
    text: Optional[str] = Field(default=None, description="Input query or observation text")
    message: Optional[str] = Field(default=None, description="Alias for text")
    query: Optional[str] = Field(default=None, description="Alias for text")
    vertical: Optional[str] = Field(default="agriculture", description="Vertical domain identifier")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Metadata")
    context_data: Optional[Dict[str, Any]] = Field(default=None, description="Grounding context")

    model_config = ConfigDict(extra="allow")


@app.get("/", response_class=HTMLResponse)
async def serve_index():
    """
    Serve the interactive web test playground console.
    """
    index_file = static_dir / "index.html"
    if index_file.exists():
        with open(index_file, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse("<h2>IBM watsonx.ai Hackathon Engine is running.</h2><p>Static index.html not found.</p>")


@app.post("/message")
async def handle_message(payload: Dict[str, Any]):
    """
    Central ingress endpoint:
    1. Selects channel adapter (web, whatsapp, api)
    2. Normalizes into standard EngineInput
    3. Executes 6-stage decision pipeline
    4. Formats output through the channel adapter
    """
    channel = payload.get("channel", "web")
    adapter = get_adapter(channel)

    try:
        # Step 1: Normalize via Adapter
        engine_input = adapter.normalize_request(payload)

        # Validate message text
        if not engine_input.text:
            raise HTTPException(status_code=400, detail="Missing required input text/message in payload.")

        # Step 2: Run Fixed 6-Stage Engine
        logger.info(f"Ingress from channel '{engine_input.channel}' for vertical '{engine_input.vertical}'")
        engine_output = default_engine.run_pipeline(engine_input)

        # Step 3: Format through Adapter
        response_payload = adapter.format_response(engine_output)
        return JSONResponse(content=response_payload)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error handling message: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Engine pipeline error: {str(e)}")


@app.get("/verticals")
async def list_verticals():
    """
    List all configured domain verticals available to the engine.
    """
    return default_engine.list_verticals()


@app.get("/health")
async def health_check():
    """
    Service healthcheck and runtime status.
    """
    return {
        "status": "healthy",
        "service": "hackathon-engine",
        "engine": {
            "model": watsonx_client.model_id,
            "runtime_mode": "mock-simulator" if watsonx_client.is_mock() else "watsonx-live",
            "watsonx_url": watsonx_client.url,
            "project_configured": bool(watsonx_client.project_id)
        }
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("gateway.app:app", host=host, port=port, reload=True)
