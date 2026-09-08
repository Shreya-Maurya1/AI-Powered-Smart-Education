-- ============================================================
-- Migration 002: Seed Data
-- AdaptiveMind — Phase 1 & 2
-- Date: 2026-09-09
-- ============================================================
-- Inserts demo teacher, demo student, courses, modules,
-- lessons, topics, assessments, questions with topic tags,
-- student mastery data, topic dependencies, and learning events.
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
  350,
  7
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
  '<h2>What is Python?</h2><p>Python is a high-level, interpreted programming language known for clear syntax and readability.</p>',
  'TEXT',
  15,
  1
),
(
  'lesson-py-01-02',
  'module-py-01',
  'Variables and Data Types',
  '<h2>Variables and Data Types</h2><p>Variables store data values in memory. Python infers types dynamically.</p>',
  'TEXT',
  20,
  2
),
(
  'lesson-py-01-03',
  'module-py-01',
  'Input and Output',
  '<h2>Input and Output in Python</h2><p>Python makes input and output straightforward using print() and input().</p>',
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
  '<h2>Conditional Statements</h2><p>Conditional statements control execution paths based on boolean evaluations.</p>',
  'TEXT',
  20,
  1
),
(
  'lesson-py-02-02',
  'module-py-02',
  'For Loops',
  '<h2>For Loops</h2><p>Iterate over items of sequence like lists or string ranges.</p>',
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
  '["Created by Guido van Rossum in 1991", "Named after Monty Python", "Open source and community driven"]',
  1
),
(
  'topic-py-01-01-b',
  'lesson-py-01-01',
  'Python Use Cases',
  'Python is used in web development, data science, AI, scripting, and more.',
  '["Web: Django, FastAPI", "Data Science: Pandas, NumPy", "AI: PyTorch, TensorFlow"]',
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
-- QUESTIONS (With topic tags)
-- ============================================================

INSERT INTO questions (id, assessment_id, question_text, question_type, options, correct_answer, points, order_index, topic) VALUES
(
  'q-py-01',
  'assessment-py-quiz-01',
  'Which keyword is used to define a variable in Python?',
  'MCQ',
  '["var", "let", "No keyword needed", "define"]',
  'No keyword needed',
  2,
  1,
  'Python Variables'
),
(
  'q-py-02',
  'assessment-py-quiz-01',
  'What is the output of: print(type(3.14))?',
  'MCQ',
  '["<class int>", "<class float>", "<class str>", "<class double>"]',
  '<class float>',
  2,
  2,
  'Python Data Types'
),
(
  'q-py-03',
  'assessment-py-quiz-01',
  'Python uses indentation to define code blocks.',
  'TRUE_FALSE',
  '["True", "False"]',
  'True',
  2,
  3,
  'Control Flow'
),
(
  'q-py-04',
  'assessment-py-quiz-01',
  'Which function is used to accept input from the user?',
  'MCQ',
  '["read()", "scan()", "input()", "get()"]',
  'input()',
  2,
  4,
  'Input and Output'
),
(
  'q-py-05',
  'assessment-py-quiz-01',
  'What will print(len("Hello")) output?',
  'MCQ',
  '["4", "5", "6", "Error"]',
  '5',
  2,
  5,
  'Python Variables'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STUDENT MASTERY (PHASE 2)
-- ============================================================

INSERT INTO student_mastery (id, student_id, topic, mastery_score, updated_at) VALUES
('sm-01', 'student-profile-001', 'Python Variables',     0.95, NOW()),
('sm-02', 'student-profile-001', 'Python Functions',     0.82, NOW()),
('sm-03', 'student-profile-001', 'Control Flow',         0.75, NOW()),
('sm-04', 'student-profile-001', 'SQL JOIN',             0.61, NOW()),
('sm-05', 'student-profile-001', 'Calculus Derivatives', 0.50, NOW()),
('sm-06', 'student-profile-001', 'Python Recursion',    0.43, NOW())
ON CONFLICT (student_id, topic) DO UPDATE SET mastery_score = EXCLUDED.mastery_score;

-- ============================================================
-- TOPIC DEPENDENCIES (PHASE 2)
-- ============================================================

INSERT INTO topic_dependencies (id, topic, prerequisite_topic) VALUES
('td-01', 'Control Flow',          'Python Variables'),
('td-02', 'Python Functions',      'Control Flow'),
('td-03', 'Python Recursion',      'Python Functions'),
('td-04', 'Linear & Quadratic Eqs', 'Algebraic Expressions'),
('td-05', 'Calculus Derivatives',  'Linear & Quadratic Eqs'),
('td-06', 'SQL JOIN',              'SQL Basics'),
('td-07', 'Advanced JOIN',         'SQL JOIN'),
('td-08', 'Subqueries',            'Advanced JOIN')
ON CONFLICT (topic, prerequisite_topic) DO NOTHING;

-- ============================================================
-- ENROLL DEMO STUDENT IN PYTHON COURSE
-- ============================================================

INSERT INTO student_courses (id, student_id, course_id, progress_percent) VALUES
('enrollment-demo-001', 'student-profile-001', 'course-python-001', 40)
ON CONFLICT (student_id, course_id) DO NOTHING;

-- ============================================================
-- DEMO LEARNING EVENTS
-- ============================================================

INSERT INTO learning_events (id, student_id, lesson_id, topic, event_type, metadata) VALUES
(
  'event-demo-001',
  'student-profile-001',
  'lesson-py-01-01',
  'Python Variables',
  'LESSON_START',
  '{"device": "desktop", "browser": "chrome"}'
),
(
  'event-demo-002',
  'student-profile-001',
  'lesson-py-01-01',
  'Python Variables',
  'LESSON_COMPLETED',
  '{"time_spent_seconds": 890}'
),
(
  'event-demo-003',
  'student-profile-001',
  'lesson-py-01-02',
  'Python Functions',
  'QUIZ_ATTEMPTED',
  '{"assessmentId": "assessment-py-quiz-01", "score": 8, "passed": true}'
),
(
  'event-demo-004',
  'student-profile-001',
  NULL,
  'Python Recursion',
  'QUESTION_WRONG',
  '{"questionId": "q-py-rec-01", "studentAnswer": "return fib(n)"}'
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
