from typing import Dict, Any
from app.agents.tutor.state import TutorState
from app.rag.retriever import rag_retriever


def generate_response_node(state: TutorState) -> Dict[str, Any]:
    """
    Node 2: Generates a Socratic, grounded pedagogical explanation.
    Adapts explanation directly to student memories and references curriculum chunks.
    """
    question = state.get("question", "")
    topic = state.get("topic") or "Python Recursion"
    rag_chunks = state.get("rag_chunks", [])
    memories = state.get("memories", [])

    # Extract memory hints
    memory_notes = []
    has_visual_pref = False
    has_base_case_struggle = False

    for m in memories:
        content = m.get("content", "").lower()
        if "visual" in content or "diagram" in content or "tree" in content:
            has_visual_pref = True
        if "base" in content or "infinite" in content or "condition" in content or "failed" in content:
            has_base_case_struggle = True
        memory_notes.append(m.get("content", ""))

    # Extract primary RAG excerpts
    curriculum_points = []
    for c in rag_chunks:
        curriculum_points.append(c.get("content", ""))

    rag_context_str = " ".join(curriculum_points)

    # Compose Socratic Tutoring Explanation
    greeting = f"Hello! Let's explore **{topic}** together.\n\n"

    # Memory grounding prefix
    memory_adaptation = ""
    if has_base_case_struggle:
        memory_adaptation = (
            "> 🧠 *Tutor Note: Recalling your recent practice with recursion conditions — "
            "we will pay special attention to ensuring the termination branch is crystal clear.*\n\n"
        )
    elif has_visual_pref:
        memory_adaptation = (
            "> 🧠 *Tutor Note: Adapting to your visual learning preference with structured call-stack frames.*\n\n"
        )
    elif memories:
        memory_adaptation = f"> 🧠 *Tutor Note: Connected to your active learning history in {topic}.*\n\n"

    # Core conceptual explanation grounded in curriculum
    if "base" in question.lower() or "stopping" in question.lower() or "terminate" in question.lower():
        body = (
            "In recursion, the **Base Condition** is your function's safety hatch. "
            "Without it, Python continues allocating new frames on the system call stack until hitting "
            "`RecursionError: maximum recursion depth exceeded`.\n\n"
            "Here is the standard mental model:\n"
            "```python\n"
            "def countdown(n):\n"
            "    # 1. Base Condition (Stops the chain)\n"
            "    if n <= 0:\n"
            "        print('Blastoff!')\n"
            "        return\n"
            "    \n"
            "    # 2. Recursive Step (Reduces argument towards 0)\n"
            "    print(n)\n"
            "    countdown(n - 1)\n"
            "```\n"
            "Notice how every invocation with `n - 1` strictly moves closer to `n <= 0`."
        )
    elif "join" in topic.lower() or "sql" in topic.lower():
        body = (
            "When joining tables in SQL, think of each JOIN type as a specific set operation:\n\n"
            "- **`INNER JOIN`**: Returns only records where matching keys exist in *both* tables (the intersection).\n"
            "- **`LEFT JOIN`**: Preserves *every* row from the left table. If the right table has no match, it fills with `NULL`.\n"
            "- **`RIGHT JOIN`**: Preserves every row from the right table, filling missing left fields with `NULL`.\n\n"
            "```sql\n"
            "SELECT students.name, courses.title\n"
            "FROM students\n"
            "LEFT JOIN student_courses ON students.id = student_courses.student_id\n"
            "LEFT JOIN courses ON student_courses.course_id = courses.id;\n"
            "```"
        )
    else:
        # Grounded from RAG
        excerpt = curriculum_points[0] if curriculum_points else f"Core principles of {topic} involve modular abstraction."
        body = (
            f"Here is how we analyze this concept step by step:\n\n"
            f"{excerpt}\n\n"
            f"**Key Rule of Thumb**:\n"
            f"Always identify your known starting condition, then verify how your function transitions state."
        )

    # Checkpoint Socratic Question to foster active recall
    checkpoint = (
        "\n\n**Quick Checkpoint for You**:\n"
        "If you pass `countdown(-2)` into our function above, does it terminate immediately or recurse? Why?"
    )

    full_response = greeting + memory_adaptation + body + checkpoint

    return {
        "generated_answer": full_response,
        "logs": state.get("logs", []) + ["[generate_response] Synthesized grounded Socratic explanation."],
    }
