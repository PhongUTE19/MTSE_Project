import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";
import request from "supertest";

process.env.SUPABASE_URL = "https://api-tests.invalid";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-placeholder";
process.env.GEMINI_API_KEY = "test-gemini-key";

const { default: app } = await import("../src/app.js");
const { multimodalService } = await import("../src/services/multimodalService.js");
const { AiServiceError } = await import("../src/services/aiService.js");

const image = Buffer.from("test-image");
const validTask = {
  isTask: true,
  title: "Fix mobile navigation",
  description: "Navbar wraps on small screens.",
  priority: "high",
  dueAt: "2026-10-18T17:00:00.000Z",
  labels: ["Frontend", "Bug"],
  checklist: ["Test on iOS"],
  confidence: 0.96,
  rejectionReason: null,
};

function mockSuccess(task = validTask) {
  mock.method(multimodalService, "parseTaskFromImage", async () => ({
    task,
    model: "gemini-test-model",
    promptVersion: "v1.0.0",
    latencyMs: 123,
  }));
}

function uploadRequest() {
  return request(app)
    .post("/api/v1/ai/multimodal-parse")
    .attach("file", image, { filename: "screenshot.png", contentType: "image/png" });
}

beforeEach(() => {
  mock.method(console, "error", () => {});
});

afterEach(() => mock.restoreAll());

test("POST /multimodal-parse returns a structured task and source image metadata", async () => {
  mockSuccess();

  const response = await uploadRequest()
    .field("context", JSON.stringify({
      projectId: "project-slug",
      nowIso: "2026-10-15T10:00:00.000Z",
      availableLabels: ["Frontend", "Bug"],
    }))
    .expect(200)
    .expect("Content-Type", /json/);

  assert.equal(response.body.success, true);
  assert.equal(response.body.data.title, validTask.title);
  assert.deepEqual(response.body.meta, {
    model: "gemini-test-model",
    promptVersion: "v1.0.0",
    latencyMs: 123,
    sourceImage: { filename: "screenshot.png", size: image.length, mimetype: "image/png" },
  });
  assert.equal(JSON.stringify(response.body).includes(process.env.GEMINI_API_KEY), false);
  assert.deepEqual(Object.keys(response.body.meta).sort(), [
    "latencyMs",
    "model",
    "promptVersion",
    "sourceImage",
  ]);
});

test("POST /multimodal-parse accepts missing context as an empty object", async () => {
  let receivedContext;
  mock.method(multimodalService, "parseTaskFromImage", async (buffer, meta, context) => {
    receivedContext = context;
    return { task: validTask, model: "gemini-test-model", promptVersion: "v1.0.0", latencyMs: 1 };
  });

  await uploadRequest().expect(200);
  assert.deepEqual(receivedContext, {});
});

test("POST /multimodal-parse rejects malformed and wrongly shaped context", async () => {
  mockSuccess();
  const malformed = await uploadRequest().field("context", "not-json").expect(400);
  assert.equal(malformed.body.error, "INVALID_INPUT");

  const wrongShape = await uploadRequest()
    .field("context", JSON.stringify({ availableLabels: "Frontend" }))
    .expect(400);
  assert.equal(wrongShape.body.error, "INVALID_INPUT");
  assert.equal(multimodalService.parseTaskFromImage.mock.callCount(), 0);
});

test("POST /multimodal-parse maps missing, unsupported, and oversized uploads", async () => {
  mockSuccess();
  const missing = await request(app).post("/api/v1/ai/multimodal-parse").expect(400);
  assert.equal(missing.body.error, "INVALID_INPUT");

  const unsupported = await request(app)
    .post("/api/v1/ai/multimodal-parse")
    .attach("file", Buffer.from("gif"), { filename: "animation.gif", contentType: "image/gif" })
    .expect(400);
  assert.equal(unsupported.body.error, "UNSUPPORTED_FILE_TYPE");

  const oversized = await request(app)
    .post("/api/v1/ai/multimodal-parse")
    .attach("file", Buffer.alloc(10 * 1024 * 1024 + 1), { filename: "large.png", contentType: "image/png" })
    .expect(413);
  assert.equal(oversized.body.error, "FILE_TOO_LARGE");
});

test("POST /multimodal-parse returns isTask:false as a successful inference", async () => {
  mockSuccess({ ...validTask, isTask: false, title: "", description: "", priority: null, dueAt: null, labels: [], checklist: [], rejectionReason: "No task in image." });
  const response = await uploadRequest().expect(200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.isTask, false);
});

test("POST /multimodal-parse propagates service contract errors", async () => {
  for (const [code, status] of [
    ["INVALID_OUTPUT", 422], ["QUOTA_EXCEEDED", 429], ["MODEL_UNAVAILABLE", 503],
    ["AI_NOT_CONFIGURED", 503], ["AI_AUTH_ERROR", 503], ["MODEL_TIMEOUT", 504],
    ["AI_GENERAL_ERROR", 502],
  ]) {
    mock.method(multimodalService, "parseTaskFromImage", async () => {
      throw new AiServiceError(`${code} test`, { code, status });
    });

    const response = await uploadRequest().expect(status);
    assert.equal(response.body.error, code);
    mock.restoreAll();
    mock.method(console, "error", () => {});
  }
});
