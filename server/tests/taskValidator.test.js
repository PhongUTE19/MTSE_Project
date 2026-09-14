import assert from "node:assert/strict";
import test from "node:test";
import { createTaskSchema, updateTaskSchema } from "../src/validators/taskValidator.js";

const projectId = "650e8400-e29b-41d4-a716-446655440001";
const dueAt = "2026-12-31T23:59:00.000Z";

test("create task applies defaults", () => {
  const result = createTaskSchema.parse({ projectId, title: "Valid task", dueAt });
  assert.equal(result.status, "todo");
  assert.equal(result.priority, "medium");
  assert.deepEqual(result.labels, []);
});

test("create task rejects a past deadline", () => {
  const result = createTaskSchema.safeParse({ projectId, title: "Valid task", dueAt: "2020-01-01T00:00:00.000Z" });
  assert.equal(result.success, false);
  assert.equal(result.error.issues.some((issue) => issue.path[0] === "dueAt"), true);
});

test("partial task updates preserve omitted fields", () => {
  assert.deepEqual(updateTaskSchema.parse({ status: "in_progress" }), { status: "in_progress" });
});
