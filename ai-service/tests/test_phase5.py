import pytest
from app.rag.embeddings import embedding_generator
from app.rag.loaders import document_loader
from app.rag.retriever import rag_retriever
from app.memory.memory import memory_system
from app.agents.tutor import run_tutor_agent
from app.agents.assessment import run_assessment_agent
from app.agents.coding_mentor import run_coding_mentor_agent


# 1. RAG Pipeline Tests
def test_dense_embeddings_dimension_and_norm():
    vec = embedding_generator.embed_text("Python Recursion Base Condition")
    assert len(vec) == 384
    # Check normalized unit vector length
    norm = sum(x * x for x in vec) ** 0.5
    assert abs(norm - 1.0) < 1e-3


def test_document_loader_chunking():
    long_text = (
        "Recursion is a programming technique where a function calls itself. " * 15
    )
    chunks = document_loader.load_text(long_text, "doc-test", "Python Recursion", "Test Title")
    assert len(chunks) >= 2
    for c in chunks:
        assert c.document_id == "doc-test"
        assert len(c.content) > 10


def test_rag_retriever_query_and_citations():
    results = rag_retriever.retrieve("What stops recursion from calling itself forever?", "Python Recursion")
    assert len(results) > 0
    citations = rag_retriever.format_citations(results)
    assert "Referenced Curriculum Sources" in citations
    assert "doc-rec" in results[0]["chunk_id"]


# 2. Memory System Tests
def test_memory_usefulness_filter():
    # Trivial text should be rejected
    assert not memory_system.is_memory_useful("Clicked next button", 0.2)
    # Pedagogically valuable text should be retained
    assert memory_system.is_memory_useful("Student failed recursion quiz base condition", 0.8)


def test_memory_recording_and_retrieval():
    student_id = "test-student-phase5"
    memory_system.record_episodic_memory(
        student_id=student_id,
        content="Student struggled with recursion call stack frames.",
        topic="Python Recursion",
        importance_score=0.9,
    )
    memory_system.record_semantic_memory(
        student_id=student_id,
        content="Prefers visual code diagrams and step-by-step traces.",
        topic="Python Recursion",
        importance_score=0.85,
    )

    retrieved = memory_system.retrieve_memory(student_id, topic="Python Recursion")
    assert len(retrieved) >= 2
    contents = [m["content"] for m in retrieved]
    assert any("call stack" in c for c in contents)


# 3. Tutor Agent Tests
def test_tutor_agent_grounding_and_memory():
    res = run_tutor_agent(
        student_id="cmtt5drap00021dekmkdu4xt4",
        question="How does recursion work?",
        topic="Python Recursion",
    )
    assert res.success is True
    assert res.agent_selected == "tutor_agent"
    assert res.action_result.get("memoryActive") is True
    assert len(res.action_result.get("citations", "")) > 0
    assert "Referenced Curriculum Sources" in res.output


# 4. Assessment Agent Tests
def test_assessment_agent_objective_evaluation():
    res = run_assessment_agent(
        student_id="s1",
        topic="Python Recursion",
        student_response="B",
    )
    assert res.success is True
    assert res.action_result["passed"] is True
    assert res.action_result["overallScore"] == 100.0
    assert res.action_result["rubricBreakdown"]["evaluation_type"] == "DETERMINISTIC_OBJECTIVE"


def test_assessment_agent_subjective_rubric():
    essay = (
        "In a recursive function, the base condition halts recursion. "
        "Each call pushes a frame to the system call stack because arguments reduce towards the limit. "
        "Then the stack unwinds and returns values cleanly."
    )
    res = run_assessment_agent(
        student_id="s1",
        topic="Python Recursion",
        student_response=essay,
    )
    assert res.success is True
    rubric = res.action_result["rubricBreakdown"]
    assert rubric["evaluation_type"] == "RUBRIC_SUBJECTIVE"
    assert "accuracy" in rubric
    assert "completeness" in rubric
    assert "reasoning" in rubric
    assert "clarity" in rubric
    assert rubric["overall_weighted_score"] >= 70.0


# 5. Coding Mentor Tests
def test_coding_mentor_safe_execution():
    code = "def fact(n):\n    return 1 if n <= 1 else n * fact(n-1)\nprint(fact(4))"
    res = run_coding_mentor_agent("s1", "Factorial", "Python Recursion", code)
    assert res.success is True
    assert res.action_result["executionSuccess"] is True
    assert "24" in res.action_result["stdout"]


def test_coding_mentor_recursion_error_detection():
    code = "def bad(n):\n    return bad(n-1)\nbad(10)"
    res = run_coding_mentor_agent("s1", "Infinite", "Python Recursion", code)
    assert res.success is True
    assert res.action_result["executionSuccess"] is False
    assert "Recursion Error Detected" in res.action_result["feedback"]
    assert "Hint" in res.action_result["hint"]


def test_coding_mentor_sandbox_security():
    code = "import os\nos.system('echo test')"
    res = run_coding_mentor_agent("s1", "Restricted", "Python Basics", code)
    assert res.success is True
    assert res.action_result["isSafe"] is False
    assert "restricted in the sandbox" in res.action_result["stderr"]
