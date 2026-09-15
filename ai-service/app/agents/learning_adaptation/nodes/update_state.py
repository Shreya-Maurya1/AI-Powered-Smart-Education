from typing import Dict, Any
from app.agents.learning_adaptation.state import LearningAdaptationState
from app.tools.backend_tools import update_student_mastery, save_memory

def update_state_node(state: LearningAdaptationState) -> Dict[str, Any]:
    student_id = state.get("student_id", "")
    topic = state.get("topic", "Python Recursion")
    current_mastery = state.get("current_mastery", 0.50)
    knowledge_change = state.get("knowledge_change", 0.0)
    evaluation = state.get("evaluation", {})
    target_mastery = state.get("target_mastery", 0.75)
    decision = state.get("decision")
    iteration_count = state.get("iteration_count", 0) + 1

    new_tools = []

    if evaluation.get("status") == "evaluated":
        new_mastery = round(max(0.0, min(1.0, current_mastery + knowledge_change)), 2)
        is_correct = evaluation.get("is_correct", False)

        # 1. Update student mastery in backend
        update_student_mastery.invoke({
            "student_id": student_id,
            "topic": topic,
            "new_mastery": new_mastery,
            "is_correct": is_correct
        })
        new_tools.append({
            "tool": "update_student_mastery",
            "student_id": student_id,
            "topic": topic,
            "new_mastery": new_mastery
        })

        # 2. Save episodic memory trace
        save_memory.invoke({
            "student_id": student_id,
            "memory_item": {
                "topic": topic,
                "previous_mastery": current_mastery,
                "new_mastery": new_mastery,
                "knowledge_change": knowledge_change,
                "is_correct": is_correct
            }
        })
        new_tools.append({
            "tool": "save_memory",
            "student_id": student_id,
            "topic": topic
        })
    else:
        new_mastery = current_mastery

    if isinstance(decision, dict):
        action = decision.get("action", "PRACTICE")
    elif decision is not None:
        action = getattr(decision, "action", "PRACTICE")
    else:
        action = "PRACTICE"

    goal_complete = (new_mastery >= target_mastery) or (action == "ADVANCE")

    log_entry = (
        f"[update_state] Iteration {iteration_count}: Mastery {current_mastery:.2f} -> {new_mastery:.2f}. "
        f"Goal Complete={goal_complete} (target={target_mastery:.2f})."
    )

    return {
        "current_mastery": new_mastery,
        "iteration_count": iteration_count,
        "goal_complete": goal_complete,
        "tool_calls_made": new_tools,
        "logs": [log_entry]
    }
