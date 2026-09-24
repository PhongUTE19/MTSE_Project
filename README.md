# MTSE_Project

# 📘 Hướng dẫn sử dụng & Quá trình làm bài 3A

**Student Task & Deadline Manager — MTSE_Project**

> **Môn:** New Technology  
> **Bài tập:** 3A — Implement main navigation, essential screens, và form validation  
> **Stack:** React 18 + Vite + react-router-dom  
> **Vị trí code:** `D:\new tech\MTSE_Project\client\`

---

## 📑 Mục lục

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Cài đặt & chạy dự án](#2-cài-đặt--chạy-dự-án)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Các màn hình & chức năng](#4-các-màn-hình--chức-năng)
5. [Mock data & UI States](#5-mock-data--ui-states)
6. [Quá trình triển khai theo giai đoạn](#6-quá-trình-triển-khai-theo-giai-đoạn)
7. [AI Usage Log](#7-ai-usage-log)

---

## 1. Tổng quan dự án

### 1.1. Mục tiêu

Ứng dụng hỗ trợ **sinh viên quản lý công việc nhóm, thành viên và deadline** trong các project môn học.

### 1.2. Target users

- **Primary:** Sinh viên làm bài tập nhóm
- **Secondary:** Giảng viên / trưởng nhóm theo dõi tiến độ

### 1.3. Chức năng chính (theo mock data)

- **Project:** Tên, mô tả, deadline, thành viên
- **Task:** Tiêu đề, mô tả, status, priority, deadline, assignee, labels, checklist
- **Calendar:** Sự kiện deadline, meeting, presentation
- **Member:** Danh sách sinh viên trong nhóm
- **Reminder:** Nhắc nhở trước deadline

### 1.4. Tech stack

| Layer | Công nghệ |
|---|---|
| Frontend | React 18 + Vite |
| Routing | react-router-dom |
| Styling | Inline style + CSS file |
| State | useState, useEffect |
| Mock data | `src/data/mockData.js` |
| Backend | Node.js (sẽ làm sau) |

---

## 2. Cài đặt & chạy dự án

### 2.1. Yêu cầu môi trường

- **Node.js** >= 18
- **npm** >= 9
- **Git** (khuyến nghị)

### 2.2. Cài đặt

```bash
# Clone repo
git clone <URL_repo>

cd MTSE_Project

# Vào thư mục client
cd client

# Cài dependencies
npm install
```

### 2.3. Chạy dev server

```bash
npm run dev
```

Mở trình duyệt: http://localhost:5173

### 2.4. Build production

```bash
npm run build
npm run preview
```

---

## 3. Cấu trúc thư mục

```text
MTSE_Project/
├── client/                              ← React app
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               ← Thanh điều hướng
│   │   │   └── TaskListStates.jsx       ← Loading/Empty/Error states
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx             ← Thống kê
│   │   │   ├── TaskList.jsx              ← Kanban board
│   │   │   ├── TaskDetail.jsx            ← Chi tiết task
│   │   │   └── CreateTask.jsx             ← Form tạo task
│   │   ├── data/
│   │   │   └── mockData.js               ← Mock data
│   │   ├── utils/
│   │   │   └── validators.js             ← Validation logic
│   │   ├── styles/
│   │   │   ├── TaskList.css
│   │   │   └── TaskListStates.css
│   │   ├── App.jsx                       ← Router config
│   │   ├── main.jsx                      ← Entry point
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   ├── 06-ai-usage-log.md                ← Log AI usage
│   └── 03-huong-dan-su-dung-va-qua-trinh.md ← File này
│
├── package.json                           ← (cũ, có thể giữ cho backend sau)
└── README.md
```

---

## 4. Các màn hình & chức năng

### 4.1. Main Navigation (Navbar)

**File:** `src/components/Navbar.jsx`

- Hiển thị trên mọi route (đặt ngoài `<Routes>` trong `App.jsx`)
- 3 link: **Dashboard / Task List / + Create Task**
- Active link: in đậm + màu xanh `#0056b3`
- Không active: màu xám `#333`

### 4.2. Routing (App.jsx)

| URL | Component | Mô tả |
|---|---|---|
| `/` | redirect | Chuyển về `/dashboard` |
| `/dashboard` | Dashboard | Thống kê task |
| `/tasks` | TaskList | Kanban board 3 cột |
| `/tasks/new` | CreateTask | Form tạo task |
| `/tasks/:taskId` | TaskDetail | Chi tiết task |
| `*` | redirect | Về `/dashboard` |

### 4.3. Screen 1 — Dashboard

**File:** `src/pages/Dashboard.jsx`

Hiển thị tên project và 4 StatCard:

- **Total (xanh dương):** tổng số task
- **Done (xanh lá):** task có `status === "done"`
- **In Progress (vàng):** task có `status === "in_progress"`
- **Overdue (đỏ):** task có `status !== "done"` và `dueAt < now`

Nếu không có task → hiện **"No tasks yet."**

### 4.4. Screen 2 — Task List (Kanban Board)

**File:** `src/pages/TaskList.jsx`

Có 3 cột:

- To Do
- In Progress
- Done

Mỗi task hiển thị:

- Labels (nếu có) với màu hash
- Title
- Badges: deadline (📅), checklist progress (☑️)
- Badge đổi màu theo trạng thái: done (xanh), overdue (đỏ), all-checked (xanh)
- Nút **"+ Add Task"** góc phải trên
- Nút **"+ Add a card"** ở mỗi cột

Có 4 UI states:

1. Loading
2. Success
3. Empty
4. Error

### 4.5. Screen 3 — Task Detail

**File:** `src/pages/TaskDetail.jsx`

- Link **"← Back to list"**

**Metadata:**

- Status
- Priority
- Start, Due (format `toLocaleString()`)
- Assignees (map từ `assigneeIds` → tên student)
- Labels
- Reminder (format "1 ngày trước", "X giờ trước", "X phút trước")

**Checklist:**

- Progress text: `X/Y (Z%)`
- Progress bar: xanh `#28a745`, nền `#eee`
- Từng item: ✅ (done) / ⬜ (chưa)

Nếu không tìm thấy task:

> **"Task not found"** + link Back

### 4.6. Screen 4 — Create Task Form

**File:** `src/pages/CreateTask.jsx`

| Field | Type | Validation |
|---|---|---|
| Title | text | Required, ≥ 3 ký tự |
| Description | textarea | Không validate |
| Deadline | datetime-local | Required, không quá khứ |
| Priority | select | Low / Medium / High |

**Behavior:**

- Validate khi blur field (không phải khi gõ)
- Hiển thị lỗi đỏ dưới field
- Submit hợp lệ → alert + chuyển về `/tasks`
- Submit lỗi → không gửi, hiện lỗi

---

## 5. Mock data & UI States

### 5.1. Mock data (`src/data/mockData.js`)

Export 5 objects:

| Export | Mô tả | Số lượng |
|---|---|---:|
| `students` | Sinh viên | 3 |
| `projects` | Project | 1 |
| `tasks` | Task | 11 |
| `calendarEvents` | Sự kiện | 4 |
| `taskListStates` | UI states mẫu | 4 |

### 5.2. Task object — các field

```js
{
  id: "task-1",
  projectId: "project-1",
  title: "Lên ý tưởng project",
  description: "...",
  assigneeIds: ["student-3"],
  status: "done",              // todo | in_progress | done
  priority: "high",            // low | medium | high
  startAt: "2026-09-07T08:00:00+07:00",
  dueAt: "2026-09-07T23:59:00+07:00",
  labels: ["Planning"],
  checklist: [
    { id: "check-1-1", title: "...", completed: true }
  ],
  reminderMinutesBefore: [1440],
  createdBy: "student-3",
  createdAt: "...",
  updatedAt: "...",
  completedAt: "..."
}
```

### 5.3. UI States (`src/components/TaskListStates.jsx`)

| State | Component | Trigger |
|---|---|---|
| Loading | `<LoadingState />` | `status === "loading"` |
| Success | Render list | `status === "success"` + có data |
| Empty | `<EmptyState onCreate={...} />` | `data.length === 0` |
| Error | `<ErrorState message={...} onRetry={...} />` | `status === "error"` |

### 5.4. Cách test 4 states

| State | Cách test | Revert |
|---|---|---|
| Loading | Đổi `setTimeout(..., 500)` → `5000` | Đổi về `500` |
| Empty | Đổi `data: mockTasks` → `data: []` | Đổi về `mockTasks` |
| Error | Thêm `throw new Error("Test")` vào đầu `try` | Xóa dòng `throw` |
| Success | Mặc định | — |

---

## 6. Quá trình triển khai theo giai đoạn

### Giai đoạn 0 — Setup ✅

- ☑ Tạo Vite React trong `client/`
- ☑ Chọn ESLint làm linter
- ☑ Cài `react-router-dom`
- ☑ Copy mock data vào `src/data/mockData.js`
- ☑ Tạo cấu trúc `components/`, `pages/`, `data/`, `utils/`, `styles/`

### Giai đoạn 1 — Main Navigation ✅

| Task | File | Trạng thái |
|---|---|---|
| T1.1 Cấu hình Router | `src/App.jsx` | ✅ |
| T1.2 Tạo Navbar | `src/components/Navbar.jsx` | ✏️ |
| T1.2b 4 placeholder pages | `src/pages/*.jsx` | ✅ |
| T1.3 Test chuyển route | — | ✅ 7/7 pass |

**Deliverable:** Navbar có 3 link, click chuyển route OK.

### Giai đoạn 2 — 3 Essential Screens ✅

| Task | File | Trạng thái |
|---|---|---|
| T2.1 + 2.2 Dashboard thống kê | `src/pages/Dashboard.jsx` | ✅ |
| T2.3 + 2.4 Task List | `src/pages/TaskList.jsx` | ✏️ |
| T2.5 + 2.6 + 2.7 Task Detail | `src/pages/TaskDetail.jsx` | ✏️ |

**Deliverable:** 3 màn hình hoạt động, chuyển qua lại OK.

**Kết quả test:**

- Dashboard: Total=11, Done=2, In Progress=2, Overdue=0
- TaskList: loading → Kanban board 3 cột
- TaskDetail: task-1 (3/3), task-3 (3/5), task-999 (not found)

### Giai đoạn 3 — Form Create Task + Validation ✅

| Task | File | Trạng thái |
|---|---|---|
| T3.1 Validator | `src/utils/validators.js` | ✏️ |
| T3.2 Form | `src/pages/CreateTask.jsx` | ✏️ |
| T3.3 Test validation | — | ✅ 5/5 pass |

**Validation rules:**

- Title: required, ≥ 3 ký tự
- Deadline: required, không quá khứ

**5 test case:**

1. Form rỗng → lỗi 2 field
2. Title `"ab"` → lỗi < 3 ký tự
3. Title `"abc"` + deadline rỗng → lỗi deadline
4. Deadline 2020 → lỗi quá khứ
5. Tất cả OK → alert + navigate

### Giai đoạn 4 — UI States ✅

| Task | File | Trạng thái |
|---|---|---|
| T4.1 Tạo component states | `src/components/TaskListStates.jsx` | ✏️ |
| T4.2 Áp dụng vào TaskList | `src/pages/TaskList.jsx` | ✅ |
| T4.3 Test Loading | — | ✅ |
| T4.4 Test Empty | copy file mockDataforEmptyTask thay cho mocData.js sau do load lai trang taskList | ✅ |
| T4.5 Test Error | them dong throw new Error("Test error"); vao vi tri nay trong file TaskList.jsx | ✅ |

useEffect(() => {
  const timer = setTimeout(() => {
    try {
      throw new Error("Test error");  // ← THÊM DÒNG NÀY
      setState({ status: "success", data: mockTasks, error: null });
    } catch (error) {
      setState({
        status: "error",
        data: null,
        error: { message: "Unable to load tasks." },
      });
    }
  }, 500);

  return () => clearTimeout(timer);
}, []);

**Deliverable:** TaskList hiển thị đúng 4 state.

---

## 7. AI Usage Log

### 7.1. Quy ước

- **AI tool:** Công cụ AI dùng (GitHub gemeni 3.1 pro, ChatGPT, Claude...)
- **AI Generated:** File/nội dung AI tạo
- **Human review:** Người đọc, hiểu, test, chỉnh sửa
- **Trạng thái:** ✅ Đã review | ✏️ Đã chỉnh sửa | ⏳ Chưa review

# Đọc thư mục docs cho chi tiết sử dụng AI và Human Review

---

## 8. Bài tập 3B — Complete Frontend Prototype ✅

### 8.1. Tóm tắt kết quả đạt được theo yêu cầu 3B

| Yêu cầu 3B | Cách triển khai | Vị trí minh chứng |
|---|---|---|
| **1. Complete main workflow with mock data/API** | Hoàn thiện trọn vẹn luồng người dùng: Xem Dashboard thống kê → Kanban Board theo Project → Tạo Task mới (modal form) → Chuyển trạng thái nhanh trên thẻ Kanban hoặc chỉnh sửa trong chi tiết → Quản lý checklist tiêu chí chấp nhận → Xóa Task (CRUD trọn vẹn). Tích hợp `mockApi` đồng bộ vào `localStorage` giúp lưu trữ bền vững qua các lần reload trang. | `client/src/services/mockApi.js`<br>`client/src/pages/TaskList.jsx`<br>`client/src/pages/TaskDetail.jsx`<br>`client/src/pages/CreateTask.jsx`<br>`client/src/pages/Dashboard.jsx` |
| **2. Define API endpoints with sample request/response** | Định nghĩa chi tiết 8 REST endpoints gồm HTTP methods, URL params, Query params, Headers, JSON Request body mẫu, JSON Response body mẫu và các mã trạng thái HTTP chuẩn (`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `404 Not Found`). | [`docs/07-api-endpoints.md`](docs/07-api-endpoints.md) |
| **3. Automated tests & documented acceptance tests** | Cài đặt Vitest và viết 12 automated unit/integration tests bao quát validator, service CRUD và luồng end-to-end (`npm test`). Bổ sung tài liệu 5 kịch bản kiểm thử chấp nhận thủ công (manual acceptance tests). | [`docs/08-acceptance-tests.md`](docs/08-acceptance-tests.md)<br>`client/src/tests/` |
| **4. Document how to run frontend & config storage** | Hướng dẫn chi tiết cách chạy, vị trí lưu trữ cấu hình (`.env`, `.env.example`, `src/config/index.js`), lệnh test và build production. | Mục 8.2, 8.3 dưới đây & [`client/README.md`](client/README.md) |
| **5. Responsive UI & maintain existing structure** | Giữ nguyên toàn bộ cấu trúc giao diện và hệ thống style CSS hiện tại, đảm bảo hiển thị mượt mà trên desktop/mobile, đồng thời xử lý triệt để các lỗi ESLint. | `client/src/styles/*.css` |

### 8.2. Cấu hình & Vị trí lưu trữ cấu hình

Cấu hình dự án được lưu trữ tập trung tại:
- **`client/.env.example`**: File mẫu khai báo các biến môi trường cần thiết.
- **`client/.env`**: File cấu hình hoạt động cục bộ (được nạp tự động bởi Vite).
- **`client/src/config/index.js`**: Module JavaScript đọc các biến môi trường từ `import.meta.env` và cung cấp giá trị mặc định an toàn.

**Các biến môi trường chính:**
- `VITE_APP_NAME`: Tên ứng dụng hiển thị (`MANA - Student Task & Deadline Manager`).
- `VITE_API_BASE_URL`: URL gốc của backend API (mặc định `http://localhost:5000/api/v1` chuẩn bị cho Tuần 4).
- `VITE_USE_MOCK_DATA`: Cờ bật/tắt chế độ mock data (`true` cho bài 3B; chuyển thành `false` khi tích hợp backend thực tế).

### 8.3. Hướng dẫn chạy và kiểm thử

#### Cài đặt dependencies:
```bash
cd client
npm install
```

#### Chạy development server:
```bash
npm run dev
```
Mở trình duyệt tại: [http://localhost:5173](http://localhost:5173)

#### Chạy kiểm thử tự động (Automated Tests):
```bash
npm test
```
*Kết quả:* 12/12 tests PASS trên 3 test suite:
- `src/tests/validators.test.js` (6 tests)
- `src/tests/mockApi.test.js` (5 tests)
- `src/tests/workflow.test.js` (1 test)

#### Kiểm tra cú pháp (Linting):
```bash
npm run lint
```
*Kết quả:* 0 errors, 0 warnings.

#### Build production:
```bash
npm run build
npm run preview
```

### 8.4. Tài liệu liên quan
- [📡 Đặc tả API Contract (Sample Request & Response)](docs/07-api-endpoints.md)
- [🧪 Kịch bản kiểm thử chấp nhận (Acceptance Tests)](docs/08-acceptance-tests.md)
- [📝 Nhật ký sử dụng AI (AI Usage Log)](docs/06-ai-usage-log.md)
- [🤖 Baseline AI Feature Specification (Homework 6B)](docs/14-homework-6b-baseline-ai-feature.md)
- [📊 AI Evaluation Report (10 Test Cases)](ai-lab/evaluations/hw6b-evaluation-report.md)

---

## 9. Homework 6B – Baseline AI Feature: AI Task Assistant

### 9.1. Tổng quan tính năng
Tích hợp tính năng **AI Task Assistant** vào quy trình tạo task (`/tasks/new`):
1. Người dùng nhập mô tả công việc bằng ngôn ngữ tự nhiên (tiếng Việt hoặc tiếng Anh).
2. Client gửi prompt đến backend Express (`POST /api/v1/ai/parse-task`).
3. Backend gọi LLM (`gemini-3.5-flash-lite`) với system prompt phiên bản hóa (`task-assistant.v1.js`) và response schema.
4. Backend chuẩn hóa và xác thực dữ liệu trả về bằng Zod schema (`aiValidator.js`).
5. Client hiển thị kết quả và tự động điền vào form tạo task theo luồng **Review-Before-Save**.
6. Người dùng kiểm tra, chỉnh sửa tùy ý trước khi bấm "Create Task" lưu vào CSDL.
7. Toàn bộ 7 trạng thái UI (`IDLE`, `LOADING`, `SUCCESS`, `TIMEOUT`, `UNAVAILABLE`, `INVALID_OUTPUT`, `ERROR`) được xử lý tường minh.

### 9.2. Hướng dẫn chạy & kiểm thử

#### 1. Backend:
```bash
cd server
npm install
npm test            # Chạy 27 unit & integration tests
npm start           # Chạy server tại http://localhost:5000
```

#### 2. Frontend:
```bash
cd client
npm install
npm test            # Chạy 122 unit & integration tests
npm run lint        # Kiểm tra ESLint (0 errors, 0 warnings)
npm run dev         # Chạy Vite dev server tại http://localhost:5173
```

#### 3. Chạy bộ đánh giá AI (10 Test Cases):
```bash
cd ai-lab
npm run eval:6b     # Chạy bộ 10 test case đánh giá tính năng AI
```
