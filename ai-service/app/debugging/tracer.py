import os
import json
import time
import uuid
import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional

# Locate the root debugging output directory: ai-service/debugging/
BASE_DEBUG_DIR = Path(__file__).resolve().parent.parent.parent / "debugging"
RUNTIME_DIR = BASE_DEBUG_DIR / "runtime"
TRACES_DIR = BASE_DEBUG_DIR / "traces"

RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
TRACES_DIR.mkdir(parents=True, exist_ok=True)


def generate_run_id() -> str:
    """Generate standardized run ID: run_YYYYMMDD_HHMMSS_<4hex>"""
    ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d_%H%M%S")
    rand_suffix = uuid.uuid4().hex[:4]
    return f"run_{ts}_{rand_suffix}"


class ExecutionTracer:
    """
    Records end-to-end execution traces, node transitions, tool invocations,
    decisions, and error recovery events for all AdaptiveMind agents.
    Persists dual artifacts:
      1. Structured JSON in runtime/run_<id>.json
      2. Human-readable plain text log in traces/run_<id>.log
    """

    def __init__(self):
        self._active_runs: Dict[str, Dict[str, Any]] = {}

    def start_run(
        self,
        agent: str,
        objective: str,
        student_id: str,
        topic: str = "General",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        run_id = generate_run_id()
        start_ts = datetime.datetime.now(datetime.timezone.utc)
        self._active_runs[run_id] = {
            "run_id": run_id,
            "agent": agent,
            "objective": objective,
            "student_id": student_id,
            "topic": topic,
            "started_at": start_ts.isoformat(),
            "start_time_monotonic": time.monotonic(),
            "metadata": metadata or {},
            "nodes_executed": [],
            "tools_called": [],
            "decisions": [],
            "errors": [],
            "final_result": None,
            "status": "RUNNING",
        }
        return run_id

    def record_node(
        self,
        run_id: str,
        node: str,
        duration_ms: float,
        status: str = "SUCCESS",
        details: str = "",
    ):
        if run_id not in self._active_runs:
            return
        self._active_runs[run_id]["nodes_executed"].append({
            "node": node,
            "duration_ms": round(duration_ms, 2),
            "status": status,
            "details": details,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        })

    def record_tool(
        self,
        run_id: str,
        tool: str,
        duration_ms: float,
        status: str = "SUCCESS",
        input_summary: Any = None,
        output_summary: Any = None,
    ):
        if run_id not in self._active_runs:
            return
        self._active_runs[run_id]["tools_called"].append({
            "tool": tool,
            "duration_ms": round(duration_ms, 2),
            "status": status,
            "input_summary": input_summary,
            "output_summary": output_summary,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        })

    def record_decision(
        self,
        run_id: str,
        action: str,
        difficulty: str = "MEDIUM",
        reason: str = "",
        details: Optional[Dict[str, Any]] = None,
    ):
        if run_id not in self._active_runs:
            return
        self._active_runs[run_id]["decisions"].append({
            "action": action,
            "difficulty": difficulty,
            "reason": reason,
            "details": details or {},
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        })

    def record_error(
        self,
        run_id: str,
        error: str,
        node_or_tool: str = "",
        recovery_strategy: str = "",
    ):
        if run_id not in self._active_runs:
            return
        self._active_runs[run_id]["errors"].append({
            "error": str(error),
            "node_or_tool": node_or_tool,
            "recovery_strategy": recovery_strategy,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        })

    def finish_run(
        self,
        run_id: str,
        final_result: Any = None,
        status: str = "SUCCESS",
    ) -> Dict[str, Any]:
        if run_id not in self._active_runs:
            return {}

        run_data = self._active_runs.pop(run_id)
        finish_ts = datetime.datetime.now(datetime.timezone.utc)
        total_duration_ms = round(
            (time.monotonic() - run_data.pop("start_time_monotonic", time.monotonic())) * 1000,
            2,
        )

        run_data["finished_at"] = finish_ts.isoformat()
        run_data["total_duration_ms"] = total_duration_ms
        run_data["status"] = status
        run_data["final_result"] = final_result

        # 1. Write runtime JSON
        json_path = RUNTIME_DIR / f"{run_id}.json"
        try:
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(run_data, f, indent=2, default=str)
        except Exception as e:
            print(f"Warning: Could not write runtime trace {json_path}: {e}")

        # 2. Write human-readable trace log
        log_path = TRACES_DIR / f"{run_id}.log"
        try:
            log_content = self._render_plain_text_trace(run_data)
            with open(log_path, "w", encoding="utf-8") as f:
                f.write(log_content)
        except Exception as e:
            print(f"Warning: Could not write text trace {log_path}: {e}")

        return run_data

    def _render_plain_text_trace(self, data: Dict[str, Any]) -> str:
        lines = [
            "=" * 80,
            f"RUN START: {data['run_id']}",
            f"Agent: {data['agent']}",
            f"Student: {data['student_id']}",
            f"Topic: {data.get('topic', 'N/A')}",
            f"Objective: {data['objective']}",
            f"Timestamp: {data['started_at']}",
            "-" * 80,
        ]

        # Combine nodes and tools chronologically if possible, or print sections
        lines.append("--- EXECUTED NODES & TIMINGS ---")
        if data["nodes_executed"]:
            for n in data["nodes_executed"]:
                dur = n.get("duration_ms", 0.0)
                stat = n.get("status", "SUCCESS")
                det = f" - {n['details']}" if n.get("details") else ""
                lines.append(f"[NODE] {n['node']} completed in {dur}ms (status={stat}){det}")
        else:
            lines.append("No isolated node records logged.")

        lines.append("\n--- TOOLS CALLED ---")
        if data["tools_called"]:
            for t in data["tools_called"]:
                lines.append(
                    f"[TOOL] {t['tool']} (status={t['status']}, duration={t['duration_ms']}ms)"
                )
                if t.get("output_summary"):
                    lines.append(f"       Summary: {t['output_summary']}")
        else:
            lines.append("None called.")

        if data["decisions"]:
            lines.append("\n--- DECISIONS ---")
            for d in data["decisions"]:
                lines.append(
                    f"[DECISION] Action={d['action']}, Difficulty={d['difficulty']}"
                )
                if d.get("reason"):
                    lines.append(f"           Reason: {d['reason']}")

        if data["errors"]:
            lines.append("\n--- ERRORS & RECOVERY ---")
            for err in data["errors"]:
                lines.append(
                    f"[ERROR] In {err.get('node_or_tool')}: {err['error']}"
                )
                if err.get("recovery_strategy"):
                    lines.append(f"        Recovery: {err['recovery_strategy']}")

        lines.extend([
            "-" * 80,
            f"FINAL RESULT: {data['status']}",
            f"Total Duration: {data.get('total_duration_ms', 0)}ms",
            f"Nodes Executed: {len(data['nodes_executed'])}",
            f"Tools Called: {len(data['tools_called'])}",
            f"Errors: {len(data['errors'])}",
            f"RUN COMPLETE: {data['run_id']}",
            "=" * 80,
        ])
        return "\n".join(lines) + "\n"

    def list_runs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """List the most recent execution run summaries from disk."""
        runs = []
        try:
            files = sorted(
                RUNTIME_DIR.glob("run_*.json"),
                key=lambda p: p.stat().st_mtime,
                reverse=True,
            )
            for f in files[:limit]:
                try:
                    with open(f, "r", encoding="utf-8") as fp:
                        data = json.load(fp)
                        runs.append({
                            "run_id": data.get("run_id"),
                            "agent": data.get("agent"),
                            "student_id": data.get("student_id"),
                            "topic": data.get("topic"),
                            "status": data.get("status"),
                            "total_duration_ms": data.get("total_duration_ms"),
                            "started_at": data.get("started_at"),
                            "nodes_count": len(data.get("nodes_executed", [])),
                            "tools_count": len(data.get("tools_called", [])),
                            "errors_count": len(data.get("errors", [])),
                        })
                except Exception:
                    continue
        except Exception as e:
            print(f"Error listing runs: {e}")
        return runs

    def get_run_details(self, run_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve full runtime record and trace log for a given run ID."""
        json_path = RUNTIME_DIR / f"{run_id}.json"
        log_path = TRACES_DIR / f"{run_id}.log"
        if not json_path.exists():
            return None
        try:
            with open(json_path, "r", encoding="utf-8") as fp:
                data = json.load(fp)
            log_text = ""
            if log_path.exists():
                with open(log_path, "r", encoding="utf-8") as fp:
                    log_text = fp.read()
            data["trace_log"] = log_text
            return data
        except Exception as e:
            return {"error": str(e)}


tracer = ExecutionTracer()
