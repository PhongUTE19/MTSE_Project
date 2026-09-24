## Task 1.1 — Cấu hình Router trong App.jsx

**AI tool:** ide gravity (gemini 3.1 Pro)

**AI Generated:**
- src/App.jsx — toàn bộ routing với react-router-dom

**Human review:** [Trần]
- Đọc hiểu BrowserRouter, Routes, Route, Navigate
- Kiểm tra redirect / → /dashboard hoạt động
- Phát hiện: /tasks/new phải đặt TRƯỚC /tasks/:taskId
- Thêm catch-all route (*) để tránh trang trắng
- Test 7 case thủ công, tất cả pass
- Không cần chỉnh sửa logic

**Trạng thái:** ✅ Đã review

---

## Task 1.2 — Navbar component

**AI tool:** ide gravity (gemini 3.1 Pro)

**AI Generated:**
- src/components/Navbar.jsx

**Human review:** [Trần]
- Hiểu NavLink và isActive callback
- Đổi màu active từ #007bff → #0056b3 cho tương phản tốt hơn
- Thêm icon 📋 trước tên app
- Test: click từng link, active state hiển thị đúng
- Kiểm tra: Navbar hiển thị trên mọi route

**Trạng thái:** ✏️ Đã chỉnh sửa

---

## Task 1.2b — Placeholder pages

**AI tool:** Gemini 3.1 Pro (Low)

**AI Generated:**
- src/pages/Dashboard.jsx
- src/pages/TaskList.jsx
- src/pages/TaskDetail.jsx (có useParams)
- src/pages/CreateTask.jsx

**Human review:** [Trần]
- Đọc hiểu useParams trong TaskDetail
- Test: /tasks/task-1 → hiện "Task ID: task-1"
- Không cần chỉnh sửa

**Trạng thái:** ✅ Đã review

---

## Task 1.3 — Test chuyển route

**AI tool:** Không dùng

**Human review:** [Trần]
- Chạy npm run dev
- Thực hiện 7 test case trong checklist
- Kết quả: 7/7 pass
- Không có warning trong Console

**Trạng thái:** ✅ Đã test

---

## Task 2.1 + 2.2 — Dashboard thống kê

**AI tool:** ide gravity (gemini 3.1 Pro)

**AI Generated:**
- src/pages/Dashboard.jsx — logic tính 4 thống kê + StatCard component

**Human review:** [Tran Thi To Nhu]
- Kiểm tra logic overdue: status !== "done" && dueAt < now ✅
- Test với mock data: Total=11, Done=2, In Progress=2, Overdue=0
- Giải thích: mock data chưa có task nào quá hạn (hôm nay 10/09/2026)
- Test edge case: nếu tasks=[] → hiện "No tasks yet."
- Không cần chỉnh sửa logic

**Trạng thái:** ✅ Đã review

---

## Task 2.3 + 2.4 — Task List

**AI tool:** ide gravity (gemini 3.1 Pro)

**AI Generated:**
- src/pages/TaskList.jsx — state, useEffect, render list

**Human review:** [Tran Thi To Nhu]
- Hiểu useEffect với empty deps → chạy 1 lần khi mount
- Hiểu cleanup clearTimeout → tránh memory leak
- Test: loading 500ms → success → 11 task hiển thị
- Test: click task → chuyển sang /tasks/task-1
- Đổi màu text status sang #666 để dễ đọc
- Không cần chỉnh sửa logic

**Trạng thái:** ✏️ Đã chỉnh sửa

---

## Task 2.5 + 2.6 + 2.7 — Task Detail

**AI tool:** ide gravity (gemini 3.1 Pro)

**AI Generated:**
- src/pages/TaskDetail.jsx — metadata + checklist + progress bar
- Helper functions getStudentName, formatReminder

**Human review:** [Tran Thi To Nhu]
- Kiểm tra useParams trả về taskId đúng
- Test task-1: checklist 3/3 (100%), progress bar đầy
- Test task-3: checklist 3/5 (60%), progress bar 60%
- Test task-999: hiện "Task not found" + link Back
- Thêm helper formatReminder để hiển thị "1 ngày trước" thay vì "1440 phút"
- Kiểm tra division by zero: totalChecks=0 → progressPercent=0
- Không cần chỉnh sửa logic

**Trạng thái:** ✏️ Đã chỉnh sửa

---

## Task 3.1 — Validator

**AI tool:** ide gravity (gemini 3.1 Pro)

**AI Generated:**
- src/utils/validators.js — hàm validateTaskForm với 2 rule

**Human review:** [Tran Thi To Nhu]
- Đọc hiểu từng nhánh if/else
- Test 5 case:
  1. Title rỗng → ✅ "Title is required."
  2. Title "ab" → ✅ "at least 3 characters"
  3. Title "abc" + deadline rỗng → ✅ "Deadline is required."
  4. Deadline 2020 → ✅ "cannot be in the past"
  5. Title "abc" + deadline 2099 → ✅ pass
- Thêm check isNaN(deadlineDate.getTime()) để tránh lỗi Invalid Date
- Thêm .trim() để tránh title toàn khoảng trắng
- Đổi message lỗi sang tiếng Anh rõ ràng hơn

**Trạng thái:** ✏️ Đã chỉnh sửa

---

## Task 3.2 — Create Task form

**AI tool:** ide gravity (gemini 3.1 Pro)

**AI Generated:**
- src/pages/CreateTask.jsx — form, state (values/errors/touched), handlers

**Human review:** [Tran Thi To Nhu]
- Hiểu useState cho values/errors/touched
- Hiểu tại sao cần touched: chỉ hiện lỗi sau khi blur (tránh lỗi hiện ngay từ đầu)
- Hiểu handleBlur validate lại toàn bộ form, không chỉ field hiện tại
- Test: submit rỗng → không gửi, hiện lỗi đúng
- Test: nhập đúng → alert + navigate về /tasks
- Sửa: dùng type="datetime-local" cho input deadline
- Sửa: form được đưa vào giao diện nổi như Modal để hợp với Trello layout, lấy status dựa theo cột click vào.
- Sửa: thêm trực tiếp task mới vào mock data trong bộ nhớ để hiển thị liền mạch trên giao diện.

**Trạng thái:** ✏️ Đã chỉnh sửa

---

## Task 3.3 — Test validation

**AI tool:** Không dùng

**Human review:** [Tran Thi To Nhu]
- Chạy npm run dev
- Thực hiện 5 test case trong checklist
- Kết quả: 5/5 pass
- Test thêm edge case: Title = "   " → báo lỗi đúng
- Test thêm: sửa lỗi → lỗi biến mất
- Không có warning trong Console

**Trạng thái:** ✅ Đã test


---

## Task 4.1 — UI States component

**AI tool:** ide gravity (gemini 3.1 Pro)

**AI Generated:**
- src/components/TaskListStates.jsx — 3 component Loading/Empty/Error

**Human review:** [Tran Thi To Nhu]
- Đọc hiểu named export vs default export
- Kiểm tra props: onCreate, onRetry đều optional/required đúng
- Test: import vào TaskList không lỗi
- Thêm emoji vào message để dễ nhìn
- Không cần chỉnh sửa logic

**Trạng thái:** ✏️ Đã chỉnh sửa

---

## Task 4.2 — Áp dụng vào Task List

**AI tool:** ide gravity (gemini 3.1 Pro)

**AI Generated:**
- Cập nhật src/pages/TaskList.jsx dùng component thay vì inline

**Human review:** [Tran Thi To Nhu]
- Hiểu useNavigate để chuyển route từ EmptyState
- Test: success state vẫn hiển thị 11 task
- Test: click task → detail OK
- Không cần chỉnh sửa logic

**Trạng thái:** ✅ Đã review

---

## Task 4.3 + 4.4 + 4.5 — Test 3 states

**AI tool:** Không dùng

**Human review:** [Tran Thi To Nhu]
- Test Loading: đổi delay 500ms → 5000ms, thấy "⏳ Loading tasks..."
- Test Empty: đổi data thành [], thấy "📭 No tasks found." + nút navigate OK
- Test Error: thêm throw, thấy "❌ Unable to load tasks." + nút retry OK
- Đã revert tất cả thay đổi test
- Không có warning trong Console

**Trạng thái:** ✅ Đã test

---

## Task 5.1 — Xây dựng Mock API Service & Quản lý Cấu hình

**AI tool:** Antigravity (Gemini 3.8 Flash)

**AI Generated:**
- `client/src/services/mockApi.js` — Service mô phỏng REST API với cơ chế đồng bộ `localStorage`, hỗ trợ CRUD đầy đủ cho Tasks/Projects/Students/DashboardStats
- `client/src/config/index.js` — Quản lý cấu hình tập trung
- `client/.env.example`, `client/.env` — Biến môi trường

**Human review:** [Bùi Duy Phong]
- Kiểm tra tính bất đồng bộ (Promise/async/await) và cơ chế fallback khi chạy trong môi trường không có localStorage
- Xác nhận các method: getProjects, getTasks, getTaskById, createTask, updateTask, deleteTask, getDashboardStats
- Không lưu credentials nhạy cảm vào repository

**Trạng thái:** ✅ Đã review

---

## Task 5.2 — Hoàn thiện Luồng Người Dùng & Nâng cấp Giao diện

**AI tool:** Antigravity (Gemini 3.8 Flash)

**AI Generated:**
- `client/src/pages/TaskDetail.jsx` — Thêm nút "🗑️ Delete Task", liên kết `mockApi`, sửa cảnh báo ESLint về cascading renders
- `client/src/pages/TaskList.jsx` — Thêm các nút chuyển nhanh cột Kanban trực tiếp trên task card ("Start →", "Done →", "← Reopen")
- `client/src/pages/CreateTask.jsx` — Tích hợp `mockApi.createTask`, thêm trạng thái disabled khi đang submit
- `client/src/pages/Dashboard.jsx` — Tải và cập nhật thống kê động thông qua `mockApi.getDashboardStats()`
- `client/src/styles/TaskList.css`, `client/src/styles/TaskDetail.css` — Bổ sung CSS cho nút chuyển trạng thái và nút delete

**Human review:** [Trần Thị Tố Như]
- Kiểm tra luồng thao tác: tạo task mới → hiển thị trên To Do → bấm "Start →" chuyển sang In Progress → bấm "Done →" chuyển sang Done → mở chi tiết bấm "Delete Task" xóa sạch
- Kiểm tra responsive trên mobile/tablet không bị vỡ layout
- Chạy `npm run lint` đạt 0 errors, 0 warnings

**Trạng thái:** ✅ Đã review & test

---

## Task 5.3 — Kiểm thử Tự động (Automated Tests) & Kịch bản Chấp nhận (Acceptance Tests)

**AI tool:** Antigravity (Gemini 3.8 Flash)

**AI Generated:**
- `client/src/tests/validators.test.js` — 6 unit tests kiểm tra validation rules
- `client/src/tests/mockApi.test.js` — 5 unit tests kiểm tra CRUD và tính toán metrics
- `client/src/tests/workflow.test.js` — 1 integration test kiểm tra trọn vẹn vòng đời task
- `docs/08-acceptance-tests.md` — Tài liệu hóa 5 kịch bản kiểm thử chấp nhận thủ công với các bước thực hiện chi tiết

**Human review:** [Văn Phạm Thảo Nhi]
- Chạy `npm test` bằng Vitest: 12/12 tests đều PASS
- Thực hiện kiểm thử thủ công theo 5 kịch bản trong tài liệu, đối chiếu kết quả thực tế với mong đợi

**Trạng thái:** ✅ Đã review & test

---

## Task 5.4 — Đặc tả API Contract & Tài liệu Hướng dẫn Chạy

**AI tool:** Antigravity (Gemini 3.8 Flash)

**AI Generated:**
- `docs/07-api-endpoints.md` — Đặc tả 8 REST endpoints với sample request/response JSON và HTTP status codes
- Cập nhật `client/README.md` & `README.md` — Bổ sung hướng dẫn chạy, kiểm thử và vị trí cấu hình cho bài 3B

**Human review:** [Bùi Duy Phong]
- Kiểm tra tính tương thích giữa API Contract và yêu cầu Backend tuần 4
- Kiểm tra các liên kết tài liệu markdown hoạt động chính xác

**Trạng thái:** ✅ Đã review

---

## Task 6B — Tích hợp AI Task Assistant (Baseline AI Project Feature)

**AI tool:** Antigravity (Gemini 3.8 Flash)

**AI Generated / Modified:**
- `server/src/config/ai.js` — Cấu hình Gemini model và request timeout 30s
- `server/src/prompts/task-assistant.v1.js` — Versioned prompt v1.0.0, system instructions và JSON schema
- `server/src/validators/aiValidator.js` — Zod schema xác thực prompt đầu vào và response có cấu trúc từ LLM
- `server/src/services/aiService.js` — Service gọi `@google/genai` từ backend, xử lý timeout, sanitize date/enum, mapping lỗi
- `server/src/controllers/aiController.js` — Controller parseTask và getHealth
- `server/src/routes/aiRoutes.js` — Endpoint POST /api/v1/ai/parse-task và GET /api/v1/ai/health
- `server/src/middlewares/errorHandler.js` — Xử lý lỗi `AiServiceError` với HTTP status 504, 503, 422, 429
- `server/tests/aiEndpoints.test.js` & `server/tests/aiValidator.test.js` — 13 backend unit & integration tests
- `client/src/services/aiService.js` — Client API service giao tiếp backend, phân loại lỗi UI (Timeout, Unavailable, Invalid Output, v.v.)
- `client/src/components/AiTaskAssistant.jsx` & `client/src/styles/AiTaskAssistant.css` — Component trợ lý AI với 7 trạng thái UI rõ ràng
- `client/src/pages/CreateTask.jsx` & `client/src/hooks/useCreateTask.js` — Tích hợp luồng Review-before-save
- `client/tests/aiTaskAssistant.test.js` — 10 client unit & integration tests
- `ai-lab/evaluations/run-evaluation.js` & `ai-lab/evaluations/hw6b-task-assistant-eval.json` — Bộ 10 test case đánh giá theo yêu cầu
- `ai-lab/evaluations/hw6b-evaluation-report.md` — Báo cáo đánh giá chi tiết và phân tích failure mode

**Human review:** [Bùi Duy Phong & Nhóm MANA]
- Xác nhận toàn bộ cuộc gọi LLM chỉ thực hiện qua backend, tuyệt đối không lộ API key ra client.
- Kiểm tra tính bảo toàn của luồng tạo task thủ công: form không bị khóa khi AI lỗi hoặc timeout.
- Kiểm tra luồng Review-before-save: dữ liệu gợi ý điền vào form để sinh viên review, không tự động lưu vào DB.
- Chạy toàn bộ tests: `server` (27/27 PASS), `client` (122/122 PASS, ESLint 0 errors).
- Chạy bộ đánh giá 10 test case thực tế và ghi nhận failure mode (hallucination & timeout).

**Trạng thái:** ✅ Đã review & hoàn thành

