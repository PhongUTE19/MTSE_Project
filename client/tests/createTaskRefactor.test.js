// src/tests/createTaskRefactor.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { taskService } from "../src/services/taskService";
import { mockApi } from "../src/services/mockApi";
import { parseChecklistInput, toggleArrayItem } from "../src/utils/taskHelpers";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("CreateTask Refactoring & Architecture", () => {
  beforeEach(async () => {
    await mockApi.resetMockData();
  });

  describe("taskHelpers Utility Functions", () => {
    describe("parseChecklistInput", () => {
      it("returns an empty array when given empty string, null, or undefined", () => {
        expect(parseChecklistInput("")).toEqual([]);
        expect(parseChecklistInput(null)).toEqual([]);
        expect(parseChecklistInput(undefined)).toEqual([]);
        expect(parseChecklistInput("   \n   \n   ")).toEqual([]);
      });

      it("splits newline-separated items and creates proper checklist item objects", () => {
        const raw = "Write unit tests\n  Update documentation  \n\nFix responsive styles\n";
        const result = parseChecklistInput(raw);

        expect(result).toHaveLength(3);
        expect(result[0].title).toBe("Write unit tests");
        expect(result[0].completed).toBe(false);
        expect(result[0].id).toBeDefined();

        expect(result[1].title).toBe("Update documentation");
        expect(result[1].completed).toBe(false);

        expect(result[2].title).toBe("Fix responsive styles");
        expect(result[2].completed).toBe(false);
      });
    });

    describe("toggleArrayItem", () => {
      it("adds an item to an array if not already present", () => {
        const initial = ["student-1", "student-2"];
        const updated = toggleArrayItem(initial, "student-3");
        expect(updated).toEqual(["student-1", "student-2", "student-3"]);
        // original must not be mutated
        expect(initial).toEqual(["student-1", "student-2"]);
      });

      it("removes an item from an array if already present", () => {
        const initial = ["Frontend", "Backend", "Testing"];
        const updated = toggleArrayItem(initial, "Backend");
        expect(updated).toEqual(["Frontend", "Testing"]);
      });

      it("handles null or undefined input gracefully", () => {
        expect(toggleArrayItem(null, "item-1")).toEqual(["item-1"]);
        expect(toggleArrayItem(undefined, "item-1")).toEqual(["item-1"]);
      });
    });
  });

  describe("taskService.createTask", () => {
    it("creates a new task and persists it", async () => {
      const taskData = {
        projectId: "project-1",
        title: "Integration Test Task",
        description: "Testing createTask service method",
        status: "todo",
        priority: "high",
        deadline: "2026-12-31T18:00",
        assigneeIds: ["student-1"],
        labels: ["Testing"],
        checklist: [
          { id: "check-1", title: "Subtask 1", completed: false },
        ],
      };

      const created = await taskService.createTask(taskData);
      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.title).toBe("Integration Test Task");
      expect(created.projectId).toBe("project-1");
      expect(created.priority).toBe("high");
      expect(created.assigneeIds).toEqual(["student-1"]);
      expect(created.labels).toEqual(["Testing"]);
      expect(created.checklist).toHaveLength(1);

      // Verify task can be retrieved by ID
      const fetched = await taskService.getTaskById(created.id);
      expect(fetched.id).toBe(created.id);
      expect(fetched.title).toBe("Integration Test Task");
    });
  });

  describe("Architectural Boundaries & Separation of Concerns", () => {
    const createTaskJsx = fs.readFileSync(
      path.resolve(__dirname, "../src/pages/CreateTask.jsx"),
      "utf-8"
    );
    const useCreateTaskJs = fs.readFileSync(
      path.resolve(__dirname, "../src/hooks/useCreateTask.js"),
      "utf-8"
    );

    it("ensures CreateTask.jsx does NOT import or call mockApi directly", () => {
      expect(createTaskJsx.includes("mockApi")).toBe(false);
    });

    it("ensures CreateTask.jsx delegates state and orchestration to useCreateTask", () => {
      expect(createTaskJsx.includes("useCreateTask")).toBe(true);
      expect(createTaskJsx.includes("handleSubmit")).toBe(true);
      expect(createTaskJsx.includes("handleBlur")).toBe(true);
      expect(createTaskJsx.includes("handleChange")).toBe(true);
    });

    it("ensures useCreateTask.js does NOT import mockApi directly", () => {
      expect(useCreateTaskJs.includes("mockApi")).toBe(false);
    });

    it("ensures useCreateTask.js consumes taskService and taskHelpers", () => {
      expect(useCreateTaskJs.includes("taskService")).toBe(true);
      expect(useCreateTaskJs.includes("parseChecklistInput")).toBe(true);
      expect(useCreateTaskJs.includes("toggleArrayItem")).toBe(true);
    });
  });
});
