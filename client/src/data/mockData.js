// ========================================
// 1. STUDENTS
// ========================================

export const students = [
    {
        id: "student-1",
        name: "Bùi Duy Phong",
        mssv: "19110131",
        email: "BuiDuyPhong@gmail.com",
    },
    {
        id: "student-2",
        name: "Trần Thị Tố Như",
        mssv: "23110051",
        email: "NhuTran@gmail.com",
    },
    {
        id: "student-3",
        name: "Văn Phạm Thảo Nhi",
        mssv: "23110049",
        email: "NhiVan@gmail.com",
    },
];
// ========================================
// 2. PROJECTS
// Mỗi project tương ứng bài tập nhóm / môn học
// ========================================
export const projects = [
    {
        id: "project-1",

        name: "Student Task & Deadline Manager",

        courseName: "New Technology",

        description:
            "Ứng dụng hỗ trợ sinh viên quản lý công việc nhóm, thành viên và deadline trong các project môn học.",

        deadline: "2026-09-30T23:59:00+07:00",

        memberIds: [
            "student-1",
            "student-2",
            "student-3",
        ],

        createdBy: "student-3",

        status: "active",

        createdAt: "2026-09-07T08:00:00+07:00",
    },
];
// ========================================
// 3. TASKS
// status: todo | in_progress | done
// priority: low | medium | high
// ========================================

export const tasks = [

    // ========================================
    // TASK 1
    // ========================================
    {
        id: "task-1",

        projectId: "project-1",

        title: "Lên ý tưởng project",

        description:
            "Xác định vấn đề sinh viên gặp phải, đối tượng sử dụng và mục tiêu của ứng dụng.",

        assigneeIds: [
            "student-3",
        ],

        status: "done",

        priority: "high",

        startAt: "2026-09-07T08:00:00+07:00",

        dueAt: "2026-09-07T23:59:00+07:00",

        labels: [
            "Planning",
        ],

        checklist: [
            {
                id: "check-1-1",
                title: "Xác định vấn đề sinh viên gặp phải",
                completed: true,
            },
            {
                id: "check-1-2",
                title: "Xác định đối tượng sử dụng",
                completed: true,
            },
            {
                id: "check-1-3",
                title: "Xác định mục tiêu ứng dụng",
                completed: true,
            },
        ],

        reminderMinutesBefore: [
            1440,
        ],

        createdBy: "student-3",

        createdAt: "2026-09-07T08:00:00+07:00",

        updatedAt: "2026-09-07T20:00:00+07:00",

        completedAt: "2026-09-07T20:00:00+07:00",
    },


    // ========================================
    // TASK 2
    // ========================================
    {
        id: "task-2",

        projectId: "project-1",

        title: "Xác định chức năng chính",

        description:
            "Xác định các chức năng chính gồm Project, Task, Deadline, Calendar, Member và Reminder.",

        assigneeIds: [
            "student-3",
            "student-2",
        ],

        status: "done",

        priority: "high",

        startAt: "2026-09-07T13:00:00+07:00",

        dueAt: "2026-09-08T23:59:00+07:00",

        labels: [
            "Planning",
            "Feature",
        ],

        checklist: [
            {
                id: "check-2-1",
                title: "Project",
                completed: true,
            },
            {
                id: "check-2-2",
                title: "Task",
                completed: true,
            },
            {
                id: "check-2-3",
                title: "Deadline",
                completed: true,
            },
            {
                id: "check-2-4",
                title: "Calendar",
                completed: true,
            },
            {
                id: "check-2-5",
                title: "Member",
                completed: true,
            },
            {
                id: "check-2-6",
                title: "Reminder",
                completed: true,
            },
        ],

        reminderMinutesBefore: [
            1440,
        ],

        createdBy: "student-3",

        createdAt: "2026-09-07T13:00:00+07:00",

        updatedAt: "2026-09-08T21:00:00+07:00",

        completedAt: "2026-09-08T21:00:00+07:00",
    },


    // ========================================
    // TASK 3
    // ========================================
    {
        id: "task-3",

        projectId: "project-1",

        title: "Phân tích yêu cầu và dữ liệu",

        description:
            "Xác định các field cần thiết của Student, Project, Task và Calendar Event.",

        assigneeIds: [
            "student-3",
        ],

        status: "in_progress",

        priority: "high",

        startAt: "2026-09-09T08:00:00+07:00",

        dueAt: "2026-09-11T18:00:00+07:00",

        labels: [
            "Data",
            "Analysis",
        ],

        checklist: [
            {
                id: "check-3-1",
                title: "Xác định field Student",
                completed: true,
            },
            {
                id: "check-3-2",
                title: "Xác định field Project",
                completed: true,
            },
            {
                id: "check-3-3",
                title: "Xác định field Task",
                completed: true,
            },
            {
                id: "check-3-4",
                title: "Xác định field Calendar Event",
                completed: false,
            },
            {
                id: "check-3-5",
                title: "Gửi mock data cho thành viên làm UI",
                completed: false,
            },
        ],

        reminderMinutesBefore: [
            1440,
            60,
        ],

        createdBy: "student-3",

        createdAt: "2026-09-09T08:00:00+07:00",

        updatedAt: "2026-09-10T16:00:00+07:00",

        completedAt: null,
    },


    // ========================================
    // TASK 4
    // ========================================
    {
        id: "task-4",

        projectId: "project-1",

        title: "Phác thảo giao diện / Wireframe",

        description:
            "Phác thảo giao diện Dashboard, Task List, Task Detail và Calendar.",

        assigneeIds: [
            "student-2",
        ],

        status: "in_progress",

        priority: "high",

        startAt: "2026-09-09T08:00:00+07:00",

        dueAt: "2026-09-12T23:59:00+07:00",

        labels: [
            "UI",
            "Wireframe",
        ],

        checklist: [
            {
                id: "check-4-1",
                title: "Dashboard",
                completed: true,
            },
            {
                id: "check-4-2",
                title: "Task List",
                completed: true,
            },
            {
                id: "check-4-3",
                title: "Task Detail",
                completed: false,
            },
            {
                id: "check-4-4",
                title: "Calendar",
                completed: false,
            },
        ],

        reminderMinutesBefore: [
            1440,
            60,
        ],

        createdBy: "student-2",

        createdAt: "2026-09-09T08:00:00+07:00",

        updatedAt: "2026-09-10T15:00:00+07:00",

        completedAt: null,
    },


    // ========================================
    // TASK 5
    // ========================================
    {
        id: "task-5",

        projectId: "project-1",

        title: "Thiết kế giao diện Dashboard",

        description:
            "Thiết kế UI Dashboard hoàn chỉnh dựa trên wireframe đã thống nhất.",

        assigneeIds: [
            "student-2",
        ],

        status: "todo",

        priority: "high",

        startAt: "2026-09-12T08:00:00+07:00",

        dueAt: "2026-09-15T23:59:00+07:00",

        labels: [
            "UI",
            "Frontend",
        ],

        checklist: [
            {
                id: "check-5-1",
                title: "Tổng quan task",
                completed: false,
            },
            {
                id: "check-5-2",
                title: "Task sắp đến hạn",
                completed: false,
            },
            {
                id: "check-5-3",
                title: "Task quá hạn",
                completed: false,
            },
            {
                id: "check-5-4",
                title: "Tiến độ project",
                completed: false,
            },
        ],

        reminderMinutesBefore: [
            1440,
        ],

        createdBy: "student-2",

        createdAt: "2026-09-10T10:00:00+07:00",

        updatedAt: "2026-09-10T10:00:00+07:00",

        completedAt: null,
    },


    // ========================================
    // TASK 6
    // ========================================
    {
        id: "task-6",

        projectId: "project-1",

        title: "Khởi tạo React project",

        description:
            "Khởi tạo project React bằng Vite, tạo folder structure và cài đặt các dependency cần thiết.",

        assigneeIds: [
            "student-1",
        ],

        status: "todo",

        priority: "high",

        startAt: "2026-09-11T08:00:00+07:00",

        dueAt: "2026-09-12T23:59:00+07:00",

        labels: [
            "Frontend",
            "Setup",
        ],

        checklist: [
            {
                id: "check-6-1",
                title: "Create React project bằng Vite",
                completed: false,
            },
            {
                id: "check-6-2",
                title: "Tạo folder structure",
                completed: false,
            },
            {
                id: "check-6-3",
                title: "Cài dependency",
                completed: false,
            },
            {
                id: "check-6-4",
                title: "Chạy thử project",
                completed: false,
            },
        ],

        reminderMinutesBefore: [
            1440,
        ],

        createdBy: "student-1",

        createdAt: "2026-09-10T10:30:00+07:00",

        updatedAt: "2026-09-10T10:30:00+07:00",

        completedAt: null,
    },


    // ========================================
    // TASK 7
    // ========================================
    {
        id: "task-7",

        projectId: "project-1",

        title: "Code Task List và Task Detail",

        description:
            "Code giao diện danh sách task và màn hình xem chi tiết một task.",

        assigneeIds: [
            "student-2",
            "student-1",
        ],

        status: "todo",

        priority: "high",

        startAt: "2026-09-13T08:00:00+07:00",

        dueAt: "2026-09-18T23:59:00+07:00",

        labels: [
            "Frontend",
            "Task",
        ],

        checklist: [
            {
                id: "check-7-1",
                title: "Code Task List",
                completed: false,
            },
            {
                id: "check-7-2",
                title: "Code Task Card",
                completed: false,
            },
            {
                id: "check-7-3",
                title: "Code Task Detail",
                completed: false,
            },
            {
                id: "check-7-4",
                title: "Hiển thị assignee và deadline",
                completed: false,
            },
        ],

        reminderMinutesBefore: [
            1440,
        ],

        createdBy: "student-2",

        createdAt: "2026-09-10T11:00:00+07:00",

        updatedAt: "2026-09-10T11:00:00+07:00",

        completedAt: null,
    },


    // ========================================
    // TASK 8
    // ========================================
    {
        id: "task-8",

        projectId: "project-1",

        title: "Code Calendar",

        description:
            "Code giao diện Calendar để sinh viên theo dõi task và deadline theo ngày.",

        assigneeIds: [
            "student-1",
        ],

        status: "todo",

        priority: "medium",

        startAt: "2026-09-16T08:00:00+07:00",

        dueAt: "2026-09-20T23:59:00+07:00",

        labels: [
            "Frontend",
            "Calendar",
        ],

        checklist: [
            {
                id: "check-8-1",
                title: "Hiển thị lịch",
                completed: false,
            },
            {
                id: "check-8-2",
                title: "Hiển thị deadline trên lịch",
                completed: false,
            },
            {
                id: "check-8-3",
                title: "Click event để xem task",
                completed: false,
            },
        ],

        reminderMinutesBefore: [
            1440,
        ],

        createdBy: "student-1",

        createdAt: "2026-09-10T11:30:00+07:00",

        updatedAt: "2026-09-10T11:30:00+07:00",

        completedAt: null,
    },


    // ========================================
    // TASK 9
    // ========================================
    {
        id: "task-9",

        projectId: "project-1",

        title: "Tích hợp mock data và kiểm tra logic",

        description:
            "Tích hợp mock data vào giao diện và kiểm tra logic lọc task, overdue, priority và checklist progress.",

        assigneeIds: [
            "student-3",
        ],

        status: "todo",

        priority: "high",

        startAt: "2026-09-19T08:00:00+07:00",

        dueAt: "2026-09-22T23:59:00+07:00",

        labels: [
            "Data",
            "Integration",
        ],

        checklist: [
            {
                id: "check-9-1",
                title: "Tích hợp Student data",
                completed: false,
            },
            {
                id: "check-9-2",
                title: "Tích hợp Project data",
                completed: false,
            },
            {
                id: "check-9-3",
                title: "Tích hợp Task data",
                completed: false,
            },
            {
                id: "check-9-4",
                title: "Kiểm tra filter task",
                completed: false,
            },
            {
                id: "check-9-5",
                title: "Kiểm tra overdue",
                completed: false,
            },
            {
                id: "check-9-6",
                title: "Kiểm tra priority",
                completed: false,
            },
            {
                id: "check-9-7",
                title: "Kiểm tra checklist progress",
                completed: false,
            },
        ],

        reminderMinutesBefore: [
            1440,
            60,
        ],

        createdBy: "student-3",

        createdAt: "2026-09-10T12:00:00+07:00",

        updatedAt: "2026-09-10T12:00:00+07:00",

        completedAt: null,
    },


    // ========================================
    // TASK 10
    // ========================================
    {
        id: "task-10",

        projectId: "project-1",

        title: "Test toàn bộ hệ thống",

        description:
            "Kiểm tra toàn bộ chức năng và giao diện trước khi demo.",

        assigneeIds: [
            "student-1",
            "student-2",
            "student-3",
        ],

        status: "todo",

        priority: "high",

        startAt: "2026-09-23T08:00:00+07:00",

        dueAt: "2026-09-25T23:59:00+07:00",

        labels: [
            "Testing",
        ],

        checklist: [
            {
                id: "check-10-1",
                title: "Test Dashboard",
                completed: false,
            },
            {
                id: "check-10-2",
                title: "Test Task List",
                completed: false,
            },
            {
                id: "check-10-3",
                title: "Test Task Detail",
                completed: false,
            },
            {
                id: "check-10-4",
                title: "Test Calendar",
                completed: false,
            },
            {
                id: "check-10-5",
                title: "Test Loading / Empty / Error",
                completed: false,
            },
        ],

        reminderMinutesBefore: [
            1440,
        ],

        createdBy: "student-3",

        createdAt: "2026-09-10T12:30:00+07:00",

        updatedAt: "2026-09-10T12:30:00+07:00",

        completedAt: null,
    },


    // ========================================
    // TASK 11
    // ========================================
    {
        id: "task-11",

        projectId: "project-1",

        title: "Chuẩn bị demo và slide",

        description:
            "Chuẩn bị nội dung demo, slide thuyết trình và phân chia phần trình bày cho các thành viên.",

        assigneeIds: [
            "student-1",
            "student-2",
            "student-3",
        ],

        status: "todo",

        priority: "high",

        startAt: "2026-09-25T08:00:00+07:00",

        dueAt: "2026-09-28T23:59:00+07:00",

        labels: [
            "Presentation",
            "Demo",
        ],

        checklist: [
            {
                id: "check-11-1",
                title: "Chuẩn bị slide",
                completed: false,
            },
            {
                id: "check-11-2",
                title: "Chuẩn bị demo flow",
                completed: false,
            },
            {
                id: "check-11-3",
                title: "Phân chia phần trình bày",
                completed: false,
            },
            {
                id: "check-11-4",
                title: "Chạy thử demo",
                completed: false,
            },
        ],

        reminderMinutesBefore: [
            1440,
            60,
        ],

        createdBy: "student-3",

        createdAt: "2026-09-10T13:00:00+07:00",

        updatedAt: "2026-09-10T13:00:00+07:00",

        completedAt: null,
    },
];


// ========================================
// 4. CALENDAR EVENTS
// ========================================

export const calendarEvents = [
    {
        id: "event-1",

        projectId: "project-1",

        taskId: "task-3",

        title: "Deadline - Phân tích yêu cầu và dữ liệu",

        type: "deadline",

        startAt: "2026-09-11T18:00:00+07:00",

        endAt: "2026-09-11T18:00:00+07:00",

        attendeeIds: [
            "student-3",
        ],

        reminderMinutesBefore: [
            1440,
            60,
        ],
    },

    {
        id: "event-2",

        projectId: "project-1",

        taskId: "task-4",

        title: "Deadline - Hoàn thành Wireframe",

        type: "deadline",

        startAt: "2026-09-12T23:59:00+07:00",

        endAt: "2026-09-12T23:59:00+07:00",

        attendeeIds: [
            "student-2",
        ],

        reminderMinutesBefore: [
            1440,
        ],
    },

    {
        id: "event-3",

        projectId: "project-1",

        taskId: null,

        title: "Họp nhóm kiểm tra tiến độ",

        description:
            "Cả nhóm kiểm tra tiến độ project và các task sắp đến hạn.",

        type: "meeting",

        startAt: "2026-09-20T19:00:00+07:00",

        endAt: "2026-09-20T20:00:00+07:00",

        attendeeIds: [
            "student-1",
            "student-2",
            "student-3",
        ],

        reminderMinutesBefore: [
            30,
        ],
    },

    {
        id: "event-4",

        projectId: "project-1",

        taskId: "task-11",

        title: "Demo Student Task & Deadline Manager",

        description:
            "Demo sản phẩm và trình bày project trên lớp.",

        type: "presentation",

        startAt: "2026-09-29T08:00:00+07:00",

        endAt: "2026-09-29T10:00:00+07:00",

        attendeeIds: [
            "student-1",
            "student-2",
            "student-3",
        ],

        reminderMinutesBefore: [
            1440,
            60,
        ],
    },
];


// ========================================
// 5. UI STATES
// Loading / Success / Empty / Error
// ========================================

export const taskListStates = {
    loading: {
        status: "loading",
        data: null,
        error: null,
    },

    success: {
        status: "success",
        data: tasks,
        error: null,
    },

    empty: {
        status: "success",
        data: [],
        error: null,
    },

    error: {
        status: "error",
        data: null,
        error: {
            message: "Unable to load tasks.",
        },
    },
};