import assert from "node:assert/strict";
import { beforeEach, afterEach, mock, test } from "node:test";
import request from "supertest";

process.env.SUPABASE_URL = "https://api-tests.invalid";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-placeholder";
const { default: app } = await import("../src/app.js");
const { supabase } = await import("../src/config/supabase.js");

const projectId = "650e8400-e29b-41d4-a716-446655440001";
const memberId = "550e8400-e29b-41d4-a716-446655440001";
const labelId = "85603b69-ffd9-46ab-baf8-85df3213389a";

beforeEach(() => {
  mock.method(supabase, "from", () => {
    throw new Error("Unexpected database call in unit test");
  });
});
afterEach(() => mock.restoreAll());

test("GET /api/v1/projects returns mapped projects", async () => {
  supabase.from.mock.mockImplementation((table) => {
    assert.equal(table, "projects");
    return {
      select: () => ({
        eq: () => ({
          order: async () => ({
            data: [
              {
                id: projectId,
                name: "Test Project",
                course_name: "General",
                description: "Test Desc",
                deadline: null,
                created_by: "student-1",
                status: "active",
                created_at: "2026-09-14T00:00:00Z",
                updated_at: "2026-09-14T00:00:00Z",
              },
            ],
            error: null,
          }),
        }),
      }),
    };
  });

  const res = await request(app).get("/api/v1/projects").expect(200);
  assert.equal(Array.isArray(res.body), true);
  assert.equal(res.body.length, 1);
  assert.equal(res.body[0].id, projectId);
  assert.equal(res.body[0].courseName, "General");
});

test("POST /api/v1/projects creates a valid project (201)", async () => {
  supabase.from.mock.mockImplementation((table) => {
    assert.equal(table, "projects");
    return {
      insert: (payload) => {
        assert.equal(payload.name, "New Capstone");
        assert.equal(payload.course_name, "SE");
        return {
          select: () => ({
            single: async () => ({
              data: {
                id: projectId,
                name: payload.name,
                course_name: payload.course_name,
                description: payload.description,
                deadline: payload.deadline,
                created_by: payload.created_by,
                status: "active",
                created_at: "2026-09-14T00:00:00Z",
                updated_at: "2026-09-14T00:00:00Z",
              },
              error: null,
            }),
          }),
        };
      },
    };
  });

  const res = await request(app)
    .post("/api/v1/projects")
    .send({ name: "New Capstone", courseName: "SE", description: "Desc" })
    .expect(201);

  assert.equal(res.body.id, projectId);
  assert.equal(res.body.name, "New Capstone");
  assert.equal(res.body.courseName, "SE");
});

test("POST /api/v1/projects rejects invalid project name (400)", async () => {
  const res = await request(app)
    .post("/api/v1/projects")
    .send({ name: "ab" })
    .expect(400);

  assert.equal(res.body.error, "ValidationError");
});

test("GET /api/v1/projects/:projectId/members returns project members", async () => {
  supabase.from.mock.mockImplementation((table) => {
    assert.equal(table, "members");
    return {
      select: () => ({
        eq: (col, val) => {
          assert.equal(col, "project_id");
          assert.equal(val, projectId);
          return {
            order: async () => ({
              data: [
                {
                  id: memberId,
                  project_id: projectId,
                  name: "Alice",
                  mssv: "19110001",
                  email: "alice@example.com",
                  created_at: "2026-09-14T00:00:00Z",
                  updated_at: "2026-09-14T00:00:00Z",
                },
              ],
              error: null,
            }),
          };
        },
      }),
    };
  });

  const res = await request(app)
    .get(`/api/v1/projects/${projectId}/members`)
    .expect(200);

  assert.equal(res.body.length, 1);
  assert.equal(res.body[0].name, "Alice");
  assert.equal(res.body[0].mssv, "19110001");
});

test("POST /api/v1/projects/:projectId/members creates a valid member (201)", async () => {
  supabase.from.mock.mockImplementation((table) => {
    assert.equal(table, "members");
    return {
      insert: (payload) => {
        assert.equal(payload.project_id, projectId);
        assert.equal(payload.name, "Bob");
        return {
          select: () => ({
            single: async () => ({
              data: {
                id: memberId,
                project_id: projectId,
                name: payload.name,
                mssv: payload.mssv,
                email: payload.email,
                created_at: "2026-09-14T00:00:00Z",
                updated_at: "2026-09-14T00:00:00Z",
              },
              error: null,
            }),
          }),
        };
      },
    };
  });

  const res = await request(app)
    .post(`/api/v1/projects/${projectId}/members`)
    .send({ name: "Bob", mssv: "19110002", email: "bob@example.com" })
    .expect(201);

  assert.equal(res.body.id, memberId);
  assert.equal(res.body.name, "Bob");
});

test("GET /api/v1/projects/:projectId/labels returns project labels", async () => {
  supabase.from.mock.mockImplementation((table) => {
    assert.equal(table, "labels");
    return {
      select: () => ({
        eq: (col, val) => {
          assert.equal(col, "project_id");
          assert.equal(val, projectId);
          return {
            order: async () => ({
              data: [
                {
                  id: labelId,
                  project_id: projectId,
                  name: "Bug",
                  color: "#ff0000",
                  created_at: "2026-09-14T00:00:00Z",
                  updated_at: "2026-09-14T00:00:00Z",
                },
              ],
              error: null,
            }),
          };
        },
      }),
    };
  });

  const res = await request(app)
    .get(`/api/v1/projects/${projectId}/labels`)
    .expect(200);

  assert.equal(res.body.length, 1);
  assert.equal(res.body[0].name, "Bug");
  assert.equal(res.body[0].color, "#ff0000");
});

test("GET /api/v1/projects/:projectId/statuses returns default statuses", async () => {
  const res = await request(app)
    .get(`/api/v1/projects/${projectId}/statuses`)
    .expect(200);

  assert.equal(Array.isArray(res.body), true);
  assert.equal(res.body.length, 3);
  assert.equal(res.body[0].id, "todo");
  assert.equal(res.body[1].id, "in_progress");
  assert.equal(res.body[2].id, "done");
});
