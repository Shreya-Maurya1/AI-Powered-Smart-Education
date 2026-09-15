from typing import Dict, Any
from app.agents.coding_mentor.state import CodingMentorState
from app.memory.memory import memory_system
from app.schemas import LearningDecision


def update_progress_node(state: CodingMentorState) -> Dict[str, Any]:
    """
    Node 3: Records coding event telemetry, saves student episodic memory,
    and returns a structured LearningDecision.
    """
    student_id = state.get("student_id") or "student-1"
    topic = state.get("topic") or "Python Recursion"
    exec_success = state.get("execution_success", False)
    duration_ms = state.get("execution_time_ms", 0.0)
    stderr = state.get("stderr") or ""

    tool_calls = list(state.get("tool_calls_made", []))

    # Record student memory
    if exec_success:
        memory_content = f"Successfully solved Python coding challenge in {topic} (execution: {duration_ms}ms)."
        importance = 0.70
    else:
        error_snippet = stderr.split("\n")[-2] if "\n" in stderr else stderr[:60]
        memory_content = f"Encountered coding difficulty in {topic}: '{error_snippet}'."
        importance = 0.85

    mem_rec = memory_system.record_episodic_memory(
        student_id=student_id,
        content=memory_content,
        topic=topic,
        importance_score=importance,
        metadata={"execution_success": exec_success, "duration_ms": duration_ms},
    )

    tool_calls.append({
        "tool": "memory_system.record_episodic_memory",
        "student_id": student_id,
        "content": memory_content,
        "importance": importance,
    })

    # Formulate decision
    if exec_success:
        action = "PRACTICE"
        difficulty = "HARD"
        reason = f"Successful code execution in {topic}. Progressing to edge cases and optimization."
    else:
        action = "PRACTICE"
        difficulty = "MEDIUM"
        reason = f"Runtime debugging required in {topic}. Review mentor hints and iterate."

    decision = LearningDecision(
        action=action,
        topic=topic,
        difficulty=difficulty,
        reason=reason,
        confidence=0.88,
    )

    log_entry = f"[update_progress] Logged coding attempt: success={exec_success}, saved memory={mem_rec is not None}."

    return {
        "decision": decision,
        "tool_calls_made": tool_calls,
        "logs": state.get("logs", []) + [log_entry],
    }
