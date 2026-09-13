from typing import Dict, Any
from app.agents.learning_adaptation.state import LearningAdaptationState
from app.schemas import LearningDecision

def decide_action_node(state: LearningAdaptationState) -> Dict[str, Any]:
    analysis_raw = state.get("analysis")
    topic = state.get("topic", "Python Recursion")
    
    if analysis_raw is None:
        mastery = state.get("current_mastery", 0.50)
        recent_mistakes = 0
        diff = "MEDIUM"
        prereq_ok = True
        confidence = 0.88
    else:
        mastery = analysis_raw.get("current_mastery", 0.50)
        recent_mistakes = analysis_raw.get("recent_mistakes", 0)
        diff = analysis_raw.get("difficulty", "MEDIUM")
        prereq_ok = analysis_raw.get("prerequisite_satisfied", True)
        confidence = analysis_raw.get("confidence", 0.88)

    # Decision Policy Matrix
    if mastery >= 0.85:
        action = "ADVANCE"
        difficulty = "HARD"
        reason = (
            f"Topic '{topic}' is thoroughly mastered ({mastery * 100:.0f}% >= 85%). "
            "Advancing to subsequent curriculum progression."
        )
        prereq = None
    elif mastery < 0.40 and not prereq_ok:
        action = "REVISE"
        difficulty = "EASY"
        reason = (
            f"Prerequisite knowledge gap identified for '{topic}'. "
            "Foundational concept revision required before proceeding."
        )
        prereq = "Python Functions"
    elif mastery < 0.65 and recent_mistakes >= 2:
        action = "PRACTICE"
        difficulty = "MEDIUM" if mastery >= 0.35 else "EASY"
        reason = (
            f"Detected repeated mistake pattern ({recent_mistakes} wrong attempts) "
            f"with mastery at {mastery * 100:.0f}%. Prescribing targeted practice."
        )
        prereq = None
    elif 0.75 <= mastery < 0.85:
        action = "ASSESS"
        difficulty = "HARD"
        reason = (
            f"High competency attained ({mastery * 100:.0f}%). "
            "Diagnostic assessment required to validate mastery threshold."
        )
        prereq = None
    elif mastery < 0.50:
        action = "REVISE"
        difficulty = "EASY"
        reason = (
            f"Mastery ({mastery * 100:.0f}%) is below 50%. "
            "Foundational conceptual review and guided walkthrough recommended."
        )
        prereq = None
    else:
        action = "PRACTICE"
        difficulty = diff
        reason = f"Active problem solving recommended to strengthen understanding in '{topic}'."
        prereq = None

    decision = LearningDecision(
        action=action,
        topic=topic,
        difficulty=difficulty,
        reason=reason,
        confidence=confidence,
        recommended_prerequisite=prereq
    )

    log_entry = f"[decide_action] Selected Action: {action} ({difficulty}) -> {reason}"

    return {
        "decision": decision.model_dump(),
        "logs": [log_entry]
    }
