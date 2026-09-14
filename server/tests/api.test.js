import assert from "node:assert/strict";
import { beforeEach, afterEach, mock, test } from "node:test";
import request from "supertest";

// Set before importing the app; never use a developer's real database/keys.
process.env.SUPABASE_URL = "https://api-tests.invalid";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-placeholder";
const { default: app } = await import("../src/app.js");
const { supabase } = await import("../src/config/supabase.js");

const projectId = "650e8400-e29b-41d4-a716-446655440001";
const taskId = "650e8400-e29b-41d4-a716-446655440002";
let logs;

beforeEach(() => {
  logs = [];
  mock.method(console, "info", (line) => logs.push(JSON.parse(line)));
  mock.method(console, "error", (line) => logs.push(JSON.parse(line)));
  mock.method(supabase, "from", () => { throw new Error("Unexpected database call"); });
  mock.method(globalThis, "fetch", () => { throw new Error("Network access is forbidden in API tests"); });
});
afterEach(() => mock.restoreAll());

test("GET /api/health returns liveness and a correlated request log", async () => {
  const response = await request(app).get("/api/health?token=secret-query")
    .set("Authorization", "Bearer secret-header").expect(200).expect("Content-Type", /json/);
  assert.equal(response.body.status, "ok");
  assert.equal(response.body.service, "mana-server");
  assert.ok(Number.isFinite(Date.parse(response.body.timestamp)));
  assert.ok(response.body.uptimeSeconds >= 0);
  const log = logs.find((entry) => entry.event === "http_request");
  assert.equal(log.requestId, response.headers["x-request-id"]);
  assert.match(log.requestId, /^[0-9a-f-]{36}$/);
  assert.equal(log.path, "/api/health");
  assert.equal(log.status, 200);
  assert.ok(log.durationMs >= 0);
  assert.equal(JSON.stringify(logs).includes("secret-"), false);
  assert.equal(supabase.from.mock.callCount(), 0);
});

test("POST /api/v1/tasks accepts a valid request and returns the created task (201)", async () => {
  const dueAt = new Date(Date.now() + 86400000).toISOString();
  let inserted;
  supabase.from.mock.mockImplementation((table) => {
    assert.equal(table, "tasks");
    return { insert(payload) {
      inserted = payload;
      return { select: () => ({ single: async () => ({
        data: { id: taskId, ...payload }, error: null,
      }) }) };
    } };
  });
  const response = await request(app).post("/api/v1/tasks")
    .send({ projectId, title: "  API test task  ", dueAt })
    .expect(201).expect("Content-Type", /json/);
  assert.equal(response.body.id, taskId);
  assert.equal(response.body.projectId, projectId);
  assert.equal(response.body.title, "API test task");
  assert.equal(response.body.status, "todo");
  assert.equal(response.body.priority, "medium");
  assert.equal(response.body.dueAt, dueAt);
  assert.deepEqual(response.body.assigneeIds, []);
  assert.equal(inserted.project_id, projectId);
  assert.equal(inserted.title, "API test task");
  assert.equal(supabase.from.mock.callCount(), 1);
  assert.equal(logs.find((entry) => entry.event === "http_request").status, 201);
});

test("POST /api/v1/tasks rejects invalid input before accessing storage (400)", async () => {
  const response = await request(app).post("/api/v1/tasks").send({
    projectId: "invalid-id", title: "x", dueAt: "2020-01-01T00:00:00.000Z",
  }).expect(400).expect("Content-Type", /json/);
  assert.equal(response.body.error, "ValidationError");
  for (const field of ["projectId", "title", "dueAt"]) {
    assert.equal(typeof response.body.errors[field], "string");
  }
  assert.equal(supabase.from.mock.callCount(), 0);
  const log = logs.find((entry) => entry.event === "http_request");
  assert.equal(log.status, 400);
  assert.equal(log.level, "warn");
});

test("GET /api/v1/tasks reports storage failures and correlates safe error logs (500)", async () => {
  supabase.from.mock.mockImplementation(() => {
    throw new Error("secret-database-value");
  });
  const response = await request(app).get("/api/v1/tasks").expect(500);
  assert.equal(response.body.error, "InternalServerError");
  const errorLog = logs.find((entry) => entry.event === "request_error");
  const accessLog = logs.find((entry) => entry.event === "http_request");
  assert.equal(errorLog.requestId, response.headers["x-request-id"]);
  assert.equal(accessLog.requestId, errorLog.requestId);
  assert.equal(accessLog.status, 500);
  assert.equal(errorLog.code, "UNEXPECTED_ERROR");
  assert.equal(JSON.stringify(logs).includes("secret-database-value"), false);
});
