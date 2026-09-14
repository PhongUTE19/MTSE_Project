# 📡 API Endpoint Specifications (API Contract)

**Application:** Student Task & Deadline Manager (MANA)  
**Milestone:** Homework 3B+ — Members & Labels Dynamic Management
**Prepared for:** Week 4 — Backend Technologies & DevOps Integration  

---

## 1. Overview & General Conventions

- **Base URL:** `http://localhost:5000/api/v1` (configurable via `VITE_API_BASE_URL`)
- **Content-Type:** `application/json`
- **Date Format:** ISO 8601 UTC string (e.g., `2026-09-30T16:59:00.000Z`)
- **Standard HTTP Status Codes:**
  - `200 OK`: Request succeeded.
  - `201 Created`: Resource created successfully.
  - `204 No Content`: Resource deleted successfully.
  - `400 Bad Request`: Validation error or malformed payload.
  - `404 Not Found`: Resource not found.
  - `500 Internal Server Error`: Server error.

---

## 2. API Endpoints

### 2.1. Projects

#### `GET /api/v1/projects`
Retrieve list of all active projects for current user/team.

- **Request:**
  - Method: `GET`
  - Headers: `Accept: application/json`
- **Response `200 OK`:**
```json
[
  {
    "id": "project-1",
    "name": "Student Task & Deadline Manager",
    "courseName": "New Technology",
    "description": "Ứng dụng hỗ trợ sinh viên quản lý công việc nhóm, thành viên và deadline trong các project môn học.",
    "deadline": "2026-09-30T23:59:00+07:00",
    "memberIds": ["student-1", "student-2", "student-3"],
    "createdBy": "student-3",
    "status": "active",
    "createdAt": "2026-09-07T08:00:00+07:00"
  },
  {
    "id": "project-2",
    "name": "Campus Event Planner",
    "courseName": "Software Engineering",
    "description": "Ứng dụng hỗ trợ lập kế hoạch, phân công và theo dõi tiến độ tổ chức sự kiện.",
    "deadline": "2026-10-15T23:59:00+07:00",
    "memberIds": ["student-1", "student-2"],
    "createdBy": "student-1",
    "status": "active",
    "createdAt": "2026-09-08T09:00:00+07:00"
  }
]
```

---

#### `GET /api/v1/projects/:id`
Retrieve detailed information for a specific project.

- **Request:**
  - Method: `GET`
  - URL Parameters: `id` (e.g., `project-1`)
- **Response `200 OK`:**
```json
{
  "id": "project-1",
  "name": "Student Task & Deadline Manager",
  "courseName": "New Technology",
  "description": "Ứng dụng hỗ trợ sinh viên quản lý công việc nhóm, thành viên và deadline trong các project môn học.",
  "deadline": "2026-09-30T23:59:00+07:00",
  "memberIds": ["student-1", "student-2", "student-3"],
  "createdBy": "student-3",
  "status": "active",
  "createdAt": "2026-09-07T08:00:00+07:00"
}
```
- **Response `404 Not Found`:**
```json
{
  "error": "NotFound",
  "message": "Project with ID \"project-999\" not found."
}
```

---

### 2.2. Tasks

#### `GET /api/v1/tasks`
Retrieve tasks, optionally filtered by `projectId` or `status`.

- **Request:**
  - Method: `GET`
  - Query Parameters:
    - `projectId` *(optional, string)*: e.g., `project-1`
    - `status` *(optional, string)*: `todo`, `in_progress`, or `done`
- **Response `200 OK`:**
```json
[
  {
    "id": "task-1",
    "projectId": "project-1",
    "title": "Lên ý tưởng project",
    "description": "Xác định vấn đề sinh viên gặp phải, đối tượng sử dụng và mục tiêu của ứng dụng.",
    "assigneeIds": ["student-3"],
    "status": "done",
    "priority": "high",
    "startAt": "2026-09-07T08:00:00+07:00",
    "dueAt": "2026-09-07T23:59:00+07:00",
    "labels": ["Planning"],
    "checklist": [
      {
        "id": "check-1-1",
        "title": "Họp nhóm brainstorm",
        "completed": true
      },
      {
        "id": "check-1-2",
        "title": "Chọn chủ đề phù hợp môn học",
        "completed": true
      }
    ],
    "reminderMinutesBefore": [1440],
    "createdBy": "student-3",
    "createdAt": "2026-09-07T08:00:00+07:00",
    "updatedAt": "2026-09-07T21:30:00+07:00",
    "completedAt": "2026-09-07T21:30:00+07:00"
  }
]
```

---

#### `GET /api/v1/tasks/:id`
Retrieve details of a single task.

- **Request:**
  - Method: `GET`
  - URL Parameters: `id` (e.g., `task-1`)
- **Response `200 OK`:**
```json
{
  "id": "task-1",
  "projectId": "project-1",
  "title": "Lên ý tưởng project",
  "description": "Xác định vấn đề sinh viên gặp phải, đối tượng sử dụng và mục tiêu của ứng dụng.",
  "assigneeIds": ["student-3"],
  "status": "done",
  "priority": "high",
  "startAt": "2026-09-07T08:00:00+07:00",
  "dueAt": "2026-09-07T23:59:00+07:00",
  "labels": ["Planning"],
  "checklist": [
    { "id": "check-1-1", "title": "Họp nhóm brainstorm", "completed": true }
  ],
  "reminderMinutesBefore": [1440],
  "createdBy": "student-3",
  "createdAt": "2026-09-07T08:00:00+07:00",
  "updatedAt": "2026-09-07T21:30:00+07:00"
}
```
- **Response `404 Not Found`:**
```json
{
  "error": "NotFound",
  "message": "Task with ID \"task-999\" not found."
}
```

---

#### `POST /api/v1/tasks`
Create a new task under a project.

- **Request:**
  - Method: `POST`
  - Headers: `Content-Type: application/json`
  - Body:
```json
{
  "projectId": "project-1",
  "title": "Xây dựng REST API Backend",
  "description": "Cài đặt Express.js server, kết nối MongoDB và cài đặt các route chính.",
  "status": "todo",
  "priority": "high",
  "deadline": "2026-09-25T23:59:00.000Z",
  "assigneeIds": ["student-1", "student-2"],
  "labels": ["Backend", "Node.js"],
  "checklist": [
    { "id": "check-1", "title": "Khởi tạo Express server", "completed": false },
    { "id": "check-2", "title": "Cài đặt validation middleware", "completed": false }
  ]
}
```

- **Validation Rules:**
  - `title`: Required, string, length >= 3.
  - `deadline` / `dueAt`: Required, ISO 8601 string, must not be in the past.
  - `priority`: Optional (default: `"medium"`), one of `["low", "medium", "high"]`.
  - `status`: Optional (default: `"todo"`), one of `["todo", "in_progress", "done"]`.

- **Response `201 Created`:**
```json
{
  "id": "task-1726270000000",
  "projectId": "project-1",
  "title": "Xây dựng REST API Backend",
  "description": "Cài đặt Express.js server, kết nối MongoDB và cài đặt các route chính.",
  "status": "todo",
  "priority": "high",
  "startAt": null,
  "dueAt": "2026-09-25T23:59:00.000Z",
  "assigneeIds": ["student-1", "student-2"],
  "labels": ["Backend", "Node.js"],
  "checklist": [
    { "id": "check-1", "title": "Khởi tạo Express server", "completed": false },
    { "id": "check-2", "title": "Cài đặt validation middleware", "completed": false }
  ],
  "reminderMinutesBefore": [],
  "createdBy": "student-1",
  "createdAt": "2026-09-14T01:00:00.000Z",
  "updatedAt": "2026-09-14T01:00:00.000Z"
}
```

- **Response `400 Bad Request` (Validation Failed):**
```json
{
  "error": "ValidationError",
  "message": "Invalid task payload.",
  "errors": {
    "title": "Title must be at least 3 characters.",
    "deadline": "Deadline cannot be in the past."
  }
}
```

---

#### `PUT /api/v1/tasks/:id`
Update an existing task (partial or complete updates).

- **Request:**
  - Method: `PUT`
  - URL Parameters: `id` (e.g., `task-1`)
  - Body:
```json
{
  "status": "in_progress",
  "priority": "high",
  "description": "Đã bắt đầu công việc kiểm thử tự động.",
  "checklist": [
    { "id": "check-1", "title": "Khởi tạo Express server", "completed": true },
    { "id": "check-2", "title": "Cài đặt validation middleware", "completed": false }
  ]
}
```

- **Response `200 OK`:**
```json
{
  "id": "task-1",
  "projectId": "project-1",
  "title": "Xây dựng REST API Backend",
  "description": "Đã bắt đầu công việc kiểm thử tự động.",
  "status": "in_progress",
  "priority": "high",
  "checklist": [
    { "id": "check-1", "title": "Khởi tạo Express server", "completed": true },
    { "id": "check-2", "title": "Cài đặt validation middleware", "completed": false }
  ],
  "updatedAt": "2026-09-14T01:10:00.000Z"
}
```

---

#### `DELETE /api/v1/tasks/:id`
Remove a task from the system.

- **Request:**
  - Method: `DELETE`
  - URL Parameters: `id` (e.g., `task-1`)
- **Response `200 OK` (or `204 No Content`):**
```json
{
  "success": true,
  "deletedId": "task-1",
  "message": "Task successfully deleted."
}
```
- **Response `404 Not Found`:**
```json
{
  "error": "NotFound",
  "message": "Task with ID \"task-1\" not found."
}
```

---

### 2.3. Dashboard & Metrics

#### `GET /api/v1/dashboard/stats`
Retrieve aggregated project & task metrics for the current dashboard.

- **Request:**
  - Method: `GET`
  - Headers: `Accept: application/json`
- **Response `200 OK`:**
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

### 2.4. Students / Team Members

#### `GET /api/v1/students`
Retrieve list of students/team members available for assignment.

- **Request:**
  - Method: `GET`
- **Response `200 OK`:**
```json
[
  {
    "id": "student-1",
    "name": "Bùi Duy Phong",
    "mssv": "19110131",
    "email": "BuiDuyPhong@gmail.com"
  },
  {
    "id": "student-2",
    "name": "Trần Thị Tố Như",
    "mssv": "23110051",
    "email": "NhuTran@gmail.com"
  },
  {
    "id": "student-3",
    "name": "Văn Phạm Thảo Nhi",
    "mssv": "23110049",
    "email": "NhiVan@gmail.com"
  }
]
```

### 2.5. Members

#### `GET /api/v1/members`
Retrieve the current team members available for assignment.

- **Response `200 OK`:**
```json
[
  {
    "id": "student-1",
    "name": "Bùi Duy Phong",
    "mssv": "19110131",
    "email": "BuiDuyPhong@gmail.com"
  }
]
```

#### `POST /api/v1/members`
Create a team member.

- **Request body:**
```json
{
  "name": "Nguyễn Văn A",
  "mssv": "23110099",
  "email": "a@example.com"
}
```
- **Response `201 Created`:** The created member object.
- **Response `400 Bad Request`:** Validation error, including duplicate MSSV or invalid email.

#### `PATCH /api/v1/members/:id`
Update one or more member fields (`name`, `mssv`, `email`).

- **Response `200 OK`:** The updated member.
- **Response `404 Not Found`:** Member does not exist.

> Members are not deletable to preserve task history. Use `PATCH` when member information changes.

### 2.6. Labels

#### `GET /api/v1/labels`
Retrieve labels available for task assignment.

- **Response `200 OK`:**
```json
[
  {
    "id": "label-1",
    "name": "Frontend",
    "color": "#4bce97"
  }
]
```

#### `POST /api/v1/labels`
Create a label.

- **Request body:** `{ "name": "Frontend", "color": "#4bce97" }`
- Label names are normalized and must be unique case-insensitively.
- **Response `201 Created`:** The created label.
- **Response `400 Bad Request`:** Duplicate or invalid label name.

#### `PATCH /api/v1/labels/:id`
Update a label's `name` and/or `color`.

- **Response `200 OK`:** The updated label.
- **Response `404 Not Found`:** Label does not exist.

#### `DELETE /api/v1/labels/:id`
Delete a label and remove its name from every task's `labels` array.

- **Response `200 OK`:** `{ "success": true, "deletedId": "..." }`
- **Response `404 Not Found`:** Label does not exist.

---

## 3. Endpoint Overview

The contract now contains **15 endpoints**: 8 original Homework 3B endpoints plus 3 Members endpoints and 4 Labels endpoints.

## 4. Changelog

- **3B:** 8 endpoints for Projects, Tasks, Dashboard, and Students.
- **3B+:** 15 endpoints, adding member add/edit and Labels CRUD with validation and label cascade cleanup.
