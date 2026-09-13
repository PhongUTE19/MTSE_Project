// src/tests/uiFeatures.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { mockApi } from "../services/mockApi";
import {
  PREDEFINED_MEMBERS,
  PREDEFINED_LABELS,
  getLabelColor,
  getStudentName,
} from "../utils/constants";

describe("UI Features & Consistency Tests", () => {
  beforeEach(async () => {
    await mockApi.resetMockData();
  });

  describe("Constants & Shared Helpers", () => {
    it("should have correct predefined members and labels", () => {
      expect(PREDEFINED_MEMBERS).toHaveLength(3);
      expect(PREDEFINED_MEMBERS.map((m) => m.id)).toEqual([
        "student-1",
        "student-2",
        "student-3",
      ]);

      expect(PREDEFINED_LABELS).toContain("Frontend");
      expect(PREDEFINED_LABELS).toContain("Backend");
      expect(PREDEFINED_LABELS).toContain("Bug");
      expect(PREDEFINED_LABELS.length).toBeGreaterThanOrEqual(7);
    });

    it("should return consistent label colors", () => {
      const color1 = getLabelColor("Frontend");
      const color2 = getLabelColor("Frontend");
      expect(color1).toBe(color2);
      expect(color1).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it("should resolve student name correctly", () => {
      expect(getStudentName(PREDEFINED_MEMBERS, "student-1")).toBe("Bùi Duy Phong");
      expect(getStudentName(PREDEFINED_MEMBERS, "unknown-id")).toBe("unknown-id");
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
});
