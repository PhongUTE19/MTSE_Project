# 03 - Team Development & Maintenance Guide

This guide provides practical instructions for team members developing, maintaining, and extending the **Student Task & Deadline Manager (MANA)** frontend. It is intended for any developer onboarding onto the project or making changes without needing to decipher every line of code.

---

## 1. Quick Start & Developer Environment

### Prerequisites
- **Node.js:** v18.0.0 or later (Node 20 LTS recommended)
- **npm:** v9.0.0 or later

### Common Commands
All commands should be executed from within the `client/` directory:

```bash
cd client

# Install dependencies
npm install

# Start Vite local development server (runs on http://localhost:5173)
npm run dev

# Run automated tests using Vitest
npm test

# Run ESLint to verify syntax and formatting rules
npm run lint

# Build production bundle to client/dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 2. Where to Look: Modifying Common Features

### 2.1. Adding a New Field to Tasks (e.g., `estimatedHours`)
When adding a new attribute to a task, update these files in order:

1. **Default Fixtures (`src/data/mockData.js`):**
   Add the default property to existing tasks in `tasks` array (e.g., `estimatedHours: 4`).
2. **Mock API (`src/services/mockApi.js`):**
   In `createTask(taskData)`:
   ```javascript
   estimatedHours: Number(taskData.estimatedHours) || 0,
   ```
   In `updateTask(taskId, updates)`:
   Ensure `updates` passes through to the stored object (already handled via `...updates`).
3. **Form Validation (Optional) (`src/utils/validators.js`):**
   If the new field is required or must adhere to boundaries, add checks to `validateTaskForm(values)`.
4. **Create Task Page (`src/pages/CreateTask.jsx`):**
   - Add the initial field to `values` state (`estimatedHours: ""`).
   - Add input element to the JSX layout within a `.form-group`.
5. **Task Detail Page (`src/pages/TaskDetail.jsx`):**
   - Add the field display and input/select to `.metadata-grid`.
   - Wire `onChange` to `updateTaskData({ estimatedHours: e.target.value })`.
6. **API Specification (`docs/07-api-endpoints.md`):**
   Update request and response schema examples to keep documentation in sync.
7. **Automated Tests (`src/tests/`):**
   Add a test case in `src/tests/uiFeatures.test.js` or `src/tests/mockApi.test.js` verifying the field saves and updates properly.

---

### 2.2. Changing Task Status Behavior
Current statuses are: `todo`, `in_progress`, and `done`.

- **To adjust status transition rules or timestamps:**
  Open `src/services/mockApi.js` under `updateTask(taskId, updates)`. Notice how `completedAt` is assigned when status transitions to `done` and removed if reopened.
- **To modify quick-move buttons on the Kanban board:**
  Open `src/pages/TaskList.jsx` inside the `.task-quick-actions` container (around line 200). Here, button conditions determine which actions appear (`Start →`, `Done →`, `← Todo`, `← Reopen`).
- **To alter the Status dropdown in task details:**
  Open `src/pages/TaskDetail.jsx` under `.metadata-grid` to edit the `<select>` options.

---

### 2.3. Modifying the Kanban UI / Board Layout
- **Column Configuration:** In `src/pages/TaskList.jsx`, inspect the `columns` object:
  ```javascript
  const columns = {
    todo: { title: "To Do", tasks: [] },
    in_progress: { title: "In Progress", tasks: [] },
    done: { title: "Done", tasks: [] },
  };
  ```
- **Card Badges & Members:** In `src/pages/TaskList.jsx`, inspect `.task-card-footer`, `.task-badges`, and `.task-card-members`.
- **Styling & Responsive Widths:** In `src/styles/TaskList.css`:
  - Column width (`.board-column`): default is `300px`.
  - Mobile responsiveness: under `@media (max-width: 768px)`, columns adapt horizontally (`min(82vw, 300px)`).

---

### 2.4. Changing Dashboard Statistics
- **Calculation Logic:** Open `src/services/mockApi.js` under `getDashboardStats()`. It aggregates:
  - `totalProjects`: length of projects list
  - `totalTasks`: length of task list
  - `doneTasks`: tasks with `status === "done"`
  - `inProgressTasks`: tasks with `status === "in_progress"`
  - `overdueTasks`: tasks with `status !== "done"` and `dueAt < now`
- **UI Display:** Open `src/pages/Dashboard.jsx` under `.dashboard-stats`. Each metric is rendered inside a `.stat-card`.

---

### 2.5. Switching or Changing API Behavior (Preparing for Backend Integration)
During Homework 3B, the frontend operates completely in mock mode.
- **Environment Flags:** Defined in `src/config/index.js` and `.env`:
  ```javascript
  export const config = {
    appName: import.meta.env.VITE_APP_NAME || "MANA - Student Task & Deadline Manager",
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
    useMockData: import.meta.env.VITE_USE_MOCK_DATA !== "false",
  };
  ```
- **Transitioning to Live Backend (Week 4):**
  When real backend endpoints from [07-api-endpoints.md](07-api-endpoints.md) become available:
  1. Set `VITE_USE_MOCK_DATA=false` in `.env`.
  2. Implement an HTTP API client (e.g., `src/services/apiClient.js` using `fetch`) that mirrors the method signatures of `mockApi.js`.
  3. Swap or route method calls in `src/services/` based on `config.useMockData`.

---

### 2.6. Adding and Updating Tests
Automated tests reside in `client/src/tests/`:
- `validators.test.js`: Tests for form validation functions.
- `mockApi.test.js`: Unit tests for mock API operations and data calculations.
- `workflow.test.js`: Full integration lifecycle test (Create → View → Update → Complete → Delete).
- `uiFeatures.test.js`: Tests for shared helpers, constants, checklist mutations, and project creation.

**To add a new test:**
Create or open the appropriate `.test.js` file and use standard Vitest syntax:
```javascript
import { describe, it, expect } from "vitest";

describe("My Feature", () => {
  it("should perform expected behavior", async () => {
    // Arrange, Act, Assert
  });
});
```
Run `npm test` to execute all suites.

---

## 3. Important Project Conventions & Best Practices

### 3.1. Prohibited Practices (Things to Avoid)
1. ❌ **Do NOT use `window.alert()` or `window.prompt()`:**
   Browser modal popups block JavaScript execution, disrupt UX, and are inaccessible. Always use the provided `<Toast />` component for notifications and inline inputs for user data collection.
2. ❌ **Do NOT pass comma-separated strings for Members or Labels:**
   `assigneeIds` and `labels` must **always** be string arrays (`string[]`). The mock API and upcoming backend expect array payloads.
3. ❌ **Do NOT directly access or mutate `localStorage` inside UI components:**
   Always invoke methods on `mockApi.js`. This guarantees that caching, fallbacks, and event sequencing remain uniform.
4. ❌ **Do NOT introduce heavy third-party UI component libraries:**
   Maintain the clean, lightweight Vanilla CSS design system. Do not install Tailwind, MUI, or Bootstrap without team consensus.

### 3.2. Recommended Conventions
1. ✅ **Reuse Shared Constants:**
   Always import `PREDEFINED_MEMBERS`, `PREDEFINED_LABELS`, `getLabelColor`, and `getStudentName` from `src/utils/constants.js`.
2. ✅ **Ensure High Contrast Styling:**
   Follow the established dark text on light background rule (`color: #172b4d` on `#ffffff` or `#f4f5f7`). Never rely on browser-default text colors that may invert in dark mode.
3. ✅ **Pass Toast Notifications via Route Navigation:**
   When navigating after an action (e.g. creating a task or project), pass toast metadata through `navigate(path, { state: { toast: { message, type: "success" } } })`. The destination page will automatically display and dismiss the toast.
4. ✅ **Run Linter Before Commits:**
   Ensure `npm run lint` exits cleanly with **0 errors and 0 warnings** before pushing code or creating commits.
