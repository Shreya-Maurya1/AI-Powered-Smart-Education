import time
import sys
from pathlib import Path

# Ensure root ai-service is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

import concurrent.futures
from typing import Dict, Any
from app.tools.backend_tools import (
    get_student_mastery,
    get_learning_history,
    get_topic_prerequisites,
    retrieve_memory,
)


def run_sequential_load_context(student_id: str, topic: str) -> Dict[str, Any]:
    """Execute all context loaders sequentially (blocking one after another)."""
    t0 = time.monotonic()

    # Tool 1: Mastery
    mastery = get_student_mastery.invoke({"student_id": student_id})

    # Tool 2: Memory
    memory = retrieve_memory.invoke({"student_id": student_id, "query": topic})

    # Tool 3: History
    history = get_learning_history.invoke({"student_id": student_id})

    # Tool 4: Topic Prerequisites
    prereqs = get_topic_prerequisites.invoke({"topic": topic})

    duration_ms = round((time.monotonic() - t0) * 1000, 2)
    return {
        "duration_ms": duration_ms,
        "mastery_count": len(mastery) if isinstance(mastery, (list, dict)) else 1,
        "memory_count": len(memory) if isinstance(memory, list) else 0,
        "history_count": len(history) if isinstance(history, list) else 0,
        "prereqs_count": len(prereqs) if isinstance(prereqs, list) else 0,
    }


def run_parallel_load_context(student_id: str, topic: str) -> Dict[str, Any]:
    """Execute all context loaders concurrently in parallel worker threads."""
    t0 = time.monotonic()

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        f_mastery = executor.submit(
            get_student_mastery.invoke, {"student_id": student_id}
        )
        f_memory = executor.submit(
            retrieve_memory.invoke, {"student_id": student_id, "query": topic}
        )
        f_history = executor.submit(
            get_learning_history.invoke, {"student_id": student_id}
        )
        f_prereqs = executor.submit(
            get_topic_prerequisites.invoke, {"topic": topic}
        )

        mastery = f_mastery.result()
        memory = f_memory.result()
        history = f_history.result()
        prereqs = f_prereqs.result()

    duration_ms = round((time.monotonic() - t0) * 1000, 2)
    return {
        "duration_ms": duration_ms,
        "mastery_count": len(mastery) if isinstance(mastery, (list, dict)) else 1,
        "memory_count": len(memory) if isinstance(memory, list) else 0,
        "history_count": len(history) if isinstance(history, list) else 0,
        "prereqs_count": len(prereqs) if isinstance(prereqs, list) else 0,
    }


def run_benchmark(
    student_id: str = "cmtt5drap00021dekmkdu4xt4",
    topic: str = "Python Recursion",
    trials: int = 3,
) -> Dict[str, Any]:
    """
    Executes load_context in both Sequential and Parallel modes across multiple trials.
    Returns comparative timings, speedup ratio, and latency reduction percentage.
    """
    seq_times = []
    par_times = []

    for _ in range(trials):
        s_res = run_sequential_load_context(student_id, topic)
        seq_times.append(s_res["duration_ms"])

        p_res = run_parallel_load_context(student_id, topic)
        par_times.append(p_res["duration_ms"])

    avg_seq = round(sum(seq_times) / len(seq_times), 2)
    avg_par = round(sum(par_times) / len(par_times), 2)

    # Ensure a non-zero denominator
    speedup = round(avg_seq / max(0.1, avg_par), 2) if avg_par > 0 else 1.0
    latency_reduction = round(((avg_seq - avg_par) / max(0.1, avg_seq)) * 100, 1)

    return {
        "student_id": student_id,
        "topic": topic,
        "trials": trials,
        "sequential": {
            "average_ms": avg_seq,
            "trials_ms": seq_times,
            "execution_mode": "Blocking Linear Chain",
        },
        "parallel": {
            "average_ms": avg_par,
            "trials_ms": par_times,
            "execution_mode": "ThreadPool Concurrent Fan-out",
        },
        "comparison": {
            "speedup_factor": f"{speedup}x faster",
            "latency_reduction_pct": f"{latency_reduction}%",
            "time_saved_ms": round(avg_seq - avg_par, 2),
        },
        "conclusion": f"Parallel execution is {speedup}x faster ({avg_par}ms vs {avg_seq}ms), reducing context loading latency by {latency_reduction}%.",
    }


if __name__ == "__main__":
    import json
    results = run_benchmark()
    print(json.dumps(results, indent=2))
