# 02 - Frontend Architecture & Data Flow

This document details the architectural structure, design patterns, component relationships, and data workflows of the **Student Task & Deadline Manager (MANA)** frontend prototype implemented for Homework 3B.

---

## 1. High-Level Architectural Pattern

The application follows a decoupled **Client-Side Single Page Application (SPA)** architecture, emphasizing separation of concerns between presentation, mock service abstraction, and local persistence.

```
┌─────────────────────────────────────────────────────────────┐
│                       Presentation Layer                    │
│   Pages (Dashboard, TaskList, TaskDetail, CreateTask, ...)  │
│   Components (Navbar, Toast, TaskListStates)                │
└──────────────────────────────┬──────────────────────────────┘
                               │ Async Service Calls
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Abstraction                     │
│                  src/services/mockApi.js                    │
│  - Simulated Latency (~150ms in browser, 0ms in test)       │
│  - Data Validation, ID Generation, Timestamps               │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            │ Cache Hit / Write                   │ Fallback Initialization
            ▼                                     ▼
┌───────────────────────────────┐   ┌─────────────────────────┐
│       Persistence Layer       │   │     Seed Data Layer     │
│      window.localStorage      │   │ src/data/mockData.js    │
│  (mana_projects, mana_tasks,  │   │ (Immutable default      │
│          mana_students)       │   │  fixtures for reset)    │
└───────────────────────────────┘   └─────────────────────────┘
```

### Architectural Principles
1. **Separation of Presentation and Data Access:** UI components never directly mutate raw storage or manipulate arrays in `localStorage`. All data interactions flow through the `mockApi` service interface, mimicking real RESTful HTTP calls.
2. **Predictable State Hydration:** Data is loaded asynchronously in `useEffect` hooks, allowing components to cleanly transition through Loading, Success, Empty, and Error states.
3. **Optimistic & Fast Local Feedback:** User actions trigger prompt feedback (via state updates and Toast notifications) while the mock API handles serialization in the background.
4. **Backend Readiness:** `mockApi.js` models the exact REST endpoints documented in [07-api-endpoints.md](07-api-endpoints.md), making future replacement with `fetch`/`axios` straightforward.

---

## 2. Directory & File Organization

The project is structured under `client/` as follows:

```text
client/
├── src/
│   ├── components/             # Reusable presentation components
│   │   ├── Navbar.jsx          # Global navigation bar & header
│   │   ├── Toast.jsx           # In-app animated notification banner
│   │   └── TaskListStates.jsx  # Loading, Empty, and Error UI state views
│   │
│   ├── pages/                  # Routed page containers
│   │   ├── Dashboard.jsx       # Project metrics & active project list
│   │   ├── TaskList.jsx        # Project Kanban board (To Do, In Progress, Done)
│   │   ├── TaskDetail.jsx      # Task detail view, metadata & acceptance criteria
│   │   ├── CreateTask.jsx      # Task creation modal with dropdown member/label pickers
│   │   └── CreateProject.jsx   # Project creation modal
│   │
│   ├── services/               # Data layer & external interfaces
│   │   └── mockApi.js          # Simulated async REST API with localStorage backend
│   │
│   ├── data/                   # Default fixtures
│   │   └── mockData.js         # Initial mock projects, tasks, and student profiles
│   │
│   ├── utils/                  # Shared utilities & constants
│   │   ├── constants.js        # Predefined members, labels, color hasher, student helper
│   │   └── validators.js       # Pure validation functions for forms
│   │
│   ├── config/                 # Environment configuration
│   │   └── index.js            # Centralized config reader (VITE_APP_NAME, VITE_API_BASE_URL)
│   │
│   ├── styles/                 # Scoped stylesheets matching component/page names
│   │   ├── App.css
│   │   ├── CreateTask.css
│   │   ├── Dashboard.css
│   │   ├── Navbar.css
│   │   ├── TaskDetail.css
│   │   ├── TaskList.css
│   │   ├── TaskListStates.css
│   │   └── Toast.css
│   │
│   ├── tests/                  # Automated test suites (Vitest)
│   │   ├── mockApi.test.js     # Unit tests for mock API CRUD operations
│   │   ├── uiFeatures.test.js  # Integration tests for UI helpers, constants & contracts
│   │   ├── validators.test.js  # Unit tests for form validation rules
│   │   └── workflow.test.js    # End-to-end integration lifecycle test
│   │
│   ├── App.jsx                 # Route definitions (<BrowserRouter>, <Routes>)
│   ├── main.jsx                # Application root mount point
│   └── index.css               # Global typography, color tokens, and base layout resets
│
├── .env.example                # Sample environment variables
├── package.json                # Project dependencies and npm scripts
└── vite.config.js              # Vite configuration with React plugin and test setup
```

---

## 3. Component, Service & Storage Relationships

### 3.1. How UI Components Interact with `mockApi.js`
- Components do not import raw JSON data from `mockData.js` directly for display. Instead, they call async methods on `mockApi`:
  - `mockApi.getProjects()`
  - `mockApi.getProjectById(projectId)`
  - `mockApi.createProject(data)`
  - `mockApi.deleteProject(projectId)`
  - `mockApi.getTasks(projectId)`
  - `mockApi.getTaskById(taskId)`
  - `mockApi.createTask(data)`
  - `mockApi.updateTask(taskId, updates)`
  - `mockApi.deleteTask(taskId)`
  - `mockApi.getStudents()`
  - `mockApi.getDashboardStats()`
- Methods return Promises, allowing components to use standard `.then()/.catch()` or `async/await` syntax.
- Components maintain their own local UI state (e.g. form fields, open/close status of dropdown menus, active edit mode).

### 3.2. How `mockApi.js` Interacts with `localStorage`
- `mockApi.js` manages three distinct storage keys:
  - `mana_projects`
  - `mana_tasks`
  - `mana_students`
- On every read request, `mockApi.readCollection(key, defaultData)` checks `window.localStorage`. If no entry exists, it writes the default data from `mockData.js` into `localStorage` and returns it.
- On every write request (`createTask`, `updateTask`, `deleteTask`, `createProject`, `deleteProject`), `mockApi.writeCollection(key, data)` serializes the updated collection back to `localStorage`.
- **In-Memory Fallback:** If `localStorage` is disabled or unavailable (such as inside headless testing environments or private browsing restrictions), `mockApi` automatically diverts read/write operations to an internal `inMemoryStorage` object without throwing runtime errors.

### 3.3. The Role of `mockData.js`
- Acts strictly as **read-only seed fixtures**.
- Ensures that every new user session or automated test (via `mockApi.resetMockData()`) can restore the application to a consistent baseline.

---

## 4. Key Workflows & Data Flows

### 4.1. Loading Dashboard & Task Data
- **Why:** Provide up-to-date metrics and board status without blocking the UI rendering.
- **Where:** `src/pages/Dashboard.jsx` and `src/pages/TaskList.jsx`.
- **How:**
  1. Component mounts; an `isMounted` flag is established inside `useEffect`.
  2. `Dashboard` initiates `Promise.all([mockApi.getProjects(), mockApi.getDashboardStats()])`.
  3. `TaskList` initiates `Promise.all([mockApi.getTasks(projectId), mockApi.getStudents()])`.
  4. While pending, `TaskList` renders `<LoadingState />`.
  5. Upon resolution, state is populated: tasks are categorized into columns (`todo`, `in_progress`, `done`) and students are mapped for avatar rendering. If no tasks exist, `<EmptyState />` renders. If an error occurs, `<ErrorState />` displays with a retry trigger.

### 4.2. Creating a Task
- **Why:** Allow team members to capture deliverables with assignees, labels, and acceptance criteria.
- **Where:** `src/pages/CreateTask.jsx` → `src/services/mockApi.js` → `src/pages/TaskList.jsx`.
- **How:**
  1. User enters task data. Assignees and labels are picked through dropdown popovers and stored directly as arrays (`assigneeIds: string[]`, `labels: string[]`).
  2. Upon submit, `validateTaskForm(values)` verifies `title` and `deadline`.
  3. Form parses newline-separated acceptance criteria into checklist objects (`{ id, title, completed: false }`).
  4. `mockApi.createTask(payload)` prepends the task to the storage collection with a generated ID (`task-<timestamp>`), ISO timestamps (`createdAt`, `updatedAt`), and defaults.
  5. The form navigates back to `/tasks` passing a toast payload in route state (`{ state: { toast: { message, type: "success" } } }`).
  6. `TaskList` reads the navigation state on mount and displays the green `<Toast />`.

### 4.3. Updating Task Status
- **Why:** Enable rapid movement through the workflow stages (To Do → In Progress → Done).
- **Where:** Quick action buttons on task cards in `TaskList.jsx` or the Status `<select>` in `TaskDetail.jsx`.
- **How:**
  1. User clicks a transition button (e.g. `Start →` or `Done →`).
  2. The handler stops click propagation and calls `mockApi.updateTask(taskId, { status: nextStatus })`.
  3. In `mockApi.js`, if status becomes `done`, `completedAt` is automatically stamped with the current ISO time; if reopened, `completedAt` is removed.
  4. The returned updated task replaces the previous item in the local `state.data` array, instantly moving the card to the target column without a full page reload.

### 4.4. Editing Task Details & Acceptance Criteria
- **Why:** Allow iterative refinement of deliverables and tracking of checklist progress.
- **Where:** `src/pages/TaskDetail.jsx`.
- **How:**
  1. **Description / Title Editing:** User clicks title or description to activate inline text editing. On save or blur, `updateTaskData({ title })` or `updateTaskData({ description })` persists the changes.
  2. **Acceptance Criteria Items:**
     - **Add an Item:** User clicks `+ Add an item`. An inline input form displays. Typing a criterion and pressing `Enter` or clicking `Add` appends `{ id: "check-<timestamp>", title, completed: false }` to the task's `checklist` array.
     - **Toggle Completion:** Clicking a checklist checkbox flips `completed: true/false`. The progress percentage bar immediately recalculates (`done / total * 100`).
     - **Inline Edit Item:** Clicking the `✏️` icon toggles an inline input field, replacing `window.prompt`.
     - **Delete Item:** Clicking `❌` removes the item from the checklist array.
  3. Every checklist modification calls `mockApi.updateTask(task.id, { checklist: updatedChecklist })`, updating `localStorage`.

### 4.5. Deleting a Task
- **Why:** Permit cleanup of obsolete or duplicate cards.
- **Where:** `src/pages/TaskDetail.jsx` (Actions sidebar).
- **How:**
  1. User clicks `🗑️ Delete Task`.
  2. A native `window.confirm` modal asks for confirmation.
  3. If confirmed, `mockApi.deleteTask(task.id)` removes the record from the stored task array.
  4. The component redirects to `/tasks` passing `{ state: { toast: { message: "Task deleted successfully.", type: "success" } } }`.

### 4.6. Persistence After Page Reload
- **Why:** Ensure user edits, new tasks, and completed criteria are retained across browser refreshes and navigation sessions without an active backend.
- **Where:** `src/services/mockApi.js` with browser `localStorage`.
- **How:**
  1. Whenever any mutation function (`createTask`, `updateTask`, `deleteTask`, `createProject`) executes, it updates the in-memory array and immediately invokes `writeCollection(STORAGE_KEYS.TASKS, allTasks)`.
  2. `writeCollection` runs `window.localStorage.setItem(key, JSON.stringify(data))`.
  3. When the user reloads the page or navigates between routes, `readCollection` parses the JSON string from `localStorage`.
  4. If a team member needs to reset all data back to original fixtures, calling `mockApi.resetMockData()` restores initial arrays from `mockData.js`.

---

## 5. Summary Matrix of Architecture & Data Responsibility

| Responsibility | Handled By | Storage / Source | Key Contract |
|---|---|---|---|
| **Routing** | `src/App.jsx` | React Router v7 | URL paths to Page components |
| **Validation** | `src/utils/validators.js` | Pure JS | Returns error message map `{ title?, deadline? }` |
| **Constants & Pickers** | `src/utils/constants.js` | In-memory | `PREDEFINED_MEMBERS`, `PREDEFINED_LABELS`, `getLabelColor` |
| **Data Access** | `src/services/mockApi.js` | `localStorage` / memory | Async Promises with standard REST schema |
| **Initial Fixtures** | `src/data/mockData.js` | Static JS module | 3 students, 2 projects, 11 tasks |
| **Notifications** | `src/components/Toast.jsx` | React state + route state | Auto-dismissing banners (success/error) |
| **API Specifications** | `docs/07-api-endpoints.md` | Documentation | Reference contract for Week 4 backend implementation |
