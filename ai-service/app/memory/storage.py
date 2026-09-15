import json
import logging
import uuid
from typing import List, Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

from app.config import settings

logger = logging.getLogger("adaptivemind.memory.storage")


class MemoryStorage:
    """
    Persistent storage layer for student memories in PostgreSQL (student_memories).
    Includes an in-memory fallback cache for fast lookups.
    """

    def __init__(self):
        self._cache: Dict[str, List[Dict[str, Any]]] = {
            "cmtt5drap00021dekmkdu4xt4": [
                {
                    "id": "mem-seed-01",
                    "student_id": "cmtt5drap00021dekmkdu4xt4",
                    "category": "EPISODIC",
                    "content": "Student previously struggled with recursive base conditions in Python loops.",
                    "topic": "Python Recursion",
                    "importance_score": 0.85,
                    "metadata": {"source": "Assessment Attempt #1"},
                    "created_at": "2026-09-13 18:00:00",
                },
                {
                    "id": "mem-seed-02",
                    "student_id": "cmtt5drap00021dekmkdu4xt4",
                    "category": "SEMANTIC",
                    "content": "Prefers step-by-step visual breakdowns and call-stack tracing examples.",
                    "topic": "Python Recursion",
                    "importance_score": 0.90,
                    "metadata": {"preference": "visual_tracing"},
                    "created_at": "2026-09-13 18:00:00",
                },
            ]
        }

    def _get_db_connection(self):
        try:
            conn = psycopg2.connect(
                dbname=settings.DB_NAME,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                connect_timeout=3,
            )
            return conn
        except Exception as e:
            logger.warning(f"PostgreSQL connection error in memory storage: {e}")
            return None

    def save(
        self,
        student_id: str,
        category: str,
        content: str,
        topic: Optional[str] = None,
        importance_score: float = 0.5,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Save a new memory record to PostgreSQL and cache."""
        mem_id = f"mem-{uuid.uuid4().hex[:10]}"
        meta = metadata or {}
        record = {
            "id": mem_id,
            "student_id": student_id,
            "category": category.upper(),
            "content": content.strip(),
            "topic": topic or "General",
            "importance_score": round(importance_score, 2),
            "metadata": meta,
        }

        # Cache in memory
        if student_id not in self._cache:
            self._cache[student_id] = []
        self._cache[student_id].append(record)

        # Persist to database
        conn = self._get_db_connection()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        INSERT INTO student_memories (id, student_id, category, content, topic, importance_score, metadata)
                        VALUES (%s, %s, %s, %s, %s, %s, %s);
                        """,
                        (
                            mem_id,
                            student_id,
                            category.upper(),
                            content.strip(),
                            topic or "General",
                            importance_score,
                            json.dumps(meta),
                        ),
                    )
                conn.commit()
            except Exception as e:
                logger.warning(f"Failed to persist memory to DB: {e}")
            finally:
                conn.close()

        return record

    def fetch_all(
        self,
        student_id: str,
        category: Optional[str] = None,
        topic: Optional[str] = None,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        """Retrieve stored memories for a student."""
        memories = []
        conn = self._get_db_connection()
        if conn:
            try:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    query = "SELECT id, student_id, category, content, topic, importance_score, metadata, created_at FROM student_memories WHERE student_id = %s"
                    params = [student_id]
                    if category:
                        query += " AND category = %s"
                        params.append(category.upper())
                    if topic:
                        query += " AND LOWER(topic) = LOWER(%s)"
                        params.append(topic)
                    query += " ORDER BY importance_score DESC, created_at DESC LIMIT %s;"
                    params.append(limit)

                    cur.execute(query, params)
                    rows = cur.fetchall()
                    for r in rows:
                        memories.append({
                            "id": r["id"],
                            "student_id": r["student_id"],
                            "category": r["category"],
                            "content": r["content"],
                            "topic": r["topic"],
                            "importance_score": float(r["importance_score"] or 0.5),
                            "metadata": r["metadata"] if isinstance(r["metadata"], dict) else {},
                            "created_at": str(r["created_at"]),
                        })
            except Exception as e:
                logger.warning(f"Error fetching memories from DB: {e}")
            finally:
                conn.close()

        if not memories:
            # Fallback to cache
            cached = self._cache.get(student_id, [])
            if category:
                cached = [m for m in cached if m["category"] == category.upper()]
            if topic:
                cached = [m for m in cached if m["topic"].lower() == topic.lower()]
            memories = cached[:limit]

        return memories


memory_storage = MemoryStorage()
