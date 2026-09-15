from typing import Dict, Any
from app.agents.learning_adaptation.state import LearningAdaptationState
from app.tools.backend_tools import (
    generate_practice_question,
    retrieve_learning_material,
    create_quiz,
    generate_coding_challenge,
    generate_concept_explanation,
    get_next_curriculum_topic
)

def execute_action_node(state: LearningAdaptationState) -> Dict[str, Any]:
    decision = state.get("decision")
    topic = state.get("topic", "Python Recursion")
    
    if isinstance(decision, dict):
        action = decision.get("action", "PRACTICE")
        difficulty = decision.get("difficulty", "MEDIUM")
    elif decision is not None:
        action = getattr(decision, "action", "PRACTICE")
        difficulty = getattr(decision, "difficulty", "MEDIUM")
    else:
        action = "PRACTICE"
        difficulty = "MEDIUM"
    
    new_tools = []
    action_result = {}

    if action == "PRACTICE":
        action_result = generate_practice_question.invoke({
            "topic": topic,
            "difficulty": difficulty
        })
        new_tools.append({
            "tool": "generate_practice_question",
            "topic": topic,
            "difficulty": difficulty
        })
    elif action == "REVISE":
        action_result = retrieve_learning_material.invoke({
            "topic": topic
        })
        new_tools.append({
            "tool": "retrieve_learning_material",
            "topic": topic
        })
    elif action == "ASSESS":
        action_result = create_quiz.invoke({
            "course_id": "course-python-001",
            "topic": topic,
            "num_questions": 3
        })
        new_tools.append({
            "tool": "create_quiz",
            "course_id": "course-python-001",
            "topic": topic
        })
    elif action == "CODE":
        action_result = generate_coding_challenge.invoke({
            "topic": topic,
            "difficulty": difficulty
        })
        new_tools.append({
            "tool": "generate_coding_challenge",
            "topic": topic,
            "difficulty": difficulty
        })
    elif action == "EXPLAIN":
        action_result = generate_concept_explanation.invoke({
            "topic": topic
        })
        new_tools.append({
            "tool": "generate_concept_explanation",
            "topic": topic
        })
    elif action == "ADVANCE":
        action_result = get_next_curriculum_topic.invoke({
            "topic": topic
        })
        new_tools.append({
            "tool": "get_next_curriculum_topic",
            "topic": topic
        })

    log_entry = f"[execute_action] Executed {action} tool dispatch for '{topic}'."

    return {
        "action_result": action_result,
        "tool_calls_made": new_tools,
        "logs": [log_entry]
    }
