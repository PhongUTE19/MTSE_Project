import assert from "node:assert/strict";
import { test } from "node:test";
import { parseTaskInputSchema, aiTaskResponseSchema } from "../src/validators/aiValidator.js";

test("parseTaskInputSchema accepts valid natural language prompts", () => {
  const result = parseTaskInputSchema.safeParse({
    prompt: "Fix login button styling before tomorrow 5pm",
    context: {
      nowIso: "2026-10-15T10:00:00.000Z",
      availableLabels: ["Frontend", "Bug"],
    },
  });

  assert.equal(result.success, true);
  assert.equal(result.data.prompt, "Fix login button styling before tomorrow 5pm");
  assert.equal(result.data.context.availableLabels.length, 2);
});

test("parseTaskInputSchema rejects empty or whitespace-only prompts", () => {
  const empty = parseTaskInputSchema.safeParse({ prompt: "   " });
  assert.equal(empty.success, false);

  const missing = parseTaskInputSchema.safeParse({});
  assert.equal(missing.success, false);
});

test("aiTaskResponseSchema validates structured AI task output correctly", () => {
  const validOutput = {
    isTask: true,
    title: "Implement OAuth2 login flow",
    description: "Support Google and GitHub OAuth providers.",
    priority: "high",
    dueAt: "2026-10-20T17:00:00.000Z",
    labels: ["Auth", "Security"],
    checklist: ["Configure client secrets", "Add callback route", "Write tests"],
    confidence: 0.95,
  };

  const parsed = aiTaskResponseSchema.safeParse(validOutput);
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.title, "Implement OAuth2 login flow");
  assert.equal(parsed.data.priority, "high");
  assert.equal(parsed.data.checklist.length, 3);
});

test("aiTaskResponseSchema allows null deadline and null priority without inventing values", () => {
  const outputWithoutOptionals = {
    isTask: true,
    title: "Research React 19 server actions",
    description: "",
    priority: null,
    dueAt: null,
    labels: [],
    checklist: [],
  };

  const parsed = aiTaskResponseSchema.safeParse(outputWithoutOptionals);
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.priority, null);
  assert.equal(parsed.data.dueAt, null);
  assert.deepEqual(parsed.data.labels, []);
  assert.deepEqual(parsed.data.checklist, []);
});

test("aiTaskResponseSchema rejects output marked as isTask:true but missing a valid title", () => {
  const invalid = {
    isTask: true,
    title: "",
    description: "Some description without a title",
    priority: "low",
    dueAt: null,
    labels: [],
    checklist: [],
  };

  const parsed = aiTaskResponseSchema.safeParse(invalid);
  assert.equal(parsed.success, false);
  const titleError = parsed.error.issues.find((i) => i.path.includes("title"));
  assert.ok(titleError);
});

test("aiTaskResponseSchema accepts valid non-task responses with rejectionReason", () => {
  const nonTask = {
    isTask: false,
    title: "",
    description: "",
    priority: null,
    dueAt: null,
    labels: [],
    checklist: [],
    rejectionReason: "Prompt is an unrelated cooking question.",
  };

  const parsed = aiTaskResponseSchema.safeParse(nonTask);
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.isTask, false);
  assert.equal(parsed.data.rejectionReason, "Prompt is an unrelated cooking question.");
});
