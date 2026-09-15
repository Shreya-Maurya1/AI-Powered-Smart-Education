import re
from typing import Dict, Any
from app.agents.assessment.state import AssessmentState


def evaluate_answer_node(state: AssessmentState) -> Dict[str, Any]:
    """
    Node 2: Evaluates student submission.
    - Objective answers: Deterministic verification.
    - Subjective answers: Rubric evaluation:
      * Accuracy (40%)
      * Completeness (25%)
      * Reasoning (25%)
      * Clarity (10%)
    """
    student_response = state.get("student_response") or ""
    questions = state.get("generated_questions", [])
    topic = state.get("topic") or "Python Recursion"

    if not student_response:
        # Awaiting response
        return {
            "evaluation_result": {
                "status": "awaiting_submission",
                "message": "Questions prepared. Submit response to trigger rubric evaluation.",
            },
            "rubric_breakdown": None,
            "overall_score": 0.0,
            "passed": False,
            "logs": state.get("logs", []) + ["[evaluate_answer] Assessment questions ready for student."],
        }

    clean_resp = student_response.strip()

    # Determine if response is a single-letter objective MCQ choice (A, B, C, D)
    is_objective_choice = bool(re.match(r"^[A-Da-d]$", clean_resp)) or (
        len(clean_resp) <= 3 and clean_resp.upper() in ["A", "B", "C", "D"]
    )

    if is_objective_choice:
        # 1. Deterministic Objective Evaluation
        target_q = next((q for q in questions if q.get("type") == "OBJECTIVE"), questions[0] if questions else {})
        correct_ans = target_q.get("correct_answer", "B")
        is_correct = clean_resp.upper() == correct_ans.upper()
        overall_score = 100.0 if is_correct else 0.0
        passed = is_correct

        rubric_breakdown = {
            "evaluation_type": "DETERMINISTIC_OBJECTIVE",
            "accuracy": 100.0 if is_correct else 0.0,
            "completeness": 100.0 if is_correct else 0.0,
            "reasoning": 100.0 if is_correct else 0.0,
            "clarity": 100.0 if is_correct else 0.0,
            "feedback": (
                f"Correct! Option {correct_ans} is the exact answer."
                if is_correct
                else f"Incorrect. Selected {clean_resp.upper()}, expected {correct_ans}."
            ),
        }
    else:
        # 2. Subjective Rubric Evaluation
        # Rubric: Accuracy 40%, Completeness 25%, Reasoning 25%, Clarity 10%
        text_lower = clean_resp.lower()

        # Score Accuracy (40%)
        accuracy_signals = ["base", "stack", "call", "frame", "stop", "condition", "terminate", "infinite", "join", "left", "null", "match"]
        matched_acc = sum(1 for s in accuracy_signals if s in text_lower)
        acc_score = min(100.0, max(40.0, matched_acc * 25.0))

        # Score Completeness (25%)
        word_count = len(clean_resp.split())
        comp_score = min(100.0, max(30.0, (word_count / 20.0) * 100.0))

        # Score Reasoning (25%)
        reasoning_signals = ["because", "therefore", "since", "returns", "reduces", "unwinds", "when", "if", "order", "result"]
        matched_reason = sum(1 for s in reasoning_signals if s in text_lower)
        reason_score = min(100.0, max(35.0, matched_reason * 30.0))

        # Score Clarity (10%)
        has_punctuation = any(p in clean_resp for p in [".", ",", ";", ":", "`"])
        clarity_score = 90.0 if (has_punctuation and len(clean_resp) > 20) else 65.0

        # Weighted calculation
        overall_score = round(
            (acc_score * 0.40) + (comp_score * 0.25) + (reason_score * 0.25) + (clarity_score * 0.10),
            1,
        )
        passed = overall_score >= 70.0

        feedback = (
            f"Evaluated with Phase 5 Rubric. Demonstrates strong understanding of {topic}."
            if passed
            else f"Needs reinforcement in {topic}. Review technical completeness and causal reasoning."
        )

        rubric_breakdown = {
            "evaluation_type": "RUBRIC_SUBJECTIVE",
            "accuracy": {"weight": "40%", "score": acc_score},
            "completeness": {"weight": "25%", "score": comp_score},
            "reasoning": {"weight": "25%", "score": reason_score},
            "clarity": {"weight": "10%", "score": clarity_score},
            "overall_weighted_score": overall_score,
            "feedback": feedback,
        }

    evaluation_result = {
        "status": "evaluated",
        "score": overall_score,
        "passed": passed,
        "is_correct": passed,
    }

    log_entry = (
        f"[evaluate_answer] Evaluated answer ({rubric_breakdown['evaluation_type']}): "
        f"Score={overall_score}%, Passed={passed}."
    )

    return {
        "evaluation_result": evaluation_result,
        "rubric_breakdown": rubric_breakdown,
        "overall_score": overall_score,
        "passed": passed,
        "logs": state.get("logs", []) + [log_entry],
    }
