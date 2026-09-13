from typing import Dict, Any
from app.agents.learning_adaptation.state import LearningAdaptationState
from app.tools.backend_tools import evaluate_answer

def evaluate_result_node(state: LearningAdaptationState) -> Dict[str, Any]:
    student_response = state.get("student_response")
    action_result = state.get("action_result", {})
    current_mastery = state.get("current_mastery", 0.50)
    analysis = state.get("analysis") or {}
    recent_mistakes = analysis.get("recent_mistakes", 0) if isinstance(analysis, dict) else getattr(analysis, "recent_mistakes", 0)
    
    decision = state.get("decision")
    if isinstance(decision, dict):
        action = decision.get("action", "PRACTICE")
    elif decision is not None:
        action = getattr(decision, "action", "PRACTICE")
    else:
        action = "PRACTICE"

    # If action was ADVANCE: milestone achieved
    if action == "ADVANCE":
        return {
            "evaluation": {
                "status": "completed",
                "is_correct": True,
                "feedback": "Milestone reached. Topic completed.",
                "knowledge_change": 0.0
            },
            "knowledge_change": 0.0,
            "logs": ["[evaluate_result] Action was ADVANCE; goal complete."]
        }

    # If student provided a response to evaluate
    if student_response is not None and len(str(student_response).strip()) > 0:
        expected = action_result.get("correctAnswer")
        eval_tool_res = evaluate_answer.invoke({
            "question_id": action_result.get("questionId", "eval-q-01"),
            "student_answer": str(student_response),
            "expected_answer": expected
        })

        is_correct = eval_tool_res.get("isCorrect", False)

        # Knowledge Change Signal using deterministic mastery dynamics
        if is_correct:
            knowledge_change = round(0.15 * (1.0 - current_mastery), 3)
            knowledge_change = max(0.05, knowledge_change)
        else:
            penalty = round(min(0.15, 0.05 * recent_mistakes), 3)
            knowledge_change = round(-0.10 * current_mastery - penalty, 3)

        evaluation = {
            "status": "evaluated",
            "student_response": student_response,
            "is_correct": is_correct,
            "feedback": eval_tool_res.get("feedback"),
            "expected_answer": expected,
            "knowledge_change": knowledge_change
        }

        log_entry = (
            f"[evaluate_result] Evaluated response='{student_response}'. "
            f"Correct={is_correct}, Knowledge Change Signal={knowledge_change:+.3f}"
        )

        return {
            "evaluation": evaluation,
            "knowledge_change": knowledge_change,
            "logs": [log_entry]
        }

    # If no response was provided yet (interactive step generated for the user)
    return {
        "evaluation": {
            "status": "pending_response",
            "knowledge_change": 0.0
        },
        "knowledge_change": 0.0,
        "logs": ["[evaluate_result] Awaiting student response for active step."]
    }
