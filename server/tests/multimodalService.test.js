import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { AI_CONFIG } from "../src/config/ai.js";
import {
  parseTaskFromImage,
  setMultimodalAiClientForTesting,
} from "../src/services/multimodalService.js";

const originalConfig = { ...AI_CONFIG };
AI_CONFIG.apiKey = "test-api-key";
const imageBuffer = Buffer.from("image-bytes");
const imageMeta = { mimetype: "image/png", originalname: "task.png", size: imageBuffer.length };

const validTask = {
  isTask: true,
  title: "Fix responsive navigation",
  description: "Navbar breaks on mobile.",
  priority: "high",
  dueAt: "2026-10-18T17:00:00.000Z",
  labels: ["Frontend"],
  checklist: ["Test iOS Safari"],
  confidence: 0.95,
  rejectionReason: null,
};

afterEach(() => {
  Object.assign(AI_CONFIG, originalConfig, { apiKey: "test-api-key" });
  setMultimodalAiClientForTesting(null);
});

function mockGemini({ text, error, onRequest } = {}) {
  setMultimodalAiClientForTesting({
    models: {
      generateContent: async (request) => {
        onRequest?.(request);
        if (error) throw error;
        return { text };
      },
    },
  });
}

async function expectServiceError(action, code, status) {
  await assert.rejects(action, (error) => (
    error.name === "AiServiceError" && error.code === code && error.status === status
  ));
}

test("sends base64 inline image data and returns a validated task", async () => {
  let capturedRequest;
  mockGemini({ text: JSON.stringify(validTask), onRequest: (request) => { capturedRequest = request; } });

  const result = await parseTaskFromImage(imageBuffer, imageMeta, {
    nowIso: "2026-10-15T10:00:00.000Z",
    availableLabels: ["Frontend"],
  });

  assert.equal(result.task.title, validTask.title);
  assert.equal(result.model, AI_CONFIG.model);
  assert.equal(result.promptVersion, "v1.0.0");
  assert.equal(capturedRequest.contents[0].parts[1].inlineData.mimeType, "image/png");
  assert.equal(capturedRequest.contents[0].parts[1].inlineData.data, imageBuffer.toString("base64"));
  assert.equal(capturedRequest.config.responseMimeType, "application/json");
});

test("returns a valid non-task result", async () => {
  mockGemini({ text: JSON.stringify({ ...validTask, isTask: false, title: "", description: "", priority: null, dueAt: null, labels: [], checklist: [], rejectionReason: "No action item." }) });
  const result = await parseTaskFromImage(imageBuffer, imageMeta);
  assert.equal(result.task.isTask, false);
  assert.equal(result.task.rejectionReason, "No action item.");
});

test("rejects unsupported MIME, empty buffers, and oversized buffers before Gemini", async () => {
  await expectServiceError(() => parseTaskFromImage(imageBuffer, { ...imageMeta, mimetype: "image/gif" }), "UNSUPPORTED_FILE_TYPE", 400);
  await expectServiceError(() => parseTaskFromImage(Buffer.alloc(0), imageMeta), "INVALID_INPUT", 400);
  await expectServiceError(() => parseTaskFromImage(Buffer.alloc(10 * 1024 * 1024 + 1), imageMeta), "FILE_TOO_LARGE", 413);
});

test("maps empty, malformed, and schema-invalid model outputs to INVALID_OUTPUT", async () => {
  mockGemini({ text: "" });
  await expectServiceError(() => parseTaskFromImage(imageBuffer, imageMeta), "INVALID_OUTPUT", 422);

  mockGemini({ text: "not-json" });
  await expectServiceError(() => parseTaskFromImage(imageBuffer, imageMeta), "INVALID_OUTPUT", 422);

  mockGemini({ text: JSON.stringify({ isTask: true, title: "" }) });
  await expectServiceError(() => parseTaskFromImage(imageBuffer, imageMeta), "INVALID_OUTPUT", 422);
});

test("normalizes invalid priority and nullable due-date strings before validation", async () => {
  mockGemini({ text: JSON.stringify({ ...validTask, priority: "urgent", dueAt: "unspecified" }) });
  const result = await parseTaskFromImage(imageBuffer, imageMeta);
  assert.equal(result.task.priority, null);
  assert.equal(result.task.dueAt, null);
});

test("maps timeout, quota, authentication, network, and missing configuration errors", async () => {
  AI_CONFIG.requestTimeoutMs = 5;
  setMultimodalAiClientForTesting({ models: { generateContent: () => new Promise(() => {}) } });
  await expectServiceError(() => parseTaskFromImage(imageBuffer, imageMeta), "MODEL_TIMEOUT", 504);

  mockGemini({ error: new Error("quota exceeded") });
  await expectServiceError(() => parseTaskFromImage(imageBuffer, imageMeta), "QUOTA_EXCEEDED", 429);

  mockGemini({ error: new Error("invalid api key") });
  await expectServiceError(() => parseTaskFromImage(imageBuffer, imageMeta), "AI_AUTH_ERROR", 503);

  mockGemini({ error: new Error("fetch failed") });
  await expectServiceError(() => parseTaskFromImage(imageBuffer, imageMeta), "MODEL_UNAVAILABLE", 503);

  AI_CONFIG.apiKey = "";
  await expectServiceError(() => parseTaskFromImage(imageBuffer, imageMeta), "AI_NOT_CONFIGURED", 503);
});
