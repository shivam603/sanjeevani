"""Database session configuration and health probe."""

import logging
from typing import AsyncGenerator
from app.core.config import settings
try:
    from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
    from sqlalchemy import create_engine, text
    HAVE_SQLALCHEMY = True
except ImportError:
    AsyncSession = None  # type: ignore
    create_async_engine = None  # type: ignore
    async_sessionmaker = None  # type: ignore
    create_engine = None  # type: ignore
    text = None  # type: ignore
    HAVE_SQLALCHEMY = False

logger = logging.getLogger("kisancred.db")

# Create Async engine for FastAPI route handlers
async_engine = None
async_session_factory = None

if HAVE_SQLALCHEMY:
    try:
        async_engine = create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,
            future=True,
            pool_pre_ping=True,
        )
        async_session_factory = async_sessionmaker(
            bind=async_engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
    except Exception as e:
        logger.warning(f"Async database engine initialization deferred: {e}")



async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for obtaining async DB session in route handlers."""
    if not async_session_factory:
        raise RuntimeError("Database engine not configured")
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()


import asyncio

async def check_database_health() -> dict:
    """Probe PostgreSQL & PostGIS extension status."""
    try:
        if not async_engine:
            return {"status": "unconfigured", "postgis": False, "detail": "Engine not configured"}

        async def _probe():
            async with async_engine.connect() as conn:
                # Query basic connection
                await conn.execute(text("SELECT 1;"))
                # Query PostGIS extension version
                postgis_version = None
                try:
                    result = await conn.execute(text("SELECT PostGIS_Full_Version();"))
                    row = result.fetchone()
                    if row:
                        postgis_version = str(row[0])
                except Exception:
                    postgis_version = "not_installed"

                return {
                    "status": "connected",
                    "postgis_enabled": postgis_version is not None and "POSTGIS" in postgis_version.upper(),
                    "postgis_version": postgis_version,
                }

        return await asyncio.wait_for(_probe(), timeout=1.0)
    except Exception as e:
        return {
            "status": "disconnected",
            "postgis_enabled": False,
            "error": str(e),
        }
