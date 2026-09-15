# AdaptiveMind — SIH Live Demonstration Script
> **Problem Statement 19**: AI-Powered Adaptive Smart Education Platform  
> **Target Audience**: SIH Jury, Evaluators & Technical Reviewers  
> **Presentation Duration**: 8–10 minutes  

---

## 🧭 Overview & Core Narrative

AdaptiveMind solves the one-size-fits-all education dilemma. Unlike static LMS platforms or disconnected chatbot wrappers, AdaptiveMind features an autonomous **Learning Adaptation Agent** that:
1. Concurrently tracks granular topic-level mastery.
2. Identifies conceptual stumbling blocks through a 3-Tier Shared Memory architecture.
3. Automatically prescribes targeted pedagogical interventions (Socratic explanation, scaffolded practice, sandbox coding, or advancement).
4. Maintains full execution observability with JSON runtime logs and plain-text trace audits.

---

## 🎬 The 10-Step Continuous Demo Journey

### Step 1: Student Log In & Active Learning Goal
* **URL**: `http://localhost:3000/login`
* **Action**: Click the quick-fill button **"Shreya (Student)"** (`6093shreya@gmail.com` / `Student@123`), then click **Sign In**.
* **What to Show**:
  - The Student Dashboard displays the active goal banner: **"Master SQL JOINs & Advanced Relational Queries (Target ≥ 85%)"**.
  - Current baseline mastery for SQL JOIN is displayed at **65%**, while Python Recursion is at **43%** with a red prerequisite indicator.
* **What to Say**:
  > *"When the student logs in, AdaptiveMind immediately contextualizes their learning state. Rather than presenting generic courses, it highlights their active goal and pinpoints exactly where knowledge gaps exist using our deterministic mastery calculation."*

---

### Step 2: Learning Agent Analyzes State (Parallel Fan-Out)
* **URL**: `http://localhost:3000/learning?topic=SQL%20JOIN`
* **Action**: Navigate to **Learning** in the sidebar and select **SQL JOIN** from the dropdown.
* **What to Show**:
  - The Learning Adaptation Agent initiates its cycle.
  - The UI displays: *"Parallel fan-in complete. Initial mastery for 'SQL JOIN': 65%."*
* **What to Say**:
  > *"Behind the scenes, the Learning Agent executes four tools in parallel using thread-safe concurrent fan-out: student mastery, past learning events, prerequisite satisfaction, and episodic memory. As our benchmarks demonstrate, parallel fan-out reduces context loading latency by 89% (from 71ms down to 7.9ms)."*

---

### Step 3: Agent Prescribes Targeted PRACTICE
* **Action**: Observe the generated action card on the Learning page.
* **What to Show**:
  - **Decision Policy**: `Action: PRACTICE`, `Difficulty: MEDIUM`.
  - **Reason**: *"Detected baseline competence in SQL Basics with opportunities to strengthen complex JOIN semantics. Prescribing targeted multi-table query practice."*
  - **Question Displayed**: An interactive question exploring SQL query results with `INNER JOIN` vs `LEFT JOIN`.
* **What to Say**:
  > *"Our heuristic decision matrix evaluates whether the student needs foundational review, targeted practice, Socratic explanation, or higher-order advancement. Because the student's mastery is at 65% with prerequisites met, the agent automatically prescribes targeted practice."*

---

### Step 4: Student Submits Answer
* **Action**: Select an answer option (e.g. Option **B**) and click **Submit Answer**.
* **What to Show**:
  - Button switches to a loading spinner while the response is routed through `/api/ai/learning` to the AI service.

---

### Step 5: Assessment Agent Evaluates Submission
* **What to Show**:
  - The Assessment Agent evaluates the submission.
  - Result Banner: **Correct! Option B is the exact answer.**
  - **Rubric Breakdown**:
    - Accuracy: 100%
    - Completeness: 100%
    - Reasoning: 100%
    - Clarity: 100%
* **What to Say**:
  > *"For objective queries, our Assessment Agent applies deterministic key verification. For written subjective explanations, it applies a 4-criterion pedagogical rubric: Accuracy 40%, Completeness 25%, Reasoning 25%, and Clarity 10%, giving immediate transparent feedback."*

---

### Step 6: Deterministic Mastery Update (65% → 78%)
* **What to Show**:
  - The Knowledge Change Signal is displayed: **Δ = +0.13 (+13%)**.
  - The mastery meter dynamically climbs to **78%**.
* **What to Say**:
  > *"Our deterministic mastery formula computes the update instantly: previous mastery plus performance adjustment with diminishing returns as scores approach 1.0, minus repeated mistake penalties. No hallucinations, no arbitrary grading."*

---

### Step 7: Shared Memory Stores Pedagogical Trace
* **Action**: Click **Show Agent Session Logs & Traces** at the bottom of the card.
* **What to Show**:
  - Log entry: `[save_memory] Recorded EPISODIC memory: 'Student successfully matched INNER JOIN keys but noted uncertainty on LEFT JOIN null-padding.'`
  - Run ID: `run_20260914_...`
* **What to Say**:
  > *"Notice that our shared 3-tier memory system doesn't log useless chit-chat. Its `is_memory_useful` gating filter extracts the exact pedagogical signal: the student understands inner joins, but has lingering uncertainty about how LEFT JOIN handles null values."*

---

### Step 8: Socratic Tutor Provides Grounded Guidance with Citations
* **URL**: `http://localhost:3000/tutor`
* **Action**:
  1. Click **AI Tutor** in the sidebar.
  2. Notice the top banner: **🧠 Active Memory: Student noted uncertainty on LEFT JOIN null-padding**.
  3. Click the starter prompt: *"How does SQL LEFT JOIN handle unmatched rows?"*
* **What to Show**:
  - Socratic Tutor answers with an intuitive analogy without spoon-feeding:
    > *"Think of a guest list (left table) and attendees who checked in (right table)..."*
  - Grounding confidence score: **94.2%**.
  - Click **View Sources**: Slide-out drawer reveals the exact curriculum document chunk from PostgreSQL pgvector (*"Relational Database Principles: Section 4.2"*).
* **What to Say**:
  > *"Here is the Socratic Tutor Agent in action. Notice two critical innovations: first, it is memory-aware—it knows about the student's specific struggle from two minutes ago. Second, it is strictly grounded in our pgvector curriculum index, providing verifiable citations with zero hallucinations."*

---

### Step 9: Agent Re-Plans & Recommends Advanced Step
* **URL**: `http://localhost:3000/coding`
* **Action**: Navigate to **Code Lab** in the sidebar.
* **What to Show**:
  - Select the **Factorial (Recursion)** challenge.
  - Show the safe execution terminal.
  - Deliberately run incomplete code without a base case:
    ```python
    def fact(n):
        return n * fact(n - 1)
    print(fact(5))
    ```
  - Click **Run Code**.
  - Within 2 seconds, the AST Sandbox safely terminates the execution before recursion depth crashes the server, and the AI Mentor card displays:
    > *"Notice how `fact(n - 1)` decrements continuously. What stops the call stack when n reaches 1?"*
* **What to Say**:
  > *"Our Safe Coding Mentor parses Python Abstract Syntax Trees before execution, rejecting harmful system modules like `os` or `subprocess`, and wrapping execution in an isolated subshell with a 5-second timeout to prevent infinite recursion crashes."*

---

### Step 10: Teacher Analytics Displays Mastery Improvement Curve
* **URL**: `http://localhost:3000/teacher/analytics`
* **Action**: Click **Teacher Demo** quick login or navigate to `/teacher/analytics`.
* **What to Show**:
  - **Student Mastery-Over-Time Progression**: The interactive SVG chart tracks the full student journey from **43% (Baseline)** → **61% (Practice)** → **78% (Tutor)** → **88% (Goal Reached)**.
  - **Sequential vs. Parallel Execution Benchmark Card**: Shows live timing comparison (**71.1ms** sequential vs **7.9ms** parallel, a **9.0x speedup**).
  - Class Weak Area Clusters table automatically updating.
* **What to Say**:
  > *"Finally, teachers have complete visibility. The Teacher Dashboard doesn't just show snapshot grades—it visualizes the longitudinal improvement trajectory resulting from the agent's interventions. Furthermore, administrators can verify system health and latency benchmarks in real time."*

---

## 🛠️ Verification Checklist for Presenters

| Step | Component Verified | Expected Response / Indicator | Status |
|---|---|---|---|
| **1** | Student Login | Dashboard loads with user name & active goal banner | [ ] |
| **2** | Parallel Fan-out | `load_context` gathers 4 tools concurrently | [ ] |
| **3** | Decision Engine | Prescribes `PRACTICE (Medium)` with clear reason | [ ] |
| **4** | Assessment | Deterministic & rubric evaluation returns scores | [ ] |
| **5** | Mastery Update | Local & persistent score updates (e.g. +13%) | [ ] |
| **6** | Shared Memory | Episodic trace saved under `student_memories` | [ ] |
| **7** | Socratic Tutor | Grounded response with citations drawer & memory badge | [ ] |
| **8** | Coding Mentor | AST sandbox blocks infinite recursion and offers hint | [ ] |
| **9** | Teacher Chart | Mastery progression SVG curve renders milestones | [ ] |
| **10**| Traces Audit | `ai-service/debugging/traces/run_*.log` recorded | [ ] |

---

*Built for Smart India Hackathon — SIH Problem Statement 19*
