from typing import Dict, Any, Literal
from app.agents.learning_adaptation.state import LearningAdaptationState
from app.schemas import LearningStateAnalysis

def analyze_learning_state_node(state: LearningAdaptationState) -> Dict[str, Any]:
    topic = state.get("topic", "Python Recursion")
    current_mastery = state.get("current_mastery", 0.50)
    history_data = state.get("history_data", [])
    mastery_data = state.get("mastery_data", {})
    prerequisites = state.get("prerequisites", [])

    # 1. Compute Knowledge Gap
    knowledge_gap = round(max(0.0, 1.0 - current_mastery), 3)

    # 2. Compute Recent Mistakes from Telemetry
    recent_mistakes = 0
    for event in history_data:
        ev_type = event.get("eventType", "")
        ev_topic = event.get("topic", "")
        if ev_type in ["QUESTION_WRONG", "ASSESSMENT_FAILED"]:
            if not ev_topic or ev_topic.strip().lower() == topic.strip().lower():
                recent_mistakes += 1

    # 3. Check Prerequisite Satisfaction
    prereq_satisfied = True
    for edge in prerequisites:
        if edge.get("topic", "").strip().lower() == topic.strip().lower():
            prereq_topic = edge.get("prerequisiteTopic", "")
            prereq_score = 0.80
            for m in mastery_data.get("allMasteries", []):
                if m.get("topic", "").strip().lower() == prereq_topic.strip().lower():
                    prereq_score = m.get("masteryScore", 0.80)
                    break
            if prereq_score < 0.65:
                prereq_satisfied = False
            break

    # 4. Determine Adaptive Difficulty
    if current_mastery < 0.45:
        difficulty: Literal["EASY", "MEDIUM", "HARD"] = "EASY"
    elif current_mastery < 0.70:
        difficulty = "MEDIUM"
    else:
        difficulty = "HARD"

    # 5. Formulate Strategy
    if current_mastery >= 0.85:
        strategy = "ADVANCE_CURRICULUM"
    elif current_mastery < 0.50 and not prereq_satisfied:
        strategy = "REMEDIAL_REVISION"
    elif current_mastery < 0.60 and recent_mistakes >= 2:
        strategy = "TARGETED_PRACTICE"
    elif 0.75 <= current_mastery < 0.85:
        strategy = "DIAGNOSTIC_ASSESSMENT"
    else:
        strategy = "ACTIVE_PRACTICE"

    confidence = round(min(0.95, max(0.80, 0.82 + (0.05 if len(history_data) >= 3 else 0.0))), 2)

    analysis = LearningStateAnalysis(
        current_mastery=current_mastery,
        knowledge_gap=knowledge_gap,
        confidence=confidence,
        difficulty=difficulty,
        recent_mistakes=recent_mistakes,
        prerequisite_satisfied=prereq_satisfied,
        recommended_strategy=strategy
    )

    log_entry = (
        f"[analyze_learning_state] Mastery={current_mastery:.2f}, Gap={knowledge_gap:.2f}, "
        f"Mistakes={recent_mistakes}, Strategy={strategy}, Difficulty={difficulty}"
    )

    return {
        "analysis": analysis.model_dump(),
        "logs": [log_entry]
    }
