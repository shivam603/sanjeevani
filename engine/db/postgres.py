"""
PostgreSQL Persistence Layer with Connection Pooling & JSONB Indexing.
Engineered for ACID reliability, enterprise compliance, and high throughput.
"""
import os
import json
import logging
from typing import Optional, Dict, Any, List

logger = logging.getLogger("hackathon_engine.db")

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS decision_records (
    decision_id VARCHAR(64) PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    vertical_id VARCHAR(50) NOT NULL,
    channel VARCHAR(30) NOT NULL,
    query_text TEXT NOT NULL,
    overall_severity VARCHAR(20) NOT NULL,
    payload_json JSONB NOT NULL,
    execution_mode VARCHAR(50) NOT NULL
);

-- Optimization: Compound B-Tree Index for rapid domain & time-series filtering
CREATE INDEX IF NOT EXISTS idx_decisions_vertical_time ON decision_records (vertical_id, created_at DESC);

-- Optimization: Index for severity triage alerting
CREATE INDEX IF NOT EXISTS idx_decisions_severity ON decision_records (overall_severity);

-- Optimization: GIN Index on JSONB for sub-millisecond nested attribute searches
CREATE INDEX IF NOT EXISTS idx_decisions_payload_gin ON decision_records USING gin (payload_json);
"""


class PostgresManager:
    def __init__(self):
        self.db_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/hackathon_engine")
        self.pool = None
        self.connected = False
        self._init_connection()

    def _init_connection(self):
        """
        Attempts to initialize a Threaded Connection Pool to PostgreSQL.
        Falls back safely to local memory if PostgreSQL is not active.
        """
        try:
            import psycopg2
            from psycopg2 import pool
            # Parse connection URL or credentials
            self.pool = pool.ThreadedConnectionPool(
                minconn=1,
                maxconn=20,
                dsn=self.db_url
            )
            self._apply_schema()
            self.connected = True
            logger.info("Connected to PostgreSQL cluster successfully with connection pool.")
        except Exception:
            logger.info("PostgreSQL service not detected. Running with in-memory persistence fallback.")
            self.connected = False
            self.memory_records: List[Dict[str, Any]] = []

    def _apply_schema(self):
        """Run DDL queries and GIN/B-tree indexes."""
        if not self.pool:
            return
        conn = None
        try:
            conn = self.pool.getconn()
            with conn.cursor() as cur:
                cur.execute(SCHEMA_SQL)
            conn.commit()
        except Exception as e:
            if conn:
                conn.rollback()
            logger.warning(f"Error applying PostgreSQL schema: {e}")
        finally:
            if conn:
                self.pool.putconn(conn)

    def save_decision(
        self,
        decision_id: str,
        vertical_id: str,
        channel: str,
        query_text: str,
        overall_severity: str,
        payload_json: Dict[str, Any],
        execution_mode: str
    ):
        """Insert decision record into PostgreSQL."""
        if not self.connected or not self.pool:
            self.memory_records.append({
                "decision_id": decision_id,
                "vertical_id": vertical_id,
                "channel": channel,
                "query_text": query_text,
                "overall_severity": overall_severity,
                "payload_json": payload_json,
                "execution_mode": execution_mode
            })
            return

        conn = None
        try:
            conn = self.pool.getconn()
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO decision_records 
                    (decision_id, vertical_id, channel, query_text, overall_severity, payload_json, execution_mode)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (decision_id) DO NOTHING;
                    """,
                    (
                        decision_id,
                        vertical_id,
                        channel,
                        query_text,
                        overall_severity,
                        json.dumps(payload_json),
                        execution_mode
                    )
                )
            conn.commit()
        except Exception as e:
            if conn:
                conn.rollback()
            logger.warning(f"Failed to persist decision to PostgreSQL: {e}")
        finally:
            if conn:
                self.pool.putconn(conn)

    def get_recent_decisions(self, vertical_id: Optional[str] = None, limit: int = 20) -> List[Dict[str, Any]]:
        """Query recent decisions optimized by B-Tree indexing."""
        if not self.connected or not self.pool:
            if vertical_id:
                return [r for r in self.memory_records if r["vertical_id"] == vertical_id][:limit]
            return self.memory_records[:limit]

        conn = None
        results = []
        try:
            conn = self.pool.getconn()
            with conn.cursor() as cur:
                if vertical_id:
                    cur.execute(
                        """
                        SELECT decision_id, created_at, vertical_id, channel, query_text, overall_severity, payload_json, execution_mode
                        FROM decision_records
                        WHERE vertical_id = %s
                        ORDER BY created_at DESC LIMIT %s;
                        """,
                        (vertical_id, limit)
                    )
                else:
                    cur.execute(
                        """
                        SELECT decision_id, created_at, vertical_id, channel, query_text, overall_severity, payload_json, execution_mode
                        FROM decision_records
                        ORDER BY created_at DESC LIMIT %s;
                        """,
                        (limit,)
                    )
                rows = cur.fetchall()
                for row in rows:
                    results.append({
                        "decision_id": row[0],
                        "created_at": str(row[1]),
                        "vertical_id": row[2],
                        "channel": row[3],
                        "query_text": row[4],
                        "overall_severity": row[5],
                        "payload_json": row[6],
                        "execution_mode": row[7]
                    })
        except Exception as e:
            logger.warning(f"Error reading from PostgreSQL: {e}")
        finally:
            if conn:
                self.pool.putconn(conn)

        return results


# Singleton Database Manager
db_manager = PostgresManager()
