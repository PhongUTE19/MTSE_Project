# Complete Project Workflow — Homework 4A

**Application:** Student Task & Deadline Manager (MANA)  
**Milestone:** Homework 4A — Backend Integration  
**Date:** 2026-09-14  
**Backend:** Node.js, Express, Supabase PostgreSQL, Zod, Morgan

> **Status:** Implemented and verified on 2026-09-14. The seven business endpoints use the real Supabase database; the verification evidence is summarized in Section 7.

---

## 1. Overview

Homework 4A implements one complete project workflow using the real Supabase database. The workflow lets a user view projects, work with a project's tasks, create and update a task, delete it, and confirm that dashboard statistics change accordingly.

The backend scope is intentionally limited to these seven endpoints. Members and Labels CRUD remain outside the 4A backend workflow; task payloads continue to store `assigneeIds` and label names in the existing task shape.

### Workflow

1. Open the Dashboard and view project/task statistics.
2. Select a project and load its Kanban tasks.
3. Create a task with a future deadline.
4. Open the task detail.
5. Update status, checklist, and labels.
6. Delete the task.
7. Return to the Dashboard and verify updated statistics.

---

## 2. API Scope

**Base URL:** `http://localhost:5000/api/v1`  
**Content-Type:** `application/json`  
**Database:** Supabase PostgreSQL schema v2.0

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/projects` | List active projects |
| GET | `/tasks?projectId=<id>` | List tasks, optionally filtered by project |
| POST | `/tasks` | Create a task |
| GET | `/tasks/:id` | Retrieve task details |
| PUT | `/tasks/:id` | Update task fields |
| DELETE | `/tasks/:id` | Delete a task |
| GET | `/dashboard/stats` | Return aggregated dashboard metrics |

The health endpoint remains available at `GET /api/health` for operational checks.

---

## 3. Data Contract

The database uses `snake_case`; API responses use `camelCase`.

### Project response

```json
{
  "id": "<project-uuid>",
  "name": "Student Task & Deadline Manager",
  "courseName": "New Technology",
  "description": "Project description",
  "deadline": "2026-09-30T16:59:00.000Z",
  "createdBy": "<user-id>",
  "status": "active",
  "createdAt": "2026-09-07T01:00:00.000Z",
  "updatedAt": "2026-09-07T01:00:00.000Z"
}
```

### Task response

```json
{
  "id": "<task-uuid>",
  "projectId": "<project-uuid>",
  "title": "Test task from 4A",
  "description": "Testing complete workflow",
  "status": "todo",
  "priority": "high",
  "startAt": null,
  "dueAt": "2026-12-31T23:59:00.000Z",
  "assigneeIds": [],
  "labels": ["Testing"],
  "checklist": [
    { "id": "c1", "title": "Check 1", "completed": false }
  ],
  "reminderMinutesBefore": [],
  "createdBy": "student-1",
  "createdAt": "2026-09-14T00:00:00.000Z",
  "updatedAt": "2026-09-14T00:00:00.000Z",
  "completedAt": null
}
```

### Dashboard response

```json
{
  "totalProjects": 2,
  "totalTasks": 11,
  "doneTasks": 2,
  "inProgressTasks": 2,
  "overdueTasks": 0
}
```

---

## 4. Validation and Error Contract

Task creation and updates are validated with Zod before reaching the controller:

- `projectId`: required UUID on create.
- `title`: required and at least 3 characters on create.
- `dueAt`: required ISO datetime on create and must not be in the past.
- `status`: `todo`, `in_progress`, or `done`.
- `priority`: `low`, `medium`, or `high`.
- `checklist`: array of objects containing `id`, `title`, and `completed`.
- `assigneeIds`, `labels`, and `reminderMinutesBefore`: arrays with the task contract types.

Validation failures use HTTP `400`:

```json
{
  "error": "ValidationError",
  "message": "Invalid payload.",
  "errors": {
    "title": "Title must be at least 3 characters."
  }
}
```

Not-found resources use HTTP `404`:

```json
{
  "error": "NotFound",
  "message": "Task with ID \"<id>\" not found."
}
```

Database constraint errors are translated by the error middleware into a client-safe error response.

---

## 5. End-to-End Verification Procedure

Run the server from `server/`:

```bash
npm install
npm run dev
```

### 5.1 Health check

```bash
curl http://localhost:5000/api/health
```

Expected: HTTP `200` with `status: "ok"`.

### 5.2 Load projects

```bash
curl http://localhost:5000/api/v1/projects
```

Copy an active project's UUID from the response and assign it to `PROJECT_ID`.

### 5.3 Load the project's board

```bash
curl "http://localhost:5000/api/v1/tasks?projectId=$PROJECT_ID"
```

Expected: only tasks whose `project_id` matches `PROJECT_ID`.

### 5.4 Create a task

```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "<project-uuid>",
    "title": "Test task from 4A",
    "description": "Testing complete workflow",
    "priority": "high",
    "dueAt": "2026-12-31T23:59:00.000Z",
    "assigneeIds": [],
    "labels": ["Testing"],
    "checklist": [
      {"id": "c1", "title": "Check 1", "completed": false}
    ]
  }'
```

Expected: HTTP `201`, a task object in camelCase, and a Supabase row in `tasks`.

### 5.5 Read task details

```bash
curl http://localhost:5000/api/v1/tasks/<task-uuid>
```

Expected: HTTP `200` with the created task.

### 5.6 Update the task

```bash
curl -X PUT http://localhost:5000/api/v1/tasks/<task-uuid> \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "labels": ["Testing", "Backend"],
    "checklist": [
      {"id": "c1", "title": "Check 1", "completed": true}
    ]
  }'
```

Expected: HTTP `200`; status, labels, and checklist are updated. A task marked `done` receives `completedAt` through the database trigger.

### 5.7 Delete the task

```bash
curl -X DELETE http://localhost:5000/api/v1/tasks/<task-uuid>
```

Expected: HTTP `200`:

```json
{
  "success": true,
  "deletedId": "<task-uuid>",
  "message": "Task successfully deleted."
}
```

A subsequent `GET /tasks/:id` must return HTTP `404`.

### 5.8 Verify dashboard statistics

```bash
curl http://localhost:5000/api/v1/dashboard/stats
```

Expected: `totalTasks` reflects the deletion and the remaining status counters match the rows in Supabase.

---

## 6. Acceptance Checklist

- [ ] Supabase connection succeeds at server startup.
- [ ] `GET /api/health` returns HTTP `200`.
- [ ] All seven workflow endpoints are wired under `/api/v1`.
- [ ] Project and task responses use camelCase.
- [ ] Task writes use the schema v2 `snake_case` columns.
- [ ] Project filtering prevents tasks from other projects appearing on the board.
- [ ] Zod rejects invalid titles, statuses, priorities, checklist values, and deadlines.
- [ ] Missing projects/tasks return HTTP `404`.
- [ ] Delete removes the task from Supabase.
- [ ] Dashboard statistics change after create/update/delete operations.
- [ ] Curl or Postman evidence is saved with the submitted milestone.

---

## 7. Verification Evidence

The completed implementation was verified with:

- `npm test`: 3 validator tests passed using Node's built-in test runner.
- Server syntax checks passed for the app, validator, and task service modules.
- Supabase startup connection succeeded and the server listened on port `5000`.
- `GET /api/health`: HTTP `200`.
- `GET /api/v1/projects`: HTTP `200`, returned 2 active projects.
- `GET /api/v1/tasks?projectId=<project-uuid>`: HTTP `200`, returned project-scoped tasks.
- `GET /api/v1/dashboard/stats`: HTTP `200`, returned dashboard counters.
- Temporary task workflow: `POST` `201`, `PUT` `200`, `GET` `200`, `DELETE` `200`, then `GET` `404`.
- Partial update verification confirmed omitted `description` remains unchanged when only `status` is updated.

No Members or Labels backend endpoints were added; those remain outside the Homework 4A seven-endpoint scope.
