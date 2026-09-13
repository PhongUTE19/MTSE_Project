# 🧪 Acceptance Tests & Verification Evidence

**Project:** Student Task & Deadline Manager (MANA)  
**Milestone:** Homework 3B — Complete Frontend Prototype  

---

## 1. Automated Test Suite Summary

Automated tests are implemented using [Vitest](https://vitest.dev/) directly in `client/`.

To run automated tests:
```bash
cd client
npm test
```

### Test Results
```text
 ✓ src/tests/validators.test.js (6 tests)
 ✓ src/tests/mockApi.test.js (5 tests)
 ✓ src/tests/workflow.test.js (1 test)

 Test Files  3 passed (3)
      Tests  12 passed (12)
   Duration  711ms
```

| Test Suite File | Test Cases | Objective | Result |
|---|---|---|---|
| `src/tests/validators.test.js` | 6 | Verifies title (empty, <3 chars, valid) and deadline (missing, past, valid format) validation | ✅ PASS |
| `src/tests/mockApi.test.js` | 5 | Verifies mock CRUD operations: list, get by ID, create, update status/checklist, delete, and dashboard calculations | ✅ PASS |
| `src/tests/workflow.test.js` | 1 (End-to-End) | Simulates full user lifecycle: Create Task → Board View → In Progress → Checklist Complete → Done → Delete | ✅ PASS |

---

## 2. Documented Manual Acceptance Scenarios

### 📋 Scenario 1: Main Project Workflow — Task Creation & Kanban Board Sync

- **Goal:** Verify that a user can create a new task with acceptance criteria and see it immediately reflected in the Kanban board.
- **Prerequisites:** Dev server running at `http://localhost:5173`.

#### Steps:
1. Open browser at `http://localhost:5173`.
2. On the **Dashboard**, locate project *"Student Task & Deadline Manager"* and click **"View Board"**.
3. On the Kanban Board, click **"+ Add Task"** at the top right (or **"+ Add a card"** under *To Do*).
4. Fill in the form:
   - **Title:** `Hoàn thành báo cáo tiến độ tuần 3`
   - **Description:** `Tổng hợp các commit và tài liệu hướng dẫn chạy prototype.`
   - **Deadline:** Choose a future date (e.g., `2026-10-01 17:00`).
   - **Priority:** `High`.
   - **Members:** `student-1, student-2`.
   - **Labels:** `Report, Frontend`.
   - **Acceptance Criteria:**
     ```text
     Viết tài liệu API
     Chạy test tự động
     ```
5. Click **"Create Task"**.

#### Expected Results:
- Alert pops up: `"Task created! (mock)"`.
- User is navigated back to `/tasks`.
- The new task card appears under the **To Do** column.
- The card displays labels (`Report`, `Frontend`), due date badge (`📅 01/10`), and checklist badge (`☑️ 0/2`).
- Navigating to **Dashboard** shows the "Total Tasks" count has increased by 1.

---

### 📋 Scenario 2: Quick Status Transitions on Kanban Board

- **Goal:** Verify that users can smoothly transition tasks across columns directly on the Kanban board without having to open the details modal.

#### Steps:
1. From `/tasks`, locate any task in the **To Do** column (e.g. the task created in Scenario 1).
2. Click the **"Start →"** button on the bottom of the card.
3. Observe the card moves immediately to the **In Progress** column.
4. On the same card in **In Progress**, click **"Done →"**.
5. Observe the card moves immediately to the **Done** column and the due date badge turns green.
6. Click **"← Reopen"** to return it to **In Progress** if needed.

#### Expected Results:
- State transitions execute instantly and smoothly.
- Card correctly switches columns (*To Do* → *In Progress* → *Done*).
- Status changes persist upon refreshing the page (via `mockApi` localStorage synchronization).

---

### 📋 Scenario 3: Task Detail Management & Acceptance Criteria Progress

- **Goal:** Verify editing title, description, checklist items, and progress bar visualization.

#### Steps:
1. On `/tasks`, click on a task card (e.g., `task-1`).
2. The modal view opens with route `/tasks/task-1`.
3. Click the checkbox next to one of the checklist items under **Acceptance Criteria**.
4. Observe the progress bar and percentage update (e.g., from `0%` to `50%` or `100%`).
5. Click **"Add an item"**, enter `Kiểm tra trên mobile`, and confirm.
6. Click the **Edit** button under **Description**, update text, and click **"Save"**.
7. Click the **"✕"** button at the top right to close the detail view.

#### Expected Results:
- Checklist updates re-calculate percentage and progress bar fill color (turns green at 100%).
- Card on the Kanban board reflects the updated checklist count (e.g., `1/2`).
- Changes are persisted.

---

### 📋 Scenario 4: Delete Task & Complete Removal Verification

- **Goal:** Verify that a user can safely delete a task and confirm its removal across all screens and stats.

#### Steps:
1. Open the detail view of any task to be removed.
2. In the right-hand sidebar under **Actions**, click **"🗑️ Delete Task"**.
3. A confirmation dialog appears asking: `"Are you sure you want to delete task ...?"`.
4. Click **OK**.
5. User is redirected back to `/tasks`.

#### Expected Results:
- Alert notifies `"Task deleted successfully."`.
- The task is completely removed from its Kanban column.
- Returning to the **Dashboard** reveals that "Total Tasks" (and "Tasks Done" if applicable) has decremented accordingly.
- Refreshing the browser confirms the deletion is permanent.

---

### 📋 Scenario 5: Form Validation & Error States

- **Goal:** Verify that invalid form submissions are blocked with clear feedback.

#### Steps:
1. Click **"+ Create"** in the sidebar navigation (`/tasks/new`).
2. Leave the form completely empty and click **"Create Task"**.
3. Observe red error messages:
   - Title: `"Title is required."`
   - Deadline: `"Deadline is required."`
4. Type `ab` in the title field and blur:
   - Error changes to: `"Title must be at least 3 characters."`
5. Select a date from last year (e.g., `2020-01-01`):
   - Error displays: `"Deadline cannot be in the past."`
6. The form is prevented from submitting until valid inputs are provided.

#### Expected Results:
- Errors display inline under the appropriate input fields.
- No task is created or added to state while validation fails.
