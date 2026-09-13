import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.memory.storage import memory_storage
from app.memory.retrieval import memory_retriever

logger = logging.getLogger("adaptivemind.memory")


class MemoryItem(BaseModel):
    id: str
    student_id: str
    category: str = Field(description="'WORKING', 'EPISODIC', or 'SEMANTIC'")
    content: str
    topic: Optional[str] = "General"
    importance_score: float = 0.5
    metadata: Dict[str, Any] = {}


class StudentMemorySystem:
    """
    Lightweight, unified student memory system spanning three tiers:
    1. Working Memory: In-flight session and LangGraph state variables.
    2. Episodic Memory: Dated specific events (e.g. 'Failed quiz #2 on SQL Joins').
    3. Semantic Memory: Enduring distilled knowledge (e.g. 'Struggles with recursion call stack').
    """

    def __init__(self):
        self._working_memory: Dict[str, Dict[str, Any]] = {}

    def is_memory_useful(self, content: str, importance_score: float = 0.5) -> bool:
        """
        Gating filter: Evaluates whether student activity contains high-value pedagogical signal.
        Filters out trivial page clicks while retaining learning style observations,
        repeated error patterns, and cognitive misconceptions.
        """
        high_value_keywords = [
            "struggled", "failed", "incorrect", "wrong", "mastered", "preference",
            "visual", "analogy", "confusion", "error", "exception", "recurse", "breakthrough",
            "passed", "difficulty", "prerequisite", "concept"
        ]
        lowered = content.lower()
        if importance_score >= 0.70:
            return True
        if any(kw in lowered for kw in high_value_keywords):
            return True
        return len(content.strip()) > 30 and importance_score >= 0.50

    def record_episodic_memory(
        self,
        student_id: str,
        content: str,
        topic: str = "General",
        importance_score: float = 0.65,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        """Record a time-bound student learning experience if deemed useful."""
        if not self.is_memory_useful(content, importance_score):
            logger.debug(f"Discarding low-value memory candidate: {content}")
            return None

        return memory_storage.save(
            student_id=student_id,
            category="EPISODIC",
            content=content,
            topic=topic,
            importance_score=importance_score,
            metadata=metadata or {},
        )

    def record_semantic_memory(
        self,
        student_id: str,
        content: str,
        topic: str = "General",
        importance_score: float = 0.85,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Record an enduring student capability, learning style, or persistent misconception."""
        return memory_storage.save(
            student_id=student_id,
            category="SEMANTIC",
            content=content,
            topic=topic,
            importance_score=importance_score,
            metadata=metadata or {},
        )

    # Working Memory Methods (In-Flight State)
    def set_working_memory(self, session_id: str, key: str, value: Any):
        if session_id not in self._working_memory:
            self._working_memory[session_id] = {}
        self._working_memory[session_id][key] = value

    def get_working_memory(self, session_id: str, key: str, default: Any = None) -> Any:
        return self._working_memory.get(session_id, {}).get(key, default)

    def clear_working_memory(self, session_id: str):
        if session_id in self._working_memory:
            del self._working_memory[session_id]

    # Context Retrieval for Agents
    def retrieve_memory(
        self,
        student_id: str,
        topic: Optional[str] = None,
        query: Optional[str] = None,
        top_k: int = 4,
    ) -> List[Dict[str, Any]]:
        return memory_retriever.retrieve_context(
            student_id=student_id,
            topic=topic,
            query=query,
            top_k=top_k,
        )

    def format_for_prompt(
        self,
        student_id: str,
        topic: Optional[str] = None,
        query: Optional[str] = None,
    ) -> str:
        memories = self.retrieve_memory(student_id=student_id, topic=topic, query=query)
        return memory_retriever.format_memory_for_prompt(memories)


memory_system = StudentMemorySystem()
