from typing import Dict, Any
from app.agents.assessment.state import AssessmentState
from app.tools.backend_tools import update_student_mastery, get_student_mastery
from app.memory.memory import memory_system
from app.schemas import LearningDecision


def update_mastery_node(state: AssessmentState) -> Dict[str, Any]:
    """
    Node 3: Persists evaluated assessment score and adjusts mastery in the backend database.
    Also records episodic memory traces for the student.
    """
    student_id = state.get("student_id") or "student-1"
    topic = state.get("topic") or "Python Recursion"
    eval_res = state.get("evaluation_result", {})
    passed = state.get("passed", False)
    score = state.get("overall_score", 0.0)

    tool_calls = list(state.get("tool_calls_made", []))

    if eval_res.get("status") != "evaluated":
        return {
            "decision": LearningDecision(
                action="ASSESS",
                topic=topic,
                difficulty=state.get("difficulty", "MEDIUM"),
                reason="Diagnostic assessment questions delivered to student.",
                confidence=0.90,
            )
        }

    # Fetch existing mastery
    mastery_data = get_student_mastery.invoke({"student_id": student_id})
    prev_mastery = 0.50
    for m in mastery_data.get("allMasteries", []):
        if m.get("topic", "").lower() == topic.lower():
            prev_mastery = m.get("masteryScore", 0.50)
            break

    # Calculate adjustment
    if passed:
        delta = 0.12 * (1.0 - prev_mastery)
    else:
        delta = -0.08 * prev_mastery

    new_mastery = round(max(0.0, min(1.0, prev_mastery + delta)), 2)

    # Tool call: update mastery in database
    tool_res = update_student_mastery.invoke({
        "student_id": student_id,
        "topic": topic,
        "new_mastery": new_mastery,
        "is_correct": passed,
    })
    tool_calls.append({
        "tool": "update_student_mastery",
        "student_id": student_id,
        "topic": topic,
        "new_mastery": new_mastery,
        "passed": passed,
    })

    # Record episodic memory
    outcome_str = f"Passed ({score}%)" if passed else f"Failed ({score}%)"
    memory_system.record_episodic_memory(
        student_id=student_id,
        content=f"Attempted {topic} diagnostic assessment. Result: {outcome_str}. Mastery updated to {int(new_mastery * 100)}%.",
        topic=topic,
        importance_score=0.75 if passed else 0.85,
        metadata={"score": score, "passed": passed},
    )

    # Next learning decision
    if new_mastery >= 0.85:
        action = "ADVANCE"
        difficulty = "HARD"
        reason = f"Excellent mastery demonstrated in {topic} ({int(new_mastery * 100)}%). Ready to advance."
    elif passed:
        action = "PRACTICE"
        difficulty = "HARD" if score >= 85 else "MEDIUM"
        reason = f"Solid performance in {topic} ({score}%). Reinforce with active practice."
    else:
        action = "REVISE"
        difficulty = "EASY"
        reason = f"Assessment score ({score}%) indicates gaps in {topic}. Remedial revision prescribed."

    decision = LearningDecision(
        action=action,
        topic=topic,
        difficulty=difficulty,
        reason=reason,
        confidence=0.91,
    )

    log_entry = f"[update_mastery] Updated mastery for '{topic}': {prev_mastery:.2f} -> {new_mastery:.2f}. Next action: {action}."

    return {
        "mastery_update": {
            "previous_mastery": prev_mastery,
            "new_mastery": new_mastery,
            "change": round(new_mastery - prev_mastery, 2),
            "backend_response": tool_res,
        },
        "decision": decision,
        "tool_calls_made": tool_calls,
        "logs": state.get("logs", []) + [log_entry],
    }
