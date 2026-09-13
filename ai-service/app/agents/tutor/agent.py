from typing import Optional, Dict, Any
from app.schemas import AIResponse
from app.agents.tutor.graph import tutor_app


def run_tutor_agent(
    student_id: str,
    question: str,
    topic: Optional[str] = None,
    context: Optional[Dict[str, Any]] = None,
) -> AIResponse:
    """
    Executes the Socratic Tutor Agent workflow:
    START -> retrieve_context (RAG + Memory) -> generate_response -> validate_response -> END
    Returns grounded answer with source citations and active memory indicator.
    """
    effective_topic = topic or "Python Recursion"
    session_id = f"tutor-{student_id}-{effective_topic.replace(' ', '-').lower()}"
    config = {"configurable": {"thread_id": session_id}}

    initial_state = {
        "student_id": student_id,
        "question": question,
        "topic": effective_topic,
        "context": context or {},
        "rag_chunks": [],
        "memories": [],
        "generated_answer": None,
        "validated_answer": None,
        "citations": None,
        "memory_active": False,
        "grounding_score": 0.0,
        "decision": None,
        "tool_calls_made": [],
        "logs": [],
    }

    final_state = tutor_app.invoke(initial_state, config=config)

    output = final_state.get("validated_answer") or final_state.get("generated_answer") or ""
    citations = final_state.get("citations") or ""
    memory_active = final_state.get("memory_active", False)
    memories = final_state.get("memories", [])
    rag_chunks = final_state.get("rag_chunks", [])
    logs = final_state.get("logs", [])

    return AIResponse(
        success=True,
        agent_selected="tutor_agent",
        decision=final_state.get("decision"),
        analysis=None,
        action_result={
            "citations": citations,
            "memoryActive": memory_active,
            "memoriesCount": len(memories),
            "ragChunksCount": len(rag_chunks),
            "groundingScore": final_state.get("grounding_score", 0.90),
            "activeMemories": [m.get("content") for m in memories[:3]],
        },
        evaluation=None,
        output=output,
        tool_calls_made=final_state.get("tool_calls_made", []),
        metadata={
            "phase": "Phase 5 Tutor Agent",
            "topic": effective_topic,
            "memoryActive": memory_active,
            "ragChunksCount": len(rag_chunks),
            "sessionLogs": logs,
        },
    )
