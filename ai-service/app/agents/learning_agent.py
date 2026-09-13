from typing import Dict, Any, Optional
from app.schemas import AIResponse, LearningDecision
from app.agents.demo_graph import demo_graph_app

def run_learning_agent(student_id: str, topic: Optional[str] = None, context: Optional[Dict[str, Any]] = None) -> AIResponse:
    """Learning Adaptation Agent (Phase 3 skeleton powered by LangGraph demo graph)."""
    initial_state = {
        "student_id": student_id,
        "topic": topic,
        "tool_calls_made": []
    }
    config = {"configurable": {"thread_id": f"learning-{student_id}"}}
    result = demo_graph_app.invoke(initial_state, config=config)

    decision = result.get("decision")
    output = result.get("final_output") or f"Learning plan evaluated for {student_id}."

    return AIResponse(
        success=True,
        agent_selected="learning_agent",
        decision=decision,
        output=output,
        tool_calls_made=result.get("tool_calls_made", []),
        metadata={
            "status": "active",
            "phase": "Phase 3 Skeleton",
            "checkpointer": "MemorySaver"
        }
    )
