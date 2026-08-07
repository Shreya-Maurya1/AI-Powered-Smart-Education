-- ============================================================
-- Migration 002: Seed Data
-- AdaptiveMind — Phase 1
-- Date: 2026-08-08
-- ============================================================
-- Inserts demo teacher, demo student, 2 courses, modules,
-- lessons, topics, and a sample assessment so the app
-- works out-of-the-box without manual data entry.
-- ============================================================

BEGIN;

-- ============================================================
-- DEMO TEACHER USER
-- Password: Teacher@123 (bcrypt hash, rounds=12)
-- ============================================================

INSERT INTO users (id, email, password_hash, name, role) VALUES
(
  'teacher-demo-001',
  'teacher@adaptivemind.dev',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj2YmEyKlVnK',
  'Dr. Priya Sharma',
  'TEACHER'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO teachers (id, user_id, department, qualification) VALUES
(
  'teacher-profile-001',
  'teacher-demo-001',
  'Computer Science',
  'Ph.D. Computer Science, IIT Delhi'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DEMO STUDENT USER
-- Password: Student@123 (bcrypt hash, rounds=12)
-- ============================================================

INSERT INTO users (id, email, password_hash, name, role) VALUES
(
  'student-demo-001',
  'student@adaptivemind.dev',
  '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/6.0FDiRqDvJVL0HYe',
  'Arjun Mehta',
  'STUDENT'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO students (id, user_id, grade, learning_style, xp_points, streak_days) VALUES
(
  'student-profile-001',
  'student-demo-001',
  '10',
  'visual',
  250,
  5
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- COURSES
-- ============================================================

INSERT INTO courses (id, title, description, subject_area, grade_level, teacher_id, is_published) VALUES
(
  'course-python-001',
  'Introduction to Python Programming',
  'Learn Python from scratch. Covers variables, loops, functions, OOP, and file handling. Perfect for Grade 10-12 students entering the world of programming.',
  'Computer Science',
  '10',
  'teacher-profile-001',
  TRUE
),
(
  'course-math-001',
  'Mathematics: Algebra & Calculus Fundamentals',
  'Master algebraic expressions, equations, functions, and an introduction to differential calculus. Aligned with NCERT Grade 11-12 curriculum.',
  'Mathematics',
  '11',
  'teacher-profile-001',
  TRUE
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- MODULES — Python Course
-- ============================================================

INSERT INTO modules (id, course_id, title, description, order_index) VALUES
('module-py-01', 'course-python-001', 'Getting Started with Python', 'Setup, syntax basics, and your first program', 1),
('module-py-02', 'course-python-001', 'Control Flow & Loops',        'if/else, for loops, while loops, break/continue', 2),
('module-py-03', 'course-python-001', 'Functions & Modules',         'Defining functions, scope, importing modules', 3)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- MODULES — Math Course
-- ============================================================

INSERT INTO modules (id, course_id, title, description, order_index) VALUES
('module-math-01', 'course-math-001', 'Algebraic Expressions',   'Polynomials, factorisation, algebraic identities', 1),
('module-math-02', 'course-math-001', 'Linear & Quadratic Eqs',  'Solving equations, graphing, word problems', 2),
('module-math-03', 'course-math-001', 'Introduction to Calculus','Limits, derivatives, and their applications', 3)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- LESSONS — Python Module 1
-- ============================================================

INSERT INTO lessons (id, module_id, title, content, content_type, duration_minutes, order_index) VALUES
(
  'lesson-py-01-01',
  'module-py-01',
  'What is Python?',
  '<h2>What is Python?</h2>
<p>Python is a high-level, interpreted programming language known for its clear syntax and readability. Created by <strong>Guido van Rossum</strong> in 1991, Python has become one of the most popular programming languages worldwide.</p>
<h3>Why Learn Python?</h3>
<ul>
  <li>Simple and readable syntax — great for beginners</li>
  <li>Versatile: used in web development, data science, AI, automation</li>
  <li>Huge community and extensive libraries</li>
  <li>High demand in the job market</li>
</ul>
<h3>Your First Python Program</h3>
<pre><code>print("Hello, World!")</code></pre>
<p>Run this, and you will see <code>Hello, World!</code> printed on the screen. Congratulations — you are a programmer!</p>',
  'TEXT',
  15,
  1
),
(
  'lesson-py-01-02',
  'module-py-01',
  'Variables and Data Types',
  '<h2>Variables and Data Types</h2>
<p>Variables are containers for storing data values. In Python, you do not need to declare the type — Python figures it out automatically.</p>
<h3>Basic Data Types</h3>
<pre><code>
name = "Alice"          # str (string)
age = 17                # int (integer)
gpa = 9.5               # float (decimal)
is_student = True       # bool (boolean)
</code></pre>
<h3>Checking Data Types</h3>
<pre><code>
print(type(name))       # &lt;class str&gt;
print(type(age))        # &lt;class int&gt;
</code></pre>
<h3>String Operations</h3>
<pre><code>
first_name = "Arjun"
last_name = "Mehta"
full_name = first_name + " " + last_name
print(full_name)        # Arjun Mehta
print(len(full_name))   # 11
</code></pre>',
  'TEXT',
  20,
  2
),
(
  'lesson-py-01-03',
  'module-py-01',
  'Input and Output',
  '<h2>Input and Output in Python</h2>
<p>Interacting with users is fundamental to any program. Python makes it simple with <code>print()</code> and <code>input()</code>.</p>
<h3>The print() Function</h3>
<pre><code>
print("Hello!")                    # Basic output
print("Name:", "Alice", "Age:", 17) # Multiple values
print(f"My name is {name}")        # f-string (modern Python)
</code></pre>
<h3>The input() Function</h3>
<pre><code>
name = input("Enter your name: ")
age = int(input("Enter your age: "))  # Convert to integer
print(f"Hello {name}, you are {age} years old!")
</code></pre>',
  'TEXT',
  15,
  3
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- LESSONS — Python Module 2
-- ============================================================

INSERT INTO lessons (id, module_id, title, content, content_type, duration_minutes, order_index) VALUES
(
  'lesson-py-02-01',
  'module-py-02',
  'Conditional Statements (if/elif/else)',
  '<h2>Conditional Statements</h2>
<p>Conditional statements let your program make decisions based on conditions.</p>
<pre><code>
score = 85

if score >= 90:
    print("Grade: A")
elif score >= 80:
    print("Grade: B")
elif score >= 70:
    print("Grade: C")
else:
    print("Grade: F")
</code></pre>
<p>Python uses <strong>indentation</strong> (spaces) to define code blocks — no curly braces needed!</p>',
  'TEXT',
  20,
  1
),
(
  'lesson-py-02-02',
  'module-py-02',
  'For Loops',
  '<h2>For Loops</h2>
<p>For loops repeat a block of code a specific number of times, or for each item in a sequence.</p>
<pre><code>
# Loop over a range
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

# Loop over a list
fruits = ["apple", "banana", "mango"]
for fruit in fruits:
    print(f"I like {fruit}")

# Loop with index
for i, fruit in enumerate(fruits):
    print(f"{i+1}. {fruit}")
</code></pre>',
  'TEXT',
  25,
  2
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TOPICS — for lesson-py-01-01
-- ============================================================

INSERT INTO topics (id, lesson_id, title, summary, key_points, order_index) VALUES
(
  'topic-py-01-01-a',
  'lesson-py-01-01',
  'History of Python',
  'Python was created by Guido van Rossum and released in 1991.',
  '["Created by Guido van Rossum in 1991", "Named after Monty Python comedy group", "Open source and community driven", "Python 3.x is the current major version"]',
  1
),
(
  'topic-py-01-01-b',
  'lesson-py-01-01',
  'Python Use Cases',
  'Python is used in web development, data science, AI, scripting, and more.',
  '["Web: Django, Flask, FastAPI", "Data Science: NumPy, Pandas, Matplotlib", "AI/ML: TensorFlow, PyTorch, scikit-learn", "Scripting and automation", "Game development"]',
  2
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ASSESSMENT — Python Module 1 Quiz
-- ============================================================

INSERT INTO assessments (id, course_id, lesson_id, title, type, total_marks, passing_marks, time_limit_minutes) VALUES
(
  'assessment-py-quiz-01',
  'course-python-001',
  'lesson-py-01-02',
  'Python Basics Quiz',
  'QUIZ',
  10,
  6,
  15
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- QUESTIONS
-- ============================================================

INSERT INTO questions (id, assessment_id, question_text, question_type, options, correct_answer, points, order_index) VALUES
(
  'q-py-01',
  'assessment-py-quiz-01',
  'Which keyword is used to define a variable in Python?',
  'MCQ',
  '["var", "let", "No keyword needed", "define"]',
  'No keyword needed',
  2,
  1
),
(
  'q-py-02',
  'assessment-py-quiz-01',
  'What is the output of: print(type(3.14))?',
  'MCQ',
  '["<class int>", "<class float>", "<class str>", "<class double>"]',
  '<class float>',
  2,
  2
),
(
  'q-py-03',
  'assessment-py-quiz-01',
  'Python uses indentation to define code blocks.',
  'TRUE_FALSE',
  '["True", "False"]',
  'True',
  2,
  3
),
(
  'q-py-04',
  'assessment-py-quiz-01',
  'Which function is used to accept input from the user?',
  'MCQ',
  '["read()", "scan()", "input()", "get()"]',
  'input()',
  2,
  4
),
(
  'q-py-05',
  'assessment-py-quiz-01',
  'What will print(len("Hello")) output?',
  'MCQ',
  '["4", "5", "6", "Error"]',
  '5',
  2,
  5
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- ENROLL DEMO STUDENT IN PYTHON COURSE
-- ============================================================

INSERT INTO student_courses (id, student_id, course_id, progress_percent) VALUES
('enrollment-demo-001', 'student-profile-001', 'course-python-001', 20)
ON CONFLICT (student_id, course_id) DO NOTHING;

-- ============================================================
-- DEMO LEARNING EVENTS
-- ============================================================

INSERT INTO learning_events (id, student_id, lesson_id, event_type, metadata) VALUES
(
  'event-demo-001',
  'student-profile-001',
  'lesson-py-01-01',
  'LESSON_START',
  '{"device": "desktop", "browser": "chrome"}'
),
(
  'event-demo-002',
  'student-profile-001',
  'lesson-py-01-01',
  'LESSON_COMPLETE',
  '{"time_spent_seconds": 890}'
)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ============================================================
-- Demo Credentials:
-- Teacher: teacher@adaptivemind.dev / Teacher@123
-- Student: student@adaptivemind.dev / Student@123
-- Note: bcrypt hashes above need to be regenerated because
-- the hardcoded hashes are placeholders — use the /api/auth/register
-- endpoint to create real users in development.
-- ============================================================
