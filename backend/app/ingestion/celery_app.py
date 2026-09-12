"""Celery Application & Beat Periodic Schedule Configuration for KisanCred."""

import os
from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

# Initialize Celery app
celery_app = Celery(
    "kisancred_ingestion",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.ingestion.tasks"],
)

# Celery settings
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour hard limit
    task_soft_time_limit=3300,  # 55 min soft limit
    worker_prefetch_multiplier=1,
)

# Scheduled Jobs via Celery Beat
celery_app.conf.beat_schedule = {
    # 1. Weekly Remote Sensing NDVI/Moisture Ingestion: Every Monday at 02:00 UTC
    "weekly-remote-sensing-ingestion": {
        "task": "app.ingestion.tasks.scheduled_weekly_remote_sensing",
        "schedule": crontab(minute=0, hour=2, day_of_week="monday"),
        "options": {"queue": "scheduled_ingestion"},
    },
    # 2. Daily AGMARKNET Mandi Price Ingestion: Every day at 18:00 UTC (after APMC closes)
    "daily-agmarknet-price-ingestion": {
        "task": "app.ingestion.tasks.scheduled_daily_agmarknet",
        "schedule": crontab(minute=0, hour=18),
        "options": {"queue": "scheduled_ingestion"},
    },
    # 3. Seasonal PMFBY Crop Insurance Ingestion: 1st day of every quarter at 04:00 UTC
    "seasonal-pmfby-insurance-ingestion": {
        "task": "app.ingestion.tasks.scheduled_seasonal_pmfby",
        "schedule": crontab(minute=0, hour=4, day_of_month="1", month_of_year="1,4,7,10"),
        "options": {"queue": "scheduled_ingestion"},
    },
}
