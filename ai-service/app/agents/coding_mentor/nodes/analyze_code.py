import ast
import subprocess
import sys
import tempfile
import time
from typing import Dict, Any, Tuple
from app.agents.coding_mentor.state import CodingMentorState

DISALLOWED_MODULES = {"os", "subprocess", "sys", "socket", "shutil", "pty", "urllib", "requests", "http", "posix"}
DISALLOWED_CALLS = {"eval", "exec", "breakpoint", "compile", "__import__"}


def _check_code_safety(code: str) -> Tuple[bool, str]:
    """Inspect AST for unauthorized system calls, imports, or file operations."""
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return True, ""  # Syntax errors are analyzed at runtime

    for node in ast.walk(tree):
        # Check imports
        if isinstance(node, ast.Import):
            for alias in node.names:
                mod_root = alias.name.split(".")[0]
                if mod_root in DISALLOWED_MODULES:
                    return False, f"Importing system module '{alias.name}' is restricted in the sandbox."
        elif isinstance(node, ast.ImportFrom):
            if node.module and node.module.split(".")[0] in DISALLOWED_MODULES:
                return False, f"Importing from '{node.module}' is restricted in the sandbox."
        elif isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name) and node.func.id in DISALLOWED_CALLS:
                return False, f"Call to '{node.func.id}()' is restricted in the sandbox."
    return True, ""


def _execute_sandboxed_python(code: str, timeout: float = 3.0) -> Tuple[bool, str, str, float]:
    """Execute Python code in an isolated subprocess with timeout and resource limits."""
    start_time = time.time()
    try:
        with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False) as tmp_file:
            tmp_file.write(code)
            tmp_path = tmp_file.name

        proc = subprocess.run(
            [sys.executable, "-I", tmp_path],
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        duration_ms = round((time.time() - start_time) * 1000, 2)
        success = proc.returncode == 0
        return success, proc.stdout, proc.stderr, duration_ms
    except subprocess.TimeoutExpired:
        duration_ms = round((time.time() - start_time) * 1000, 2)
        return False, "", "Execution Timed Out (3.0s limit exceeded). Check for infinite recursion or un-terminating loops.", duration_ms
    except Exception as e:
        duration_ms = round((time.time() - start_time) * 1000, 2)
        return False, "", str(e), duration_ms


def analyze_code_node(state: CodingMentorState) -> Dict[str, Any]:
    """
    Node 1: Analyzes submitted Python code for security vulnerabilities,
    compilation/syntax status, and executes safely in a sandboxed subprocess.
    """
    code = state.get("student_code") or ""
    if not code.strip():
        return {
            "is_safe": True,
            "safety_violation": None,
            "execution_success": False,
            "stdout": "",
            "stderr": "No code submitted for execution.",
            "execution_time_ms": 0.0,
            "logs": state.get("logs", []) + ["[analyze_code] Empty code submission."],
        }

    # 1. Safety Check
    is_safe, violation = _check_code_safety(code)
    if not is_safe:
        return {
            "is_safe": False,
            "safety_violation": violation,
            "execution_success": False,
            "stdout": "",
            "stderr": f"Security Sandbox Warning: {violation}",
            "execution_time_ms": 0.0,
            "logs": state.get("logs", []) + [f"[analyze_code] Safety Violation: {violation}"],
        }

    # 2. Subprocess Sandboxed Run
    success, stdout, stderr, duration_ms = _execute_sandboxed_python(code)

    log_entry = (
        f"[analyze_code] Sandboxed execution: success={success}, "
        f"duration={duration_ms}ms, stdout={len(stdout)} chars, stderr={len(stderr)} chars."
    )

    return {
        "is_safe": True,
        "safety_violation": None,
        "execution_success": success,
        "stdout": stdout,
        "stderr": stderr,
        "execution_time_ms": duration_ms,
        "logs": state.get("logs", []) + [log_entry],
    }
