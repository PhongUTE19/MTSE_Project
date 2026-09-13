# 01 - Project Overview

**Application Name:** Student Task & Deadline Manager (MANA)  
**Repository:** `MTSE_Project`  
**Course:** New Technologies in Software Engineering  
**Current Milestone:** Homework 3B — Complete Frontend Prototype  

---

## 1. Project Purpose & Mission

**Student Task & Deadline Manager (MANA)** is a lightweight, responsive web application designed to help university students organize, track, and complete group project deliverables on time.

### The Problem
During semester coursework, student teams frequently struggle with:
- **Fragmented communication:** Task assignments and deadlines are scattered across chat groups, spreadsheets, or verbal agreements.
- **Unclear ownership:** Lack of visual transparency into who is responsible for each deliverable.
- **Missed deadlines:** Inability to monitor approaching or overdue deadlines across concurrent course projects.
- **Ambiguous completion criteria:** Lack of clear checklist items (acceptance criteria) for what defines "done" for a given task.

### The Solution
MANA provides an intuitive, centralized workspace tailored for academic team projects:
- High-level progress statistics across all active group projects.
- An interactive Kanban board showing task status, urgency, and assigned team members at a glance.
- Granular task detail views with direct inline editing and interactive acceptance criteria checklists.
- Quick, zero-friction status progression directly from the board.

---

## 2. Target Users

| User Persona | Role | Primary Goals in MANA |
|---|---|---|
| **Undergraduate Students** *(Primary)* | Team Members | View assigned tasks, monitor deadlines, check off acceptance criteria, and update work progress from "To Do" to "Done". |
| **Team Leaders / Group Coordinators** *(Primary)* | Project Organizers | Create projects, break down deliverables into tasks, assign group members, set deadlines, and monitor team workload. |
| **Course Instructors / TAs** *(Secondary)* | Evaluators | Review project progress, inspect task completion history, and evaluate team collaboration transparency. |

---

## 3. Core Features Implemented

### 3.1. Project Dashboard
- **Active Projects Overview:** Displays a filterable table of active projects, associated courses, deadlines, and direct links to each project's Kanban board.
- **Metric Cards:** Provides real-time aggregated counts for:
  - Total Projects
  - Total Tasks
  - Completed Tasks ("Done")
  - Overdue Tasks (uncompleted tasks whose deadline has passed)

### 3.2. Project Kanban Board
- **Three-Column Workflow:** Segregates tasks into `To Do`, `In Progress`, and `Done`.
- **Informative Task Cards:**
  - **Color-Coded Labels:** Category badges (e.g., Planning, Frontend, Backend, UI/UX, Testing, Bug) with deterministic color hashing.
  - **Deadline Badges:** Visual indicators formatting due dates, highlighted with status-based styling (green for completed, red for overdue).
  - **Checklist Counters:** Compact progress indicator (e.g., `☑️ 2/3`) showing acceptance criteria completion.
  - **Assigned Member Avatars:** Circular avatar badges displaying student initials with hover tooltips showing full student names and student IDs (MSSV).
  - **One-Click Quick Actions:** Quick status transition buttons (`Start →`, `← Todo`, `Done →`, `← Reopen`) to update task states without opening detail views.

### 3.3. Task Creation Flow
- Modal-style form accessible from project headers or column-specific `+ Add a card` triggers.
- **Field Validation:** Real-time and blur-triggered validation ensuring required titles (>= 3 chars) and non-past deadlines.
- **Dropdown/Popover Pickers:**
  - **Members Picker:** Dropdown popup with student avatars, full names, and MSSV for multi-select assignment. Selected members render as interactive chips with removal buttons.
  - **Labels Picker:** Dropdown popup with color-coded tags for multi-select categorization. Selected labels render as badges with removal buttons.
- **Acceptance Criteria Definition:** Text area supporting multi-line criterion entry, automatically converted into checklist items.

### 3.4. Task Detail & Acceptance Criteria
- Full detail modal displaying title, parent project, and metadata grid (Status, Priority, Start Date, Due Date, Reminder Interval).
- **Direct Editing:** Click-to-edit title and description with inline Save and Cancel actions.
- **Sidebar Dropdown Controls:** Instant member and label toggling via popover menus.
- **Interactive Acceptance Criteria:**
  - Dynamic percentage progress bar recalculating automatically upon checkbox toggles.
  - In-app inline item input (`+ Add an item`) replacing browser prompts.
  - Inline title editing (`✏️`) and item deletion (`❌`).
- **Task Deletion:** Safe task removal with confirmation dialog and redirection to the board.

### 3.5. Project Creation Flow
- Accessible from the global navbar (`+ Create Project`).
- Creates new course project spaces with project name validation, course title, description, and deadline.

### 3.6. In-App Feedback & Notifications
- Replaced intrusive browser alerts (`window.alert()`) with a lightweight, animated in-app `Toast` system.
- Provides auto-dismissing (3-second) success and error banners during task and project operations.

### 3.7. Offline & Client-Side Persistence
- Uses a simulated REST client (`mockApi.js`) backed by browser `localStorage`.
- Seed data (`mockData.js`) seeds initial projects, tasks, and student members upon first launch.
- All additions, edits, moves, and deletions persist across page reloads and browser sessions.

---

## 4. Application Route Map

| Route URL | Page Component | Description |
|---|---|---|
| `/` | Redirect | Automatically redirects to `/dashboard`. |
| `/dashboard` | `Dashboard.jsx` | Overview of projects and aggregate task metrics. |
| `/tasks` | `TaskList.jsx` | Kanban board for a selected project (defaults to team board). |
| `/tasks/new` | `CreateTask.jsx` | Modal form to create a new task within a project. |
| `/tasks/:taskId` | `TaskDetail.jsx` | Modal detail view for inspecting and editing a task. |
| `/projects/new` | `CreateProject.jsx` | Modal form to create a new course project. |
| `*` | Redirect | Wildcard fallback redirecting back to `/dashboard`. |

---

## 5. Technology Stack Summary

- **UI Library:** React 19 (`react`, `react-dom`)
- **Build Tool & Dev Server:** Vite 8
- **Client Routing:** React Router v7 (`react-router-dom`)
- **Styling:** Vanilla CSS with scoped modular structure per component/page
- **Testing Framework:** Vitest 5 (`vitest`)
- **Code Quality:** ESLint 10 with React Hooks and React Refresh plugins
