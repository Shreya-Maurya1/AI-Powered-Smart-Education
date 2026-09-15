import pytest
from pathlib import Path
from app.debugging.tracer import tracer, generate_run_id, RUNTIME_DIR, TRACES_DIR
from app.debugging.evaluation import run_full_system_evaluation
from app.debugging.benchmark import run_benchmark
from app.agents.learning_adaptation.agent import run_learning_adaptation_agent
from app.agents.tutor.agent import run_tutor_agent
from app.agents.assessment.agent import run_assessment_agent
from app.agents.coding_mentor.agent import run_coding_mentor_agent


def test_tracer_run_lifecycle():
    run_id = tracer.start_run(
        agent="test_agent",
        objective="Verify trace lifecycle persistence",
        student_id="test_student_01",
        topic="Python Recursion",
    )
    assert run_id.startswith("run_")

    tracer.record_node(run_id, "node_alpha", 15.2, "SUCCESS", "alpha node ok")
    tracer.record_tool(run_id, "mock_tool", 8.4, "SUCCESS", {"in": 1}, {"out": 2})
    tracer.record_decision(run_id, "PRACTICE", "MEDIUM", "Test decision")
    tracer.record_error(run_id, "Mock warning", "mock_tool", "Used fallback value")

    result = tracer.finish_run(run_id, final_result={"test": True}, status="SUCCESS")
    assert result["run_id"] == run_id
    assert result["status"] == "SUCCESS"

    # Verify files created on disk
    json_path = RUNTIME_DIR / f"{run_id}.json"
    log_path = TRACES_DIR / f"{run_id}.log"
    assert json_path.exists()
    assert log_path.exists()

    with open(log_path, "r", encoding="utf-8") as f:
        log_content = f.read()
    assert "RUN START:" in log_content
    assert "RUN COMPLETE:" in log_content
    assert "mock_tool" in log_content
    assert "PRACTICE" in log_content


def test_learning_agent_trace_generation():
    res = run_learning_adaptation_agent(
        student_id="cmtt5drap00021dekmkdu4xt4",
        topic="SQL JOIN",
        student_response="B",
    )
    assert res.success is True
    run_id = res.metadata.get("run_id")
    assert run_id is not None
    assert (RUNTIME_DIR / f"{run_id}.json").exists()
    assert (TRACES_DIR / f"{run_id}.log").exists()


def test_tutor_agent_trace_generation():
    res = run_tutor_agent(
        student_id="cmtt5drap00021dekmkdu4xt4",
        question="How does SQL INNER JOIN work?",
        topic="SQL JOIN",
    )
    assert res.success is True
    run_id = res.metadata.get("run_id")
    assert run_id is not None
    assert (RUNTIME_DIR / f"{run_id}.json").exists()
    assert (TRACES_DIR / f"{run_id}.log").exists()


def test_assessment_agent_trace_generation():
    res = run_assessment_agent(
        student_id="cmtt5drap00021dekmkdu4xt4",
        topic="SQL JOIN",
        student_response="INNER JOIN matches records where keys are equal in both tables.",
    )
    assert res.success is True
    run_id = res.metadata.get("run_id")
    assert run_id is not None
    assert (RUNTIME_DIR / f"{run_id}.json").exists()
    assert (TRACES_DIR / f"{run_id}.log").exists()


def test_coding_mentor_trace_generation():
    res = run_coding_mentor_agent(
        student_id="cmtt5drap00021dekmkdu4xt4",
        problem_description="Compute factorial of n using recursion.",
        topic="Python Recursion",
        student_code="def fact(n):\n    return 1 if n <= 1 else n * fact(n - 1)\nprint(fact(4))",
    )
    assert res.success is True
    run_id = res.metadata.get("run_id")
    assert run_id is not None
    assert (RUNTIME_DIR / f"{run_id}.json").exists()
    assert (TRACES_DIR / f"{run_id}.log").exists()


def test_evaluation_metrics_report():
    eval_report = run_full_system_evaluation()
    assert "learning_agent" in eval_report
    assert "assessment_agent" in eval_report
    assert "tutor_agent" in eval_report
    assert "system_telemetry" in eval_report

    assert eval_report["learning_agent"]["recommendation_accuracy_pct"] >= 80.0
    assert eval_report["assessment_agent"]["score_agreement_rate_pct"] >= 70.0
    assert eval_report["tutor_agent"]["curriculum_grounding_score"] >= 0.85
    assert eval_report["system_telemetry"]["system_failure_rate_pct"] == 0.0


def test_benchmark_sequential_vs_parallel():
    bench = run_benchmark(trials=2)
    assert "sequential" in bench
    assert "parallel" in bench
    assert "comparison" in bench
    assert "speedup_factor" in bench["comparison"]
    assert bench["sequential"]["average_ms"] >= 0.0
    assert bench["parallel"]["average_ms"] >= 0.0
