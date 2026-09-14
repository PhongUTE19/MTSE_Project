-- ============================================================
-- MANA - Student Task & Deadline Manager
-- Database Schema v2.0 — Per-Project Members & Labels
-- Milestone: Homework 4A+ — Backend Integration
-- Database: Supabase (PostgreSQL 15+)
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: projects
-- Mục đích: Lưu thông tin dự án nhóm
-- Endpoints: GET /projects, GET /projects/:id, POST /projects
-- ============================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Thông tin cơ bản
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 3),
  course_name TEXT NOT NULL DEFAULT 'General',
  description TEXT DEFAULT '',

  -- Deadline (nullable)
  deadline TIMESTAMPTZ,

  -- Người tạo (lưu dạng string ID hoặc tên)
  created_by TEXT NOT NULL DEFAULT 'student-1',

  -- Trạng thái
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'archived')),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_by ON projects(created_by);

COMMENT ON TABLE projects IS 'Dự án nhóm - mỗi project chứa nhiều tasks, members, labels';

-- ============================================================
-- TABLE: members
-- Mục đích: Lưu thành viên CỦA TỪNG PROJECT
-- Endpoints: GET /projects/:projectId/members, POST, PATCH
-- LƯU Ý: Không có DELETE — theo quyết định thiết kế
-- ============================================================
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key tới project (cascade delete khi xóa project)
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Thông tin cá nhân
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2),
  mssv TEXT NOT NULL CHECK (char_length(trim(mssv)) >= 5),
  email TEXT NOT NULL CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- MSSV unique TRONG TỪNG PROJECT (cùng SV có thể ở nhiều project)
  CONSTRAINT members_project_mssv_unique UNIQUE (project_id, mssv)
);

CREATE INDEX idx_members_project_id ON members(project_id);
CREATE INDEX idx_members_mssv ON members(mssv);
CREATE INDEX idx_members_email ON members(email);

COMMENT ON TABLE members IS 'Thành viên CỦA TỪNG PROJECT - KHÔNG xóa để giữ lịch sử task';
COMMENT ON COLUMN members.project_id IS 'Project mà member này thuộc về';
COMMENT ON COLUMN members.mssv IS 'Mã số sinh viên - unique trong từng project';

-- ============================================================
-- TABLE: labels
-- Mục đích: Lưu nhãn CỦA TỪNG PROJECT
-- Endpoints: GET /projects/:projectId/labels, POST, PATCH, DELETE
-- ============================================================
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key tới project (cascade delete khi xóa project)
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Tên label (giữ nguyên case gốc để hiển thị)
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2),

  -- Màu hex
  color TEXT NOT NULL DEFAULT '#579dff'
    CHECK (color ~* '^#[0-9a-f]{6}$'),

  -- Tên lowercase để check duplicate case-insensitive
  name_lower TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Name unique TRONG TỪNG PROJECT (2 project có thể có label "Frontend" riêng)
  CONSTRAINT labels_project_name_unique UNIQUE (project_id, name_lower)
);

CREATE INDEX idx_labels_project_id ON labels(project_id);
CREATE INDEX idx_labels_name_lower ON labels(name_lower);

COMMENT ON TABLE labels IS 'Nhãn CỦA TỪNG PROJECT';
COMMENT ON COLUMN labels.project_id IS 'Project mà label này thuộc về';
COMMENT ON COLUMN labels.name_lower IS 'Tên lowercase để check duplicate trong project';

-- ============================================================
-- TABLE: tasks
-- Mục đích: Lưu công việc
-- Endpoints: GET /tasks, GET /tasks/:id, POST /tasks, PUT, DELETE
-- ============================================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key tới project
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Thông tin cơ bản
  title TEXT NOT NULL CHECK (char_length(trim(title)) >= 3),
  description TEXT DEFAULT '',

  -- Trạng thái & độ ưu tiên
  status TEXT NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high')),

  -- Ngày bắt đầu & deadline
  start_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ NOT NULL,

  -- Danh sách assignee IDs (reference members.id của CÙNG project)
  assignee_ids TEXT[] DEFAULT '{}',

  -- Danh sách label names (reference labels.name của CÙNG project)
  labels TEXT[] DEFAULT '{}',

  -- Checklist dạng JSONB
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Nhắc nhở (phút trước deadline)
  reminder_minutes_before INTEGER[] DEFAULT '{}',

  -- Người tạo
  created_by TEXT NOT NULL DEFAULT 'student-1',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Constraint: completed_at chỉ có khi status='done'
  CONSTRAINT chk_completed_at CHECK (
    (status = 'done' AND completed_at IS NOT NULL) OR
    (status != 'done' AND completed_at IS NULL)
  )
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_at ON tasks(due_at);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_assignee_ids ON tasks USING GIN(assignee_ids);
CREATE INDEX idx_tasks_labels ON tasks USING GIN(labels);

COMMENT ON TABLE tasks IS 'Công việc thuộc project';
COMMENT ON COLUMN tasks.assignee_ids IS 'Array member IDs (thuộc cùng project)';
COMMENT ON COLUMN tasks.labels IS 'Array label names (thuộc cùng project)';

-- ============================================================
-- TRIGGERS: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_labels_updated_at
  BEFORE UPDATE ON labels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- TRIGGER: Auto-set name_lower cho labels
-- ============================================================
CREATE OR REPLACE FUNCTION set_label_name_lower()
RETURNS TRIGGER AS $$
BEGIN
  NEW.name_lower = LOWER(TRIM(REGEXP_REPLACE(NEW.name, '\s+', ' ', 'g')));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_labels_name_lower
  BEFORE INSERT OR UPDATE OF name ON labels
  FOR EACH ROW EXECUTE FUNCTION set_label_name_lower();

-- ============================================================
-- TRIGGER: Auto-set completed_at khi status='done'
-- ============================================================
CREATE OR REPLACE FUNCTION set_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS NULL OR OLD.status != 'done') THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'done' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tasks_completed_at
  BEFORE INSERT OR UPDATE OF status ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_task_completed_at();

-- ============================================================
-- SEED DATA
-- ============================================================

-- Projects mẫu
INSERT INTO projects (id, name, course_name, description, deadline, created_by, status) VALUES
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'Student Task & Deadline Manager',
    'New Technology',
    'Ứng dụng hỗ trợ sinh viên quản lý công việc nhóm, thành viên và deadline trong các project môn học.',
    '2026-09-30T23:59:00+07:00',
    '550e8400-e29b-41d4-a716-446655440003',
    'active'
  ),
  (
    '650e8400-e29b-41d4-a716-446655440002',
    'Campus Event Planner',
    'Software Engineering',
    'Ứng dụng hỗ trợ lập kế hoạch, phân công và theo dõi tiến độ tổ chức sự kiện trong trường.',
    '2026-10-15T23:59:00+07:00',
    '550e8400-e29b-41d4-a716-446655440001',
    'active'
  );

-- ============================================================
-- MEMBERS per-project
-- ============================================================

-- Members của project-1 (Student Task & Deadline Manager)
-- Có 3 members: Phong, Như, Nhi
INSERT INTO members (id, project_id, name, mssv, email) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440001',
    'Bùi Duy Phong',
    '19110131',
    'BuiDuyPhong@gmail.com'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440001',
    'Trần Thị Tố Như',
    '23110051',
    'NhuTran@gmail.com'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    '650e8400-e29b-41d4-a716-446655440001',
    'Văn Phạm Thảo Nhi',
    '23110049',
    'NhiVan@gmail.com'
  );

-- Members của project-2 (Campus Event Planner)
-- Chỉ có 2 members: Phong, Như
INSERT INTO members (id, project_id, name, mssv, email) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440011',
    '650e8400-e29b-41d4-a716-446655440002',
    'Bùi Duy Phong',
    '19110131',
    'BuiDuyPhong@gmail.com'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440012',
    '650e8400-e29b-41d4-a716-446655440002',
    'Trần Thị Tố Như',
    '23110051',
    'NhuTran@gmail.com'
  );

-- ============================================================
-- LABELS per-project
-- ============================================================

-- Labels của project-1
INSERT INTO labels (project_id, name, color) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'Planning', '#4bce97'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Feature', '#9f8fef'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Data', '#579dff'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Analysis', '#e2b203'),
  ('650e8400-e29b-41d4-a716-446655440001', 'UI', '#4bce97'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Wireframe', '#f87168'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Frontend', '#e2b203'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Setup', '#579dff'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Task', '#4bce97'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Calendar', '#e2b203'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Integration', '#9f8fef'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Testing', '#4bce97'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Presentation', '#f87168'),
  ('650e8400-e29b-41d4-a716-446655440001', 'Demo', '#4bce97');

-- Labels của project-2
INSERT INTO labels (project_id, name, color) VALUES
  ('650e8400-e29b-41d4-a716-446655440002', 'Planning', '#4bce97'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Event', '#579dff'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Research', '#9f8fef'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Logistics', '#e2b203'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Marketing', '#f87168'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Content', '#9f8fef');

-- ============================================================
-- TASKS cho project-1 (11 tasks)
-- ============================================================
INSERT INTO tasks (
  project_id, title, description, status, priority,
  start_at, due_at, assignee_ids, labels, checklist,
  reminder_minutes_before, created_by, completed_at
) VALUES
  -- Task 1
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'Lên ý tưởng project',
    'Xác định vấn đề sinh viên gặp phải, đối tượng sử dụng và mục tiêu của ứng dụng.',
    'done', 'high',
    '2026-09-07T08:00:00+07:00', '2026-09-07T23:59:00+07:00',
    ARRAY['550e8400-e29b-41d4-a716-446655440003'],
    ARRAY['Planning'],
    '[{"id": "check-1-1", "title": "Xác định vấn đề sinh viên gặp phải", "completed": true}, {"id": "check-1-2", "title": "Xác định đối tượng sử dụng", "completed": true}, {"id": "check-1-3", "title": "Xác định mục tiêu ứng dụng", "completed": true}]'::jsonb,
    ARRAY[1440],
    '550e8400-e29b-41d4-a716-446655440003',
    '2026-09-07T20:00:00+07:00'
  ),
  -- Task 2
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'Xác định chức năng chính',
    'Xác định các chức năng chính gồm Project, Task, Deadline, Calendar, Member và Reminder.',
    'done', 'high',
    '2026-09-07T13:00:00+07:00', '2026-09-08T23:59:00+07:00',
    ARRAY['550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002'],
    ARRAY['Planning', 'Feature'],
    '[{"id": "check-2-1", "title": "Project", "completed": true}, {"id": "check-2-2", "title": "Task", "completed": true}, {"id": "check-2-3", "title": "Deadline", "completed": true}, {"id": "check-2-4", "title": "Calendar", "completed": true}, {"id": "check-2-5", "title": "Member", "completed": true}, {"id": "check-2-6", "title": "Reminder", "completed": true}]'::jsonb,
    ARRAY[1440],
    '550e8400-e29b-41d4-a716-446655440003',
    '2026-09-08T21:00:00+07:00'
  ),
  -- Task 3
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'Phân tích yêu cầu và dữ liệu',
    'Xác định các field cần thiết của Student, Project, Task và Calendar Event.',
    'in_progress', 'high',
    '2026-09-09T08:00:00+07:00', '2026-09-11T18:00:00+07:00',
    ARRAY['550e8400-e29b-41d4-a716-446655440003'],
    ARRAY['Data', 'Analysis'],
    '[{"id": "check-3-1", "title": "Xác định field Student", "completed": true}, {"id": "check-3-2", "title": "Xác định field Project", "completed": true}, {"id": "check-3-3", "title": "Xác định field Task", "completed": true}, {"id": "check-3-4", "title": "Xác định field Calendar Event", "completed": false}, {"id": "check-3-5", "title": "Gửi mock data cho thành viên làm UI", "completed": false}]'::jsonb,
    ARRAY[1440, 60],
    '550e8400-e29b-41d4-a716-446655440003',
    NULL
  ),
  -- Task 4
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'Phác thảo giao diện / Wireframe',
    'Phác thảo giao diện Dashboard, Task List, Task Detail và Calendar.',
    'in_progress', 'high',
    '2026-09-09T08:00:00+07:00', '2026-09-12T23:59:00+07:00',
    ARRAY['550e8400-e29b-41d4-a716-446655440002'],
    ARRAY['UI', 'Wireframe'],
    '[{"id": "check-4-1", "title": "Dashboard", "completed": true}, {"id": "check-4-2", "title": "Task List", "completed": true}, {"id": "check-4-3", "title": "Task Detail", "completed": false}, {"id": "check-4-4", "title": "Calendar", "completed": false}]'::jsonb,
    ARRAY[1440, 60],
    '550e8400-e29b-41d4-a716-446655440002',
    NULL
  ),
  -- Task 5
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'Thiết kế giao diện Dashboard',
    'Thiết kế UI Dashboard hoàn chỉnh dựa trên wireframe đã thống nhất.',
    'todo', 'high',
    '2026-09-12T08:00:00+07:00', '2026-09-15T23:59:00+07:00',
    ARRAY['550e8400-e29b-41d4-a716-446655440002'],
    ARRAY['UI', 'Frontend'],
    '[{"id": "check-5-1", "title": "Tổng quan task", "completed": false}, {"id": "check-5-2", "title": "Task sắp đến hạn", "completed": false}, {"id": "check-5-3", "title": "Task quá hạn", "completed": false}, {"id": "check-5-4", "title": "Tiến độ project", "completed": false}]'::jsonb,
    ARRAY[1440],
    '550e8400-e29b-41d4-a716-446655440002',
    NULL
  ),
  -- Task 6
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'Khởi tạo React project',
    'Khởi tạo project React bằng Vite, tạo folder structure và cài đặt các dependency cần thiết.',
    'todo', 'high',
    '2026-09-11T08:00:00+07:00', '2026-09-12T23:59:00+07:00',
    ARRAY['550e8400-e29b-41d4-a716-446655440001'],
    ARRAY['Frontend', 'Setup'],
    '[{"id": "check-6-1", "title": "Create React project bằng Vite", "completed": false}, {"id": "check-6-2", "title": "Tạo folder structure", "completed": false}, {"id": "check-6-3", "title": "Cài dependency", "completed": false}, {"id": "check-6-4", "title": "Chạy thử project", "completed": false}]'::jsonb,
    ARRAY[1440],
    '550e8400-e29b-41d4-a716-446655440001',
    NULL
  ),
  -- Task 7
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'Code Task List và Task Detail',
    'Code giao diện danh sách task và màn hình xem chi tiết một task.',
    'todo', 'high',
    '2026-09-13T08:00:00+07:00', '2026-09-18T23:59:00+07:00',
    ARRAY['550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'],
    ARRAY['Frontend', 'Task'],
    '[{"id": "check-7-1", "title": "Code Task List", "completed": false}, {"id": "check-7-2", "title": "Code Task Card", "completed": false}, {"id": "check-7-3", "title": "Code Task Detail", "completed": false}, {"id": "check-7-4", "title": "Hiển thị assignee và deadline", "completed": false}]'::jsonb,
    ARRAY[1440],
    '550e8400-e29b-41d4-a716-446655440002',
    NULL
  ),
  -- Task 8
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'Code Calendar',
    'Code giao diện Calendar để sinh viên theo dõi task và deadline theo ngày.',
    'todo', 'medium',
    '2026-09-16T08:00:00+07:00', '2026-09-20T23:59:00+07:00',
    ARRAY['550e8400-e29b-41d4-a716-446655440001'],
    ARRAY['Frontend', 'Calendar'],
    '[{"id": "check-8-1", "title": "Hiển thị lịch", "completed": false}, {"id": "check-8-2", "title": "Hiển thị deadline trên lịch", "completed": false}, {"id": "check-8-3", "title": "Click event để xem task", "completed": false}]'::jsonb,
    ARRAY[1440],
    '550e8400-e29b-41d4-a716-446655440001',
    NULL
  ),
  -- Task 9
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'Tích hợp mock data và kiểm tra logic',
    'Tích hợp mock data vào giao diện và kiểm tra logic lọc task, overdue, priority và checklist progress.',
    'todo', 'high',
    '2026-09-19T08:00:00+07:00', '2026-09-22T23:59:00+07:00',
    ARRAY['550e8400-e29b-41d4-a716-446655440003'],
    ARRAY['Data', 'Integration'],
    '[{"id": "check-9-1", "title": "Tích hợp Student data", "completed": false}, {"id": "check-9-2", "title": "Tích hợp Project data", "completed": false}, {"id": "check-9-3", "title": "Tích hợp Task data", "completed": false}, {"id": "check-9-4", "title": "Kiểm tra filter task", "completed": false}, {"id": "check-9-5", "title": "Kiểm tra overdue", "completed": false}, {"id": "check-9-6", "title": "Kiểm tra priority", "completed": false}, {"id": "check-9-7", "title": "Kiểm tra checklist progress", "completed": false}]'::jsonb,
    ARRAY[1440, 60],
    '550e8400-e29b-41d4-a716-446655440003',
    NULL
  ),
  -- Task 10
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'Test toàn bộ hệ thống',
    'Kiểm tra toàn bộ chức năng và giao diện trước khi demo.',
    'todo', 'high',
    '2026-09-23T08:00:00+07:00', '2026-09-25T23:59:00+07:00',
    ARRAY['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'],
    ARRAY['Testing'],
    '[{"id": "check-10-1", "title": "Test Dashboard", "completed": false}, {"id": "check-10-2", "title": "Test Task List", "completed": false}, {"id": "check-10-3", "title": "Test Task Detail", "completed": false}, {"id": "check-10-4", "title": "Test Calendar", "completed": false}, {"id": "check-10-5", "title": "Test Loading / Empty / Error", "completed": false}]'::jsonb,
    ARRAY[1440],
    '550e8400-e29b-41d4-a716-446655440003',
    NULL
  ),
  -- Task 11
  (
    '650e8400-e29b-41d4-a716-446655440001',
    'Chuẩn bị demo và slide',
    'Chuẩn bị nội dung demo, slide thuyết trình và phân chia phần trình bày cho các thành viên.',
    'todo', 'high',
    '2026-09-25T08:00:00+07:00', '2026-09-28T23:59:00+07:00',
    ARRAY['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'],
    ARRAY['Presentation', 'Demo'],
    '[{"id": "check-11-1", "title": "Chuẩn bị slide", "completed": false}, {"id": "check-11-2", "title": "Chuẩn bị demo flow", "completed": false}, {"id": "check-11-3", "title": "Phân chia phần trình bày", "completed": false}, {"id": "check-11-4", "title": "Chạy thử demo", "completed": false}]'::jsonb,
    ARRAY[1440, 60],
    '550e8400-e29b-41d4-a716-446655440003',
    NULL
  );

-- ============================================================
-- TASKS cho project-2 (3 tasks)
-- ============================================================
INSERT INTO tasks (
  project_id, title, description, status, priority,
  start_at, due_at, assignee_ids, labels, checklist,
  reminder_minutes_before, created_by, completed_at
) VALUES
  -- Task 12
  (
    '650e8400-e29b-41d4-a716-446655440002',
    'Xác định quy mô sự kiện',
    'Xác định mục tiêu, đối tượng tham gia và quy mô dự kiến của sự kiện.',
    'done', 'high',
    '2026-09-08T09:00:00+07:00', '2026-09-10T23:59:00+07:00',
    ARRAY['550e8400-e29b-41d4-a716-446655440011'],
    ARRAY['Planning', 'Event'],
    '[{"id": "check-12-1", "title": "Xác định mục tiêu sự kiện", "completed": true}, {"id": "check-12-2", "title": "Ước tính số lượng người tham gia", "completed": true}]'::jsonb,
    ARRAY[1440],
    '550e8400-e29b-41d4-a716-446655440011',
    '2026-09-10T18:00:00+07:00'
  ),
  -- Task 13
  (
    '650e8400-e29b-41d4-a716-446655440002',
    'Lên danh sách địa điểm phù hợp',
    'Khảo sát và so sánh các địa điểm có thể tổ chức sự kiện.',
    'in_progress', 'medium',
    '2026-09-11T09:00:00+07:00', '2026-09-18T23:59:00+07:00',
    ARRAY['550e8400-e29b-41d4-a716-446655440012'],
    ARRAY['Research', 'Logistics'],
    '[{"id": "check-13-1", "title": "Khảo sát hội trường A", "completed": true}, {"id": "check-13-2", "title": "Khảo sát phòng đa năng", "completed": false}]'::jsonb,
    ARRAY[1440],
    '550e8400-e29b-41d4-a716-446655440012',
    NULL
  ),
  -- Task 14
  (
    '650e8400-e29b-41d4-a716-446655440002',
    'Chuẩn bị kế hoạch truyền thông',
    'Lập kế hoạch nội dung và các kênh truyền thông cho sự kiện.',
    'todo', 'high',
    '2026-09-19T09:00:00+07:00', '2026-09-25T23:59:00+07:00',
    ARRAY['550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440012'],
    ARRAY['Marketing', 'Content'],
    '[{"id": "check-14-1", "title": "Chọn kênh truyền thông", "completed": false}, {"id": "check-14-2", "title": "Soạn nội dung giới thiệu", "completed": false}]'::jsonb,
    ARRAY[1440],
    '550e8400-e29b-41d4-a716-446655440011',
    NULL
  );

-- ============================================================
-- VIEW: dashboard_stats
-- ============================================================
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM projects WHERE status = 'active') AS total_projects,
  (SELECT COUNT(*) FROM tasks) AS total_tasks,
  (SELECT COUNT(*) FROM tasks WHERE status = 'done') AS done_tasks,
  (SELECT COUNT(*) FROM tasks WHERE status = 'in_progress') AS in_progress_tasks,
  (SELECT COUNT(*) FROM tasks WHERE status != 'done' AND due_at < NOW()) AS overdue_tasks;

COMMENT ON VIEW dashboard_stats IS 'Thống kê tổng hợp cho Dashboard';

-- ============================================================
-- DONE
-- ============================================================