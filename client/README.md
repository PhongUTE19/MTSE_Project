# 🚀 Client - Student Task & Deadline Manager (MANA)

Frontend prototype built with **React 18/19 + Vite + React Router v7**.

---

## 1. Quick Start Guide

### Prerequisites
- **Node.js** >= 18 (Tested on Node v22.15.0)
- **npm** >= 9

### Installation
From the root repository or inside `client/`:
```bash
cd client
npm install
```

### Running the Development Server
```bash
npm run dev
```
Open your browser at: [http://localhost:5173](http://localhost:5173)

---

## 2. Configuration & Environment Variables

Configuration is centralized in `src/config/index.js` and loaded via Vite environment variables:

| Variable | Default Value | Description |
|---|---|---|
| `VITE_APP_NAME` | `"MANA - Student Task & Deadline Manager"` | Application display name |
| `VITE_API_BASE_URL` | `http://localhost:5000/api/v1` | Backend API base URL for Week 4 integration |
| `VITE_USE_MOCK_DATA` | `true` | `true`: Uses mock API + localStorage; `false`: Uses real backend |

### Configuration files:
- **`.env.example`**: Template showing available variables and sample values.
- **`.env`**: Local active environment variables (pre-configured for Homework 3B).
- **`src/config/index.js`**: Application configuration wrapper module.

---

## 3. Running Automated Tests

Run the Vitest test suite:
```bash
npm test
```

This runs 12 automated unit and integration tests across:
1. `src/tests/validators.test.js` - Form validation edge cases.
2. `src/tests/mockApi.test.js` - CRUD operations and dashboard metrics.
3. `src/tests/workflow.test.js` - End-to-end user lifecycle test.

---

## 4. Linting & Building

- **Run ESLint:**
  ```bash
  npm run lint
  ```
- **Build production bundle:**
  ```bash
  npm run build
  ```
- **Preview production build:**
  ```bash
  npm run preview
  ```

---

## 5. Architecture & Mock API Service

- **`src/services/mockApi.js`**: Provides Promise-based async methods mimicking the REST API contract (`getProjects`, `getTasks`, `getTaskById`, `createTask`, `updateTask`, `deleteTask`, `getDashboardStats`).
- **Persistence:** Syncs to browser `localStorage` under `mana_tasks` and `mana_projects`, retaining changes across browser reloads, with automatic fallback to `src/data/mockData.js`.
- **API Contract:** Refer to `../docs/07-api-endpoints.md` for full request/response schemas.
