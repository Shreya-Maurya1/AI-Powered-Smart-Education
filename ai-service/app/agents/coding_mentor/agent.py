from typing import Optional
from app.schemas import AIResponse
from app.agents.coding_mentor.graph import coding_mentor_app


def run_coding_mentor_agent(
    student_id: str,
    problem_description: str,
    topic: Optional[str] = None,
    student_code: Optional[str] = None,
) -> AIResponse:
    """
    Executes the Coding Mentor Agent workflow:
    START -> analyze_code (Safe Sandbox) -> generate_feedback (Line-by-Line hints) -> update_progress -> END
    """
    effective_topic = topic or "Python Recursion"
    session_id = f"code-{student_id}-{effective_topic.replace(' ', '-').lower()}"
    config = {"configurable": {"thread_id": session_id}}

    initial_state = {
        "student_id": student_id,
        "problem_description": problem_description,
        "topic": effective_topic,
        "student_code": student_code,
        "is_safe": True,
        "safety_violation": None,
        "execution_success": False,
        "stdout": None,
        "stderr": None,
        "execution_time_ms": 0.0,
        "feedback": None,
        "hint": None,
        "decision": None,
        "tool_calls_made": [],
        "logs": [],
    }

    final_state = coding_mentor_app.invoke(initial_state, config=config)

    feedback = final_state.get("feedback") or ""
    hint = final_state.get("hint") or ""
    stdout = final_state.get("stdout") or ""
    stderr = final_state.get("stderr") or ""
    success = final_state.get("execution_success", False)
    duration = final_state.get("execution_time_ms", 0.0)
    decision = final_state.get("decision")
    logs = final_state.get("logs", [])

    output = f"{feedback}\n\n{hint}" if hint else feedback

    return AIResponse(
        success=True,
        agent_selected="coding_mentor",
        decision=decision,
        analysis=None,
        action_result={
            "executionSuccess": success,
            "stdout": stdout,
            "stderr": stderr,
            "durationMs": duration,
            "feedback": feedback,
            "hint": hint,
            "isSafe": final_state.get("is_safe", True),
        },
        evaluation={
            "status": "executed",
            "success": success,
            "runtimeMs": duration,
        },
        output=output,
        tool_calls_made=final_state.get("tool_calls_made", []),
        metadata={
            "phase": "Phase 5 Coding Mentor",
            "topic": effective_topic,
            "executionSuccess": success,
            "sessionLogs": logs,
        },
    )
