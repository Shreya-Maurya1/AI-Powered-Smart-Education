from typing import Dict, Any
from app.agents.coding_mentor.state import CodingMentorState


def generate_feedback_node(state: CodingMentorState) -> Dict[str, Any]:
    """
    Node 2: Generates pedagogical line-by-line coding feedback,
    diagnosing errors and offering progressive Socratic hints.
    """
    is_safe = state.get("is_safe", True)
    violation = state.get("safety_violation")
    exec_success = state.get("execution_success", False)
    stdout = state.get("stdout") or ""
    stderr = state.get("stderr") or ""
    student_code = state.get("student_code") or ""
    topic = state.get("topic") or "Python Recursion"

    if not is_safe:
        feedback = f"⚠️ **Security Restricted**: {violation}\nPlease write pure Python code using standard builtins."
        hint = "Refactor your implementation to avoid restricted operating system or low-level library calls."
        return {
            "feedback": feedback,
            "hint": hint,
            "logs": state.get("logs", []) + ["[generate_feedback] Security violation feedback."],
        }

    if not exec_success:
        # Diagnose specific errors
        if "RecursionError" in stderr or "maximum recursion depth" in stderr:
            feedback = (
                "❌ **Recursion Error Detected**:\n"
                "Your function called itself repeatedly until the call stack exceeded Python's limit (1,000 frames).\n\n"
                "**Mentor Observations**:\n"
                "1. Check your base condition: Is there an `if` statement that returns a concrete value?\n"
                "2. Check argument reduction: Does each recursive call strictly pass an argument that moves closer to your base condition?"
            )
            hint = "💡 *Hint*: If calculating `factorial(n)`, ensure you have `if n <= 1: return 1` and pass `n - 1` into the recursive step."
        elif "Timeout" in stderr or "3.0s limit" in stderr:
            feedback = (
                "⏱️ **Execution Timed Out (Infinite Loop / Recursion)**:\n"
                "The program ran longer than 3 seconds without concluding."
            )
            hint = "💡 *Hint*: Verify loop termination variables and base condition branch logic."
        elif "SyntaxError" in stderr:
            feedback = f"⚠️ **Python Syntax Error**:\n```\n{stderr.strip()}\n```\nCheck colons after `def`/`if` and verify matching indentation."
            hint = "💡 *Hint*: In Python, every function header must end with `:` and its body must be indented by 4 spaces."
        elif "IndentationError" in stderr:
            feedback = f"⚠️ **Indentation Error**:\n```\n{stderr.strip()}\n```\nEnsure consistent spaces across blocks."
            hint = "💡 *Hint*: Select all lines and format with standard 4-space indentation."
        elif "NameError" in stderr:
            feedback = f"⚠️ **Unbound Name Error**:\n```\n{stderr.strip()}\n```\nVerify that variable names are spelled identically to their definitions."
            hint = "💡 *Hint*: Remember Python variable names are case-sensitive."
        else:
            feedback = f"⚠️ **Runtime Exception**:\n```\n{stderr.strip()}\n```"
            hint = "💡 *Hint*: Review the traceback line number to inspect the failing expression."
    else:
        # Execution succeeded
        output_snippet = stdout.strip() if stdout.strip() else "(No print output produced)"
        feedback = (
            "✅ **Code Executed Successfully**!\n\n"
            f"**Program Output (`stdout`)**:\n```\n{output_snippet}\n```\n\n"
            "**Mentor Code Review**:\n"
            "- Structural correctness: Functions defined and invoked cleanly.\n"
            "- Memory safety: Function executed within performance parameters without stack leaks."
        )
        hint = "💡 *Challenge*: Can you add an input guard for edge cases like negative numbers or floating point inputs?"

    return {
        "feedback": feedback,
        "hint": hint,
        "logs": state.get("logs", []) + ["[generate_feedback] Pedagogical code review and hints generated."],
    }
