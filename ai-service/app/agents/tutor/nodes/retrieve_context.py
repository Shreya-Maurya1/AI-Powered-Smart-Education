from typing import Dict, Any
from app.agents.tutor.state import TutorState
from app.rag.retriever import rag_retriever
from app.memory.memory import memory_system


def retrieve_context_node(state: TutorState) -> Dict[str, Any]:
    """
    Node 1: Concurrently retrieves both grounded RAG curriculum material
    and student memory traces (Episodic + Semantic).
    """
    student_id = state.get("student_id", "")
    question = state.get("question", "")
    topic = state.get("topic") or "Python Recursion"

    tool_calls = list(state.get("tool_calls_made", []))

    # 1. Retrieve RAG chunks
    rag_chunks = rag_retriever.retrieve(query=question, topic=topic, top_k=3)
    tool_calls.append({
        "tool": "rag_retriever",
        "query": question,
        "topic": topic,
        "chunks_found": len(rag_chunks),
    })

    # 2. Retrieve Student Memory
    memories = memory_system.retrieve_memory(student_id=student_id, topic=topic, query=question, top_k=3)
    tool_calls.append({
        "tool": "memory_system.retrieve_memory",
        "student_id": student_id,
        "topic": topic,
        "memories_found": len(memories),
    })

    memory_active = len(memories) > 0
    log_entry = (
        f"[retrieve_context] Ingested {len(rag_chunks)} RAG chunks "
        f"and {len(memories)} memory traces (Memory Active: {memory_active})."
    )

    return {
        "rag_chunks": rag_chunks,
        "memories": memories,
        "memory_active": memory_active,
        "tool_calls_made": tool_calls,
        "logs": state.get("logs", []) + [log_entry],
    }
