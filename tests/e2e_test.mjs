// tests/e2e_test.mjs
// Comprehensive End-to-End Test Suite for AdaptiveMind (SIH Problem 19)

const BACKEND_URL = 'http://localhost:5001';
const AI_URL = 'http://localhost:8000';
const FRONTEND_URL = 'http://localhost:3000';

let passedCount = 0;
let failedCount = 0;

async function test(name, fn) {
  process.stdout.write(`  ▶ ${name}... `);
  try {
    await fn();
    console.log(`\x1b[32m✔ PASS\x1b[0m`);
    passedCount++;
  } catch (err) {
    console.log(`\x1b[31m✖ FAIL\x1b[0m: ${err.message}`);
    failedCount++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON from ${url} (status: ${res.status}), got: ${text.slice(0, 100)}`);
  }
  return { status: res.status, ok: res.ok, data: json };
}

console.log('\n======================================================');
console.log('       AdaptiveMind End-to-End Verification Suite     ');
console.log('======================================================\n');

// 1. Health Checks
console.log('--- 1. Infrastructure & Service Health ---');

await test('Backend Service Health Check (GET /health)', async () => {
  const { status, data } = await fetchJson(`${BACKEND_URL}/health`);
  assert(status === 200, `Expected 200, got ${status}`);
  assert(data.status === 'ok', `Expected status: ok, got ${JSON.stringify(data)}`);
});

await test('AI Service Health Check (GET /health)', async () => {
  const { status, data } = await fetchJson(`${AI_URL}/health`);
  assert(status === 200, `Expected 200, got ${status}`);
  assert(data.status === 'ok', `Expected status: ok, got ${JSON.stringify(data)}`);
  assert(data.service === 'adaptivemind-ai-service', 'Invalid service identifier');
});

await test('Frontend Next.js Availability (GET /login)', async () => {
  const res = await fetch(`${FRONTEND_URL}/login`);
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  const html = await res.text();
  assert(html.includes('AdaptiveMind'), 'Frontend did not return expected page content');
});

// 2. Authentication & Database Connectivity (Fixing the Screenshot Error)
console.log('\n--- 2. Authentication & Database E2E ---');

let shreyaToken = null;
let shreyaUserId = null;

await test('Login with Shreya Maurya (6093shreya@gmail.com / Student@123)', async () => {
  const { status, data } = await fetchJson(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: '6093shreya@gmail.com',
      password: 'Student@123',
    }),
  });

  assert(status === 200, `Expected 200, got ${status}`);
  assert(data.success === true, `Login failed: ${data.message}`);
  assert(data.data?.token, 'No token returned in auth response');
  assert(data.data?.user?.email === '6093shreya@gmail.com', 'User email does not match');
  assert(data.data?.user?.role === 'STUDENT', 'User role should be STUDENT');
  assert(data.data?.user?.student !== null, 'Student profile relation should be populated');

  shreyaToken = data.data.token;
  shreyaUserId = data.data.user.id;
});

await test('Login with Demo Student (student@adaptivemind.dev)', async () => {
  const { status, data } = await fetchJson(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student@adaptivemind.dev',
      password: 'Student@123',
    }),
  });

  assert(status === 200, `Expected 200, got ${status}`);
  assert(data.success === true, `Login failed: ${data.message}`);
  assert(data.data?.user?.role === 'STUDENT', 'Role should be STUDENT');
});

await test('Login with Teacher Account (teacher@adaptivemind.dev)', async () => {
  const { status, data } = await fetchJson(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'teacher@adaptivemind.dev',
      password: 'Teacher@123',
    }),
  });

  assert(status === 200, `Expected 200, got ${status}`);
  assert(data.success === true, `Login failed: ${data.message}`);
  assert(data.data?.user?.role === 'TEACHER', 'Role should be TEACHER');
});

await test('Rejection of Invalid Password', async () => {
  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: '6093shreya@gmail.com',
      password: 'WrongPassword!',
    }),
  });

  assert(res.status === 401 || res.status === 400, `Expected 401/400 for bad password, got ${res.status}`);
});

// 3. Protected Backend Data API
console.log('\n--- 3. Core Learning Platform APIs ---');

await test('Verify Authenticated Profile (GET /api/auth/me)', async () => {
  assert(shreyaToken, 'Token missing from prior test');
  const { status, data } = await fetchJson(`${BACKEND_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${shreyaToken}` },
  });

  assert(status === 200, `Expected 200, got ${status}`);
  assert(data.data?.id === shreyaUserId, 'User id mismatch');
});

await test('Fetch Published Courses (GET /api/courses)', async () => {
  const { status, data } = await fetchJson(`${BACKEND_URL}/api/courses`);
  assert(status === 200, `Expected 200, got ${status}`);
  assert(Array.isArray(data.data), 'Expected array of courses');
  assert(data.data.length > 0, 'Expected at least 1 course in database');
});

await test('Fetch Student Course Enrollments (GET /api/courses/enrolled)', async () => {
  const { status, data } = await fetchJson(`${BACKEND_URL}/api/courses/enrolled`, {
    headers: { Authorization: `Bearer ${shreyaToken}` },
  });
  assert(status === 200, `Expected 200, got ${status}`);
  assert(Array.isArray(data.data), 'Expected enrolled courses array');
});

await test('Fetch Student Progress Stats (GET /api/progress/students/:id)', async () => {
  const { status, data } = await fetchJson(`${BACKEND_URL}/api/progress/students/${shreyaUserId}`, {
    headers: { Authorization: `Bearer ${shreyaToken}` },
  });
  assert(status === 200, `Expected 200, got ${status}`);
  assert(typeof data.data?.xpPoints === 'number', 'Expected xpPoints number in progress');
});

// 4. AI Multi-Agent Services
console.log('\n--- 4. Multi-Agent AI System (Phase 3-6) ---');

await test('Socratic AI Tutor Agent (POST /ai/tutor)', async () => {
  const { status, data } = await fetchJson(`${AI_URL}/ai/tutor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: shreyaUserId,
      question: 'How does recursion work?',
      topic: 'Python Recursion',
    }),
  });

  assert(status === 200, `Expected 200, got ${status}`);
  assert(data.success === true, 'Tutor request should succeed');
  assert(data.output && data.output.length > 0, 'Expected output text from Tutor Agent');
  assert(data.agent_selected === 'tutor_agent', 'Expected tutor_agent');
});

await test('Safe Python Coding Mentor Agent (POST /ai/coding)', async () => {
  const { status, data } = await fetchJson(`${AI_URL}/ai/coding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: shreyaUserId,
      topic: 'Python Basics',
      problem_description: 'Calculate sum of numbers in array',
      student_code: 'nums = [1, 2, 3, 4, 5]\nprint(sum(nums))',
    }),
  });

  assert(status === 200, `Expected 200, got ${status}`);
  assert(data.success === true, 'Execution request should succeed');
  assert(data.action_result?.stdout?.trim() === '15', `Expected '15', got '${data.action_result?.stdout}'`);
  assert(data.agent_selected === 'coding_mentor', 'Expected coding_mentor agent');
});

await test('Diagnostic Assessment Agent (POST /ai/assessment)', async () => {
  const { status, data } = await fetchJson(`${AI_URL}/ai/assessment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: shreyaUserId,
      topic: 'Python Recursion',
      num_questions: 2,
    }),
  });

  assert(status === 200, `Expected 200, got ${status}`);
  assert(data.success === true, 'Assessment request should succeed');
  assert(Array.isArray(data.action_result?.questions), 'Expected array of generated questions');
  assert(data.action_result.questions.length > 0, 'Expected at least 1 question');
});

await test('Autonomous Learning Adaptation Agent (POST /ai/learning)', async () => {
  const { status, data } = await fetchJson(`${AI_URL}/ai/learning`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id: shreyaUserId,
      topic: 'Python Recursion',
    }),
  });

  assert(status === 200, `Expected 200, got ${status}`);
  assert(data.success === true, 'Learning adaptation request should succeed');
  assert(data.agent_selected === 'learning_adaptation_agent', 'Expected learning_adaptation_agent');
  assert(data.decision && data.decision.action, 'Expected decision action');
});

await test('Automated Evaluation & Observability (GET /ai/debugging/evaluation)', async () => {
  const { status, data } = await fetchJson(`${AI_URL}/ai/debugging/evaluation`);
  assert(status === 200, `Expected 200, got ${status}`);
  assert(data.success === true, 'Evaluation metrics endpoint failed');
  assert(data.evaluation?.learning_agent?.evaluated_scenarios >= 4, 'Expected at least 4 evaluated scenarios');
  assert(data.evaluation?.tutor_agent?.curriculum_grounding_score >= 0.8, 'Expected curriculum grounding score >= 0.8');
});

// Summary
console.log('\n======================================================');
console.log(`Results: \x1b[32m${passedCount} Passed\x1b[0m, \x1b[31m${failedCount} Failed\x1b[0m`);
console.log('======================================================\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log('✨ ALL END-TO-END TESTS PASSED SUCCESSFULLY! ✨\n');
  process.exit(0);
}
