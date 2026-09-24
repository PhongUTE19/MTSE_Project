import assert from "node:assert/strict";
import { beforeEach, afterEach, mock, test } from "node:test";
import request from "supertest";

// Test environment configuration
process.env.SUPABASE_URL = "https://api-tests.invalid";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-placeholder";
process.env.GEMINI_API_KEY = "test-gemini-key";

const { default: app } = await import("../src/app.js");
const { aiService, AiServiceError } = await import("../src/services/aiService.js");

beforeEach(() => {
  mock.method(console, "error", () => {});
});

afterEach(() => {
  mock.restoreAll();
});

test("GET /api/v1/ai/health returns 200 with service configuration details", async () => {
  const res = await request(app)
    .get("/api/v1/ai/health")
    .expect(200)
    .expect("Content-Type", /json/);

  assert.equal(res.body.status, "ok");
  assert.equal(res.body.service, "mana-ai-task-assistant");
  assert.equal(typeof res.body.configured, "boolean");
  assert.equal(typeof res.body.model, "string");
  assert.equal(typeof res.body.promptVersion, "string");
});

test("POST /api/v1/ai/parse-task successfully parses natural language and returns structured task (200)", async () => {
  const fakeTask = {
    isTask: true,
    title: "Update README with setup instructions",
    description: "Document Node.js v22 requirement and Supabase env vars.",
    priority: "medium",
    dueAt: "2026-10-18T18:00:00.000Z",
    labels: ["Documentation"],
    checklist: ["Add prerequisites section", "Verify clone steps"],
    confidence: 0.98,
    rejectionReason: null,
  };

  mock.method(aiService, "parseTaskPrompt", async () => ({
    task: fakeTask,
    model: "gemini-test-model",
    promptVersion: "v1.0.0",
    latencyMs: 120,
  }));

  const res = await request(app)
    .post("/api/v1/ai/parse-task")
    .send({
      prompt: "Update README with setup instructions before Sunday 6pm",
      context: {
        nowIso: "2026-10-15T12:00:00.000Z",
        availableLabels: ["Documentation", "Feature"],
      },
    })
    .expect(200)
    .expect("Content-Type", /json/);

  assert.equal(res.body.success, true);
  assert.equal(res.body.data.title, fakeTask.title);
  assert.equal(res.body.data.priority, "medium");
  assert.equal(res.body.data.dueAt, fakeTask.dueAt);
  assert.equal(res.body.data.checklist.length, 2);
  assert.equal(res.body.meta.model, "gemini-test-model");
  assert.equal(res.body.meta.promptVersion, "v1.0.0");
});

test("POST /api/v1/ai/parse-task rejects invalid input with 400 ValidationError", async () => {
  const res = await request(app)
    .post("/api/v1/ai/parse-task")
    .send({ prompt: "" })
    .expect(400)
    .expect("Content-Type", /json/);

  assert.equal(res.body.error, "ValidationError");
  assert.ok(res.body.errors?.prompt);
});

test("POST /api/v1/ai/parse-task returns 504 on AI timeout", async () => {
  mock.method(aiService, "parseTaskPrompt", async () => {
    throw new AiServiceError(
      "The AI model took too long to respond.",
      { code: "MODEL_TIMEOUT", status: 504 }
    );
  });

  const res = await request(app)
    .post("/api/v1/ai/parse-task")
    .send({ prompt: "A task that causes a model timeout" })
    .expect(504)
    .expect("Content-Type", /json/);

  assert.equal(res.body.error, "MODEL_TIMEOUT");
  assert.match(res.body.message, /too long to respond/i);
});

test("POST /api/v1/ai/parse-task returns 503 when model is unavailable or unconfigured", async () => {
  mock.method(aiService, "parseTaskPrompt", async () => {
    throw new AiServiceError(
      "The configured Gemini model is unavailable.",
      { code: "MODEL_UNAVAILABLE", status: 503 }
    );
  });

  const res = await request(app)
    .post("/api/v1/ai/parse-task")
    .send({ prompt: "Some valid task description" })
    .expect(503)
    .expect("Content-Type", /json/);

  assert.equal(res.body.error, "MODEL_UNAVAILABLE");
  assert.match(res.body.message, /unavailable/i);
});

test("POST /api/v1/ai/parse-task returns 429 when quota or rate limit is reached", async () => {
  mock.method(aiService, "parseTaskPrompt", async () => {
    throw new AiServiceError(
      "Gemini API quota or rate limit exceeded.",
      { code: "QUOTA_EXCEEDED", status: 429 }
    );
  });

  const res = await request(app)
    .post("/api/v1/ai/parse-task")
    .send({ prompt: "Request that hits quota limit" })
    .expect(429)
    .expect("Content-Type", /json/);

  assert.equal(res.body.error, "QUOTA_EXCEEDED");
  assert.match(res.body.message, /quota/i);
});

test("POST /api/v1/ai/parse-task returns 422 when AI output is malformed or invalid", async () => {
  mock.method(aiService, "parseTaskPrompt", async () => {
    throw new AiServiceError(
      "AI output failed schema validation.",
      { code: "INVALID_OUTPUT", status: 422, details: { field: "title" } }
    );
  });

  const res = await request(app)
    .post("/api/v1/ai/parse-task")
    .send({ prompt: "Unparseable task description" })
    .expect(422)
    .expect("Content-Type", /json/);

  assert.equal(res.body.error, "INVALID_OUTPUT");
  assert.match(res.body.message, /schema validation/i);
  assert.ok(res.body.details);
});

