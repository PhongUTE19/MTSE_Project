// src/tests/taskDetailRefactor.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { taskService } from "../src/services/taskService";
import { mockApi } from "../src/services/mockApi";
import { DEFAULT_STATUSES } from "../src/utils/constants";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("TaskDetail Refactoring & taskService Architecture", () => {
  beforeEach(async () => {
    await mockApi.resetMockData();
  });

  describe("taskService Abstraction Layer", () => {
    it("fetches task by ID correctly", async () => {
      const task = await taskService.getTaskById("task-1");
      expect(task).toBeDefined();
      expect(task.id).toBe("task-1");
      expect(task.title).toBeDefined();
    });

    it("throws when fetching a non-existent task ID", async () => {
      await expect(taskService.getTaskById("non-existent-task-999")).rejects.toThrow();
    });

    it("fetches project reference data in a single coordinated call without duplicate fetches", async () => {
      const refData = await taskService.getProjectReferenceData("project-1");
      expect(refData).toBeDefined();
      expect(refData.project).toBeDefined();
      expect(refData.project.id).toBe("project-1");
      expect(Array.isArray(refData.members)).toBe(true);
      expect(refData.members.length).toBeGreaterThan(0);
      expect(Array.isArray(refData.labels)).toBe(true);
      expect(Array.isArray(refData.statuses)).toBe(true);
      expect(refData.statuses.length).toBeGreaterThanOrEqual(3);
    });

    it("returns graceful default reference data when projectId is null or undefined", async () => {
      const nullRef = await taskService.getProjectReferenceData(null);
      expect(nullRef.project).toBeNull();
      expect(nullRef.members).toEqual([]);
      expect(nullRef.labels).toEqual([]);
      expect(nullRef.statuses).toEqual(DEFAULT_STATUSES);

      const undefinedRef = await taskService.getProjectReferenceData(undefined);
      expect(undefinedRef.project).toBeNull();
      expect(undefinedRef.members).toEqual([]);
      expect(undefinedRef.labels).toEqual([]);
      expect(undefinedRef.statuses).toEqual(DEFAULT_STATUSES);
    });

    it("fetches labels for a project", async () => {
      const labels = await taskService.getLabels("project-1");
      expect(Array.isArray(labels)).toBe(true);
      expect(labels.length).toBeGreaterThan(0);

      const empty = await taskService.getLabels(null);
      expect(empty).toEqual([]);
    });

    it("updates task attributes via taskService", async () => {
      const updated = await taskService.updateTask("task-1", {
        title: "Refactored Title Test",
        priority: "high",
      });

      expect(updated.title).toBe("Refactored Title Test");
      expect(updated.priority).toBe("high");

      const fetched = await taskService.getTaskById("task-1");
      expect(fetched.title).toBe("Refactored Title Test");
      expect(fetched.priority).toBe("high");
    });

    it("deletes a task via taskService", async () => {
      const result = await taskService.deleteTask("task-1");
      expect(result.success).toBe(true);
      expect(result.deletedId).toBe("task-1");

      await expect(taskService.getTaskById("task-1")).rejects.toThrow();
    });
  });

  describe("Architectural Boundary Enforcement", () => {
    it("verifies TaskDetail.jsx does NOT directly import or call mockApi", () => {
      const taskDetailPath = path.resolve(__dirname, "../src/pages/TaskDetail.jsx");
      const content = fs.readFileSync(taskDetailPath, "utf-8");

      expect(content).not.toMatch(/from\s+["'].*mockApi["']/);
      expect(content).not.toMatch(/mockApi\./);
    });

    it("verifies none of the taskDetail subcomponents import or call mockApi", () => {
      const subcomponentsDir = path.resolve(__dirname, "../src/components/taskDetail");
      const files = fs.readdirSync(subcomponentsDir);

      expect(files.length).toBeGreaterThanOrEqual(6);

      for (const file of files) {
        if (!file.endsWith(".jsx")) continue;
        const filePath = path.join(subcomponentsDir, file);
        const content = fs.readFileSync(filePath, "utf-8");

        expect(content).not.toMatch(/from\s+["'].*mockApi["']/);
        expect(content).not.toMatch(/mockApi\./);
      }
    });

    it("verifies useTaskDetail.js imports taskService instead of mockApi", () => {
      const hookPath = path.resolve(__dirname, "../src/hooks/useTaskDetail.js");
      const content = fs.readFileSync(hookPath, "utf-8");

      expect(content).toMatch(/from\s+["'].*taskService["']/);
      expect(content).not.toMatch(/from\s+["'].*mockApi["']/);
      expect(content).not.toMatch(/mockApi\./);
    });

    it("verifies useTaskDetail.js tracks lastSavedTitleRef to persist title edits on blur", () => {
      const hookPath = path.resolve(__dirname, "../src/hooks/useTaskDetail.js");
      const content = fs.readFileSync(hookPath, "utf-8");

      expect(content).toMatch(/lastSavedTitleRef/);
      expect(content).toMatch(/handleTitleSave/);
    });
  });

  describe("Task Title Mutation and Persistence", () => {
    it("persists title updates via taskService.updateTask", async () => {
      const initialTask = await taskService.getTaskById("task-1");
      expect(initialTask.title).not.toBe("Persisted Title Update Test");

      const updated = await taskService.updateTask("task-1", {
        title: "Persisted Title Update Test",
      });
      expect(updated.title).toBe("Persisted Title Update Test");

      // Verify that re-fetching (simulating page reload) retains the updated title
      const reloaded = await taskService.getTaskById("task-1");
      expect(reloaded.title).toBe("Persisted Title Update Test");
    });
  });

  describe("Checklist and Mutation Logic Integrity", () => {
    it("handles adding, updating, and removing checklist items", async () => {
      // 1. Add item
      const item1 = { id: "chk-1", title: "Write documentation", completed: false };
      const item2 = { id: "chk-2", title: "Write unit tests", completed: false };

      let task = await taskService.updateTask("task-2", {
        checklist: [item1, item2],
      });
      expect(task.checklist).toHaveLength(2);

      // 2. Toggle completion
      const toggled = task.checklist.map((c) => (c.id === "chk-1" ? { ...c, completed: true } : c));
      task = await taskService.updateTask("task-2", { checklist: toggled });
      expect(task.checklist.find((c) => c.id === "chk-1").completed).toBe(true);
      expect(task.checklist.find((c) => c.id === "chk-2").completed).toBe(false);

      // 3. Edit title
      const edited = task.checklist.map((c) =>
        c.id === "chk-2" ? { ...c, title: "Write comprehensive unit tests" } : c
      );
      task = await taskService.updateTask("task-2", { checklist: edited });
      expect(task.checklist.find((c) => c.id === "chk-2").title).toBe("Write comprehensive unit tests");

      // 4. Delete item
      const filtered = task.checklist.filter((c) => c.id !== "chk-1");
      task = await taskService.updateTask("task-2", { checklist: filtered });
      expect(task.checklist).toHaveLength(1);
      expect(task.checklist[0].id).toBe("chk-2");

      // 5. Delete entire checklist
      task = await taskService.updateTask("task-2", { checklist: [] });
      expect(task.checklist).toEqual([]);
    });

    it("handles member and label toggling", async () => {
      let task = await taskService.getTaskById("task-2");
      const initialMembers = task.assigneeIds || [];

      // Toggle add member (member-1-1 is not on task-2 initially)
      const newMemberId = "member-1-1";
      const updatedMembers = initialMembers.includes(newMemberId)
        ? initialMembers.filter((id) => id !== newMemberId)
        : [...initialMembers, newMemberId];

      task = await taskService.updateTask("task-2", { assigneeIds: updatedMembers });
      expect(task.assigneeIds).toContain(newMemberId);

      // Toggle remove member
      const removedMembers = task.assigneeIds.filter((id) => id !== newMemberId);
      task = await taskService.updateTask("task-2", { assigneeIds: removedMembers });
      expect(task.assigneeIds).not.toContain(newMemberId);
    });
  });

  describe("Date Utilities & Domain Constants", () => {
    it("formats dates for date input correctly", async () => {
      const { formatDateForInput, parseInputToIsoDate } = await import("../src/utils/date");

      expect(formatDateForInput("2026-09-15T10:30:00.000Z")).toBe("2026-09-15");
      expect(formatDateForInput(null)).toBe("");
      expect(formatDateForInput("invalid-date")).toBe("");

      expect(parseInputToIsoDate("2026-09-15")).toBe("2026-09-15T00:00:00.000Z");
      expect(parseInputToIsoDate("")).toBeNull();
      expect(parseInputToIsoDate(null)).toBeNull();
    });

    it("exposes standardized PRIORITIES and REMINDER_OPTIONS constants", async () => {
      const { PRIORITIES, REMINDER_OPTIONS } = await import("../src/utils/constants");

      expect(Array.isArray(PRIORITIES)).toBe(true);
      expect(PRIORITIES.map((p) => p.id)).toEqual(["low", "medium", "high"]);

      expect(Array.isArray(REMINDER_OPTIONS)).toBe(true);
      expect(REMINDER_OPTIONS.map((r) => r.value)).toEqual(["", "15", "60", "1440"]);
    });
  });

  describe("ConfirmDialog Adoption & Error Propagation", () => {
    it("verifies no window.confirm calls remain in taskDetail components", () => {
      const subcomponentsDir = path.resolve(__dirname, "../src/components/taskDetail");
      const files = fs.readdirSync(subcomponentsDir);

      for (const file of files) {
        if (!file.endsWith(".jsx")) continue;
        const filePath = path.join(subcomponentsDir, file);
        const content = fs.readFileSync(filePath, "utf-8");

        expect(content).not.toMatch(/window\.confirm/);
      }
    });

    it("verifies ConfirmDialog is imported in TaskActions and TaskChecklist", () => {
      const actionsContent = fs.readFileSync(
        path.resolve(__dirname, "../src/components/taskDetail/TaskActions.jsx"),
        "utf-8"
      );
      const checklistContent = fs.readFileSync(
        path.resolve(__dirname, "../src/components/taskDetail/TaskChecklist.jsx"),
        "utf-8"
      );

      expect(actionsContent).toMatch(/ConfirmDialog/);
      expect(checklistContent).toMatch(/ConfirmDialog/);
    });

    it("ensures taskService.getLabels propagates unexpected errors", async () => {
      const origGetLabels = mockApi.getLabels;
      mockApi.getLabels = async () => {
        throw new Error("Network timeout");
      };

      try {
        await expect(taskService.getLabels("project-1")).rejects.toThrow("Network timeout");
      } finally {
        mockApi.getLabels = origGetLabels;
      }
    });
  });
});


