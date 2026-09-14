// src/tests/taskListRefactor.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { taskService } from "../src/services/taskService";
import { mockApi } from "../src/services/mockApi";
import {
  getChecklistProgress,
  isTaskOverdue,
  formatShortDate,
} from "../src/utils/taskHelpers";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("TaskList Refactoring & Architecture", () => {
  beforeEach(async () => {
    await mockApi.resetMockData();
  });

  describe("taskHelpers for TaskList", () => {
    describe("getChecklistProgress", () => {
      it("returns null for empty or non-array checklist", () => {
        expect(getChecklistProgress([])).toBeNull();
        expect(getChecklistProgress(null)).toBeNull();
        expect(getChecklistProgress(undefined)).toBeNull();
      });

      it("calculates progress text and isAllChecked correctly", () => {
        const partial = [
          { id: "1", title: "Task 1", completed: true },
          { id: "2", title: "Task 2", completed: false },
          { id: "3", title: "Task 3", completed: true },
        ];
        const res = getChecklistProgress(partial);
        expect(res).toEqual({
          text: "2/3",
          isAllChecked: false,
          completed: 2,
          total: 3,
        });

        const complete = [
          { id: "1", title: "Task 1", completed: true },
          { id: "2", title: "Task 2", completed: true },
        ];
        const resComplete = getChecklistProgress(complete);
        expect(resComplete.isAllChecked).toBe(true);
        expect(resComplete.text).toBe("2/2");
      });
    });

    describe("isTaskOverdue", () => {
      it("returns true for a past date", () => {
        const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        expect(isTaskOverdue(past)).toBe(true);
      });

      it("returns false for a future date", () => {
        const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        expect(isTaskOverdue(future)).toBe(false);
      });

      it("handles null, undefined, or invalid date safely", () => {
        expect(isTaskOverdue(null)).toBe(false);
        expect(isTaskOverdue(undefined)).toBe(false);
        expect(isTaskOverdue("invalid-date")).toBe(false);
      });
    });

    describe("formatShortDate", () => {
      it("formats valid date string to DD/MM", () => {
        const formatted = formatShortDate("2026-11-20T00:00:00.000Z");
        expect(formatted).toBe("20/11");
      });

      it("returns fallback on null, undefined, or invalid date", () => {
        expect(formatShortDate(null)).toBe("");
        expect(formatShortDate(undefined, "-")).toBe("-");
        expect(formatShortDate("invalid-date", "N/A")).toBe("N/A");
      });
    });
  });

  describe("taskService Board Methods", () => {
    it("fetches coordinated board data for a project", async () => {
      const data = await taskService.getBoardData("project-1");
      expect(data).toBeDefined();
      expect(Array.isArray(data.tasks)).toBe(true);
      expect(Array.isArray(data.members)).toBe(true);
      expect(Array.isArray(data.labels)).toBe(true);
      expect(Array.isArray(data.statuses)).toBe(true);
      expect(data.statuses.length).toBeGreaterThanOrEqual(3);
    });

    it("creates a new status column in a project", async () => {
      const created = await taskService.createStatus("project-1", {
        name: "Testing QA",
      });
      expect(created).toBeDefined();
      expect(created.name).toBe("Testing QA");
      expect(created.projectId).toBe("project-1");

      const board = await taskService.getBoardData("project-1");
      expect(board.statuses.some((s) => s.name === "Testing QA")).toBe(true);
    });
  });

  describe("Architectural Boundaries & Separation of Concerns", () => {
    const taskListJsx = fs.readFileSync(
      path.resolve(__dirname, "../src/pages/TaskList.jsx"),
      "utf-8"
    );
    const useTaskListJs = fs.readFileSync(
      path.resolve(__dirname, "../src/hooks/useTaskList.js"),
      "utf-8"
    );

    it("ensures TaskList.jsx does NOT import or call mockApi directly", () => {
      expect(taskListJsx.includes("mockApi")).toBe(false);
    });

    it("ensures TaskList.jsx delegates board orchestration to useTaskList", () => {
      expect(taskListJsx.includes("useTaskList")).toBe(true);
      expect(taskListJsx.includes("handleDropTask")).toBe(true);
      expect(taskListJsx.includes("handleCreateStatus")).toBe(true);
      expect(taskListJsx.includes("retry")).toBe(true);
    });

    it("ensures useTaskList.js does NOT import mockApi directly", () => {
      expect(useTaskListJs.includes("mockApi")).toBe(false);
    });

    it("ensures useTaskList.js consumes taskService", () => {
      expect(useTaskListJs.includes("taskService")).toBe(true);
    });
  });
});
