// src/tests/uiFeatures.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { mockApi } from "../src/services/mockApi";
import {
  INITIAL_MEMBERS,
  INITIAL_LABELS,
  getLabelColor,
  getStudentName,
} from "../src/utils/constants";

describe("UI Features & Consistency Tests", () => {
  beforeEach(async () => {
    await mockApi.resetMockData();
  });

  describe("Constants & Shared Helpers", () => {
    it("should have correct initial members and labels", () => {
      expect(INITIAL_MEMBERS).toHaveLength(3);
      expect(INITIAL_MEMBERS.map((m) => m.id)).toEqual([
        "student-1",
        "student-2",
        "student-3",
      ]);

      expect(INITIAL_LABELS).toContain("Frontend");
      expect(INITIAL_LABELS).toContain("Backend");
      expect(INITIAL_LABELS).toContain("Bug");
      expect(INITIAL_LABELS.length).toBeGreaterThanOrEqual(7);
    });

    it("should return consistent label colors", () => {
      const color1 = getLabelColor("Frontend");
      const color2 = getLabelColor("Frontend");
      expect(color1).toBe(color2);
      expect(color1).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("should resolve student name correctly", () => {
      expect(getStudentName(INITIAL_MEMBERS, "student-1")).toBe("Bùi Duy Phong");
      expect(getStudentName(INITIAL_MEMBERS, "unknown-id")).toBe("unknown-id");
    });
  });

  describe("Create Task - Member & Label Array Contract", () => {
    it("should accept selected assigneeIds and labels arrays from dropdown selection", async () => {
      const created = await mockApi.createTask({
        projectId: "project-1",
        title: "Test Task with Members & Labels",
        description: "Created using dropdown picker UI",
        status: "todo",
        priority: "high",
        deadline: new Date(Date.now() + 86400000).toISOString(),
        assigneeIds: ["student-1", "student-3"],
        labels: ["Frontend", "UI/UX"],
        checklist: [],
      });

      expect(created.id).toBeDefined();
      expect(created.assigneeIds).toEqual(["student-1", "student-3"]);
      expect(created.labels).toEqual(["Frontend", "UI/UX"]);

      // Verify fetch by ID
      const fetched = await mockApi.getTaskById(created.id);
      expect(fetched.assigneeIds).toEqual(["student-1", "student-3"]);
      expect(fetched.labels).toEqual(["Frontend", "UI/UX"]);
    });
  });

  describe("Task Detail - Acceptance Criteria (Add an item)", () => {
    it("should add and update checklist items without window.prompt", async () => {
      const task = await mockApi.createTask({
        projectId: "project-1",
        title: "Checklist Test Task",
        status: "in_progress",
        deadline: new Date(Date.now() + 86400000).toISOString(),
        checklist: [],
      });

      expect(task.checklist).toEqual([]);

      // In-app add item
      const newItem = {
        id: `check-${Date.now()}`,
        title: "In-App Added Acceptance Criterion",
        completed: false,
      };

      const withItem = await mockApi.updateTask(task.id, {
        checklist: [newItem],
      });

      expect(withItem.checklist).toHaveLength(1);
      expect(withItem.checklist[0].title).toBe("In-App Added Acceptance Criterion");
      expect(withItem.checklist[0].completed).toBe(false);

      // In-app toggle completion
      const toggled = await mockApi.updateTask(task.id, {
        checklist: [{ ...newItem, completed: true }],
      });
      expect(toggled.checklist[0].completed).toBe(true);

      // In-app edit item title
      const edited = await mockApi.updateTask(task.id, {
        checklist: [{ ...newItem, title: "Updated Criterion Title", completed: true }],
      });
      expect(edited.checklist[0].title).toBe("Updated Criterion Title");
    });
  });

  describe("Create & Delete Project Flow", () => {
    it("should create a project and update dashboard stats", async () => {
      const initialStats = await mockApi.getDashboardStats();

      const newProj = await mockApi.createProject({
        name: "SE Final Project",
        courseName: "Software Engineering",
        description: "Course prototype",
        deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      });

      expect(newProj.id).toBeDefined();
      expect(newProj.name).toBe("SE Final Project");

      const statsAfter = await mockApi.getDashboardStats();
      expect(statsAfter.totalProjects).toBe(initialStats.totalProjects + 1);
    });

    it("should delete a project and all associated tasks (cascading delete)", async () => {
      // 1. Create a project
      const proj = await mockApi.createProject({
        name: "Temporary Project",
        courseName: "Testing Course",
      });

      // 2. Create two tasks under this project
      const task1 = await mockApi.createTask({
        projectId: proj.id,
        title: "Task 1 for Temp Project",
        deadline: new Date(Date.now() + 86400000).toISOString(),
      });
      const task2 = await mockApi.createTask({
        projectId: proj.id,
        title: "Task 2 for Temp Project",
        deadline: new Date(Date.now() + 86400000).toISOString(),
      });

      // Verify tasks exist
      const tasksBefore = await mockApi.getTasks(proj.id);
      expect(tasksBefore).toHaveLength(2);

      const statsBefore = await mockApi.getDashboardStats();

      // 3. Delete the project
      const deleteResult = await mockApi.deleteProject(proj.id);
      expect(deleteResult.success).toBe(true);
      expect(deleteResult.deletedId).toBe(proj.id);
      expect(deleteResult.deletedTasksCount).toBe(2);

      // 4. Verify project is removed
      const projectsAfter = await mockApi.getProjects();
      expect(projectsAfter.find((p) => p.id === proj.id)).toBeUndefined();
      await expect(mockApi.getProjectById(proj.id)).rejects.toThrow();

      // 5. Verify tasks belonging to project are also deleted
      const tasksAfter = await mockApi.getTasks(proj.id);
      expect(tasksAfter).toHaveLength(0);
      await expect(mockApi.getTaskById(task1.id)).rejects.toThrow();
      await expect(mockApi.getTaskById(task2.id)).rejects.toThrow();

      // 6. Verify dashboard stats updated
      const statsAfter = await mockApi.getDashboardStats();
      expect(statsAfter.totalProjects).toBe(statsBefore.totalProjects - 1);
      expect(statsAfter.totalTasks).toBe(statsBefore.totalTasks - 2);
    });
  });

  describe("Standardized Avatar Initials", () => {
    it("should correctly extract the Firstname initial", async () => {
      const { getAvatarInitial, getFirstName } = await import("../src/utils/avatar");

      // Firstname extraction
      expect(getFirstName("Bùi Duy Phong")).toBe("Phong");
      expect(getFirstName("Trần Thị Tố Như")).toBe("Như");
      expect(getFirstName("Văn Phạm Thảo Nhi")).toBe("Nhi");
      expect(getFirstName("Phong")).toBe("Phong");

      // Standardized initial extraction
      expect(getAvatarInitial("Bùi Duy Phong")).toBe("P");
      expect(getAvatarInitial("Trần Thị Tố Như")).toBe("N");
      expect(getAvatarInitial("Văn Phạm Thảo Nhi")).toBe("N");
      expect(getAvatarInitial("Phong")).toBe("P");
      expect(getAvatarInitial("  Bùi   Duy   Phong  ")).toBe("P");
      expect(getAvatarInitial("")).toBe("?");
      expect(getAvatarInitial(null)).toBe("?");
    });
  });

  describe("Delete Member - Task Assignment Cascading", () => {
    it("should delete member and remove assignment from all tasks in project", async () => {
      // 1. Create a member
      const member = await mockApi.createMember("project-1", {
        name: "Nguyễn Văn An",
        mssv: "23110999",
        email: "vanan@gmail.com",
      });

      // 2. Create a task assigned to this member
      const task = await mockApi.createTask({
        projectId: "project-1",
        title: "Task with Member to Delete",
        status: "todo",
        assigneeIds: [member.id, "student-1"],
      });

      expect(task.assigneeIds).toContain(member.id);

      // 3. Delete the member
      const result = await mockApi.deleteMember("project-1", member.id);
      expect(result.success).toBe(true);
      expect(result.deletedId).toBe(member.id);

      // 4. Verify member is removed from members collection
      const membersAfter = await mockApi.getMembers("project-1");
      expect(membersAfter.find((m) => m.id === member.id)).toBeUndefined();

      // 5. Verify task no longer has this member in assigneeIds
      const taskAfter = await mockApi.getTaskById(task.id);
      expect(taskAfter.assigneeIds).not.toContain(member.id);
      expect(taskAfter.assigneeIds).toContain("student-1");
    });
  });

  describe("Delete Label - Task Labels Cascading", () => {
    it("should delete label and remove it from tasks in project", async () => {
      // 1. Create a label
      const label = await mockApi.createLabel("project-1", {
        name: "TemporaryLabel",
        color: "#f87168",
      });

      // 2. Create a task with this label
      const task = await mockApi.createTask({
        projectId: "project-1",
        title: "Task with Label to Delete",
        status: "todo",
        labels: ["TemporaryLabel", "Frontend"],
      });

      expect(task.labels).toContain("TemporaryLabel");

      // 3. Delete the label
      const result = await mockApi.deleteLabel("project-1", label.id);
      expect(result.success).toBe(true);
      expect(result.deletedId).toBe(label.id);

      // 4. Verify label is removed from labels list
      const labelsAfter = await mockApi.getLabels("project-1");
      expect(labelsAfter.find((l) => l.id === label.id)).toBeUndefined();

      // 5. Verify task no longer has this label
      const taskAfter = await mockApi.getTaskById(task.id);
      expect(taskAfter.labels).not.toContain("TemporaryLabel");
      expect(taskAfter.labels).toContain("Frontend");
    });
  });

  describe("Status Constants & Centralized Helpers", () => {
    it("should resolve status labels consistently", async () => {
      const { DEFAULT_STATUSES, getStatusLabel } = await import("../src/utils/constants");

      expect(DEFAULT_STATUSES).toHaveLength(3);
      expect(DEFAULT_STATUSES.map((s) => s.id)).toEqual(["todo", "in_progress", "done"]);

      expect(getStatusLabel(DEFAULT_STATUSES, "todo")).toBe("To Do");
      expect(getStatusLabel(DEFAULT_STATUSES, "in_progress")).toBe("In Progress");
      expect(getStatusLabel(DEFAULT_STATUSES, "done")).toBe("Done");

      const customStatuses = [
        ...DEFAULT_STATUSES,
        { id: "review", name: "Code Review" },
        { id: "qa", name: "QA Testing" },
      ];
      expect(getStatusLabel(customStatuses, "review")).toBe("Code Review");
      expect(getStatusLabel(customStatuses, "qa")).toBe("QA Testing");
      expect(getStatusLabel(customStatuses, "unregistered")).toBe("unregistered");
      expect(getStatusLabel([], "")).toBe("");
    });
  });

  describe("Custom Status Management & Task Movement", () => {
    it("should retrieve default statuses and create custom statuses", async () => {
      const initial = await mockApi.getStatuses("project-1");
      expect(initial.length).toBeGreaterThanOrEqual(3);
      expect(initial.map((s) => s.id)).toContain("todo");
      expect(initial.map((s) => s.id)).toContain("in_progress");
      expect(initial.map((s) => s.id)).toContain("done");

      // Create new status
      const created = await mockApi.createStatus("project-1", {
        name: "Code Review",
      });
      expect(created.id).toBeDefined();
      expect(created.name).toBe("Code Review");
      expect(created.projectId).toBe("project-1");

      const statusesAfter = await mockApi.getStatuses("project-1");
      expect(statusesAfter.find((s) => s.id === created.id)).toBeDefined();
    });

    it("should allow moving a task to a newly created status (drag & drop simulation)", async () => {
      // 1. Create a custom status
      const reviewStatus = await mockApi.createStatus("project-1", {
        name: "Design QA",
      });

      // 2. Create a task in 'todo'
      const task = await mockApi.createTask({
        projectId: "project-1",
        title: "Draggable Task",
        status: "todo",
      });
      expect(task.status).toBe("todo");

      // 3. Move task to the new custom status (as drag & drop does)
      const moved = await mockApi.updateTask(task.id, {
        status: reviewStatus.id,
      });
      expect(moved.status).toBe(reviewStatus.id);

      // 4. Verify fetched task reflects the new status
      const fetched = await mockApi.getTaskById(task.id);
      expect(fetched.status).toBe(reviewStatus.id);
    });
  });
});
