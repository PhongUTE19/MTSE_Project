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
