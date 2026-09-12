"""Main FastAPI Application Entrypoint for Sanjeevani."""

from contextlib import asynccontextmanager
import logging
from datetime import datetime, timezone
import time
import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging_config import configure_structured_logging
from app.api.v1.router import api_router
from app.api.v1.endpoints.health import get_health, get_ready

# Configure structured observability logging
configure_structured_logging(service_name="sanjeevani-api", level=logging.INFO)
logger = logging.getLogger("sanjeevani.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for startup and shutdown hooks."""
    logger.info(f"Starting {settings.PROJECT_NAME} (v{settings.VERSION}) in [{settings.ENVIRONMENT}] mode")
    # Startup tasks (e.g. warm connection pools)
    yield
    logger.info(f"Shutting down {settings.PROJECT_NAME}")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Agricultural Credit Intelligence Platform connecting Farmers, "
        "FPOs, and Lenders via alternative data, satellite PostGIS analytics, "
        "and cryptographic consent tokens."
    ),
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Structured Request Observability Middleware
@app.middleware("http")
async def structured_logging_middleware(request: Request, call_next):
    req_id = request.headers.get("X-Request-ID", str(uuid.uuid4())[:8])
    start_time = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
    response.headers["X-Request-ID"] = req_id
    logger.info(
        f"{request.method} {request.url.path} status={response.status_code} duration={duration_ms}ms req_id={req_id}"
    )
    return response

# Configure Cross-Origin Resource Sharing (CORS) for frontends (Localhost & Render domains)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Top-level Health check endpoint for Docker / Load Balancers
app.add_api_route(
    "/health",
    get_health,
    methods=["GET"],
    tags=["System Health"],
    summary="Root Health Check",
    include_in_schema=True,
)

# Top-level Readiness check endpoint for Kubernetes / Docker Swarm
app.add_api_route(
    "/ready",
    get_ready,
    methods=["GET"],
    tags=["System Health"],
    summary="Root Readiness Check",
    include_in_schema=True,
)

# Root service status & Master Demonstration Hub
from fastapi.responses import HTMLResponse
from app.api.v1.endpoints.demo import get_demo_showcase_html

@app.get("/demo", response_class=HTMLResponse, tags=["Demonstration Showcase"], summary="Master Demonstration Showcase Hub")
async def demo_page():
    """Serves the interactive Master Demonstration Showcase Hub."""
    return HTMLResponse(content=get_demo_showcase_html())


@app.get("/", tags=["System Health"])
async def root(request: Request):
    accept = request.headers.get("accept", "")
    if "text/html" in accept and "*/*" not in accept:
        return HTMLResponse(content=get_demo_showcase_html())
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs": "/docs",
        "demo": "/demo",
        "api_v1": settings.API_V1_STR,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# Mount API version 1 routers
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount Static Frontends for Unified Fullstack Deployment on Render
import os
from fastapi.staticfiles import StaticFiles

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
frontend_mounts = [
    ("/farmer", os.path.join(BASE_DIR, "frontend-farmer-pwa", "dist")),
    ("/fpo", os.path.join(BASE_DIR, "frontend-fpo-portal", "dist")),
    ("/lender", os.path.join(BASE_DIR, "frontend-lender-dashboard", "dist")),
]

for mount_path, dist_path in frontend_mounts:
    if os.path.exists(dist_path):
        app.mount(mount_path, StaticFiles(directory=dist_path, html=True), name=mount_path.replace("/", ""))
        logger.info(f"Mounted frontend at {mount_path} from {dist_path}")

