from typing import Dict, Any, List
from app.agents.assessment.state import AssessmentState


def generate_assessment_node(state: AssessmentState) -> Dict[str, Any]:
    """
    Node 1: Generates diagnostic assessment questions for a topic.
    Includes both objective (MCQ) and subjective (conceptual explanation) items.
    """
    topic = state.get("topic") or "Python Recursion"
    num_questions = state.get("num_questions", 2)
    difficulty = state.get("difficulty", "MEDIUM")

    normalized = topic.lower()
    questions: List[Dict[str, Any]] = []

    if "recursion" in normalized:
        questions = [
            {
                "id": "q-rec-obj-01",
                "type": "OBJECTIVE",
                "question": "What happens if a recursive function in Python lacks a base condition?",
                "options": [
                    "A) It compiles without warnings and terminates normally",
                    "B) It triggers RecursionError: maximum recursion depth exceeded",
                    "C) It automatically converts into an iterative while loop",
                    "D) It pauses execution until user keyboard input",
                ],
                "correct_answer": "B",
                "points": 10,
            },
            {
                "id": "q-rec-subj-02",
                "type": "SUBJECTIVE",
                "question": "Explain how the system call stack manages function frames during a recursive factorial calculation. Why is returning intermediate values essential?",
                "rubric_target": "Should explain call stack push/pop frames, base case return, and intermediate multiplication unwind.",
                "points": 20,
            },
        ]
    elif "sql" in normalized or "join" in normalized:
        questions = [
            {
                "id": "q-sql-obj-01",
                "type": "OBJECTIVE",
                "question": "Which SQL JOIN returns all records from Table A and only matched records from Table B?",
                "options": [
                    "A) INNER JOIN",
                    "B) FULL JOIN",
                    "C) LEFT JOIN",
                    "D) CROSS JOIN",
                ],
                "correct_answer": "C",
                "points": 10,
            },
            {
                "id": "q-sql-subj-02",
                "type": "SUBJECTIVE",
                "question": "When would you choose a LEFT OUTER JOIN instead of an INNER JOIN? Provide a real-world relational database scenario.",
                "rubric_target": "Should discuss missing matching records, preserving left entities (e.g. students without course enrollments), and NULL population.",
                "points": 20,
            },
        ]
    else:
        questions = [
            {
                "id": f"q-{topic.replace(' ', '-').lower()}-01",
                "type": "OBJECTIVE",
                "question": f"What is the foundational paradigm for {topic} in modern computing?",
                "options": [
                    "A) Deterministic modular encapsulation",
                    "B) Uncontrolled global state modification",
                    "C) Arbitrary execution loops",
                    "D) Blocking thread starvation",
                ],
                "correct_answer": "A",
                "points": 10,
            },
            {
                "id": f"q-{topic.replace(' ', '-').lower()}-02",
                "type": "SUBJECTIVE",
                "question": f"Describe the core algorithmic tradeoffs and memory implications when implementing {topic}.",
                "rubric_target": f"Should analyze space complexity, efficiency, and real-world applicability of {topic}.",
                "points": 20,
            },
        ]

    selected_questions = questions[:num_questions]
    log_entry = f"[generate_assessment] Generated {len(selected_questions)} assessment questions for '{topic}'."

    return {
        "generated_questions": selected_questions,
        "logs": state.get("logs", []) + [log_entry],
    }
