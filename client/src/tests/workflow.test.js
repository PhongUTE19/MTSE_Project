import { describe, it, expect, beforeEach } from "vitest";
import { mockApi } from "../services/mockApi";

describe("Main Project User Workflow - Integration Test", () => {
  beforeEach(async () => {
    await mockApi.resetMockData();
  });

  it("should complete the full lifecycle: Create -> Board View -> Progress -> Complete -> Delete", async () => {
    // 1. Initial State
    const initialStats = await mockApi.getDashboardStats();
    const initialTaskCount = initialStats.totalTasks;
    const initialDoneCount = initialStats.doneTasks;

    // 2. User creates a task
    const newTask = await mockApi.createTask({
      projectId: "project-1",
      title: "Complete 3B Prototype Submission",
      description: "Ensure all mock endpoints and acceptance tests are verified.",
      status: "todo",
      priority: "high",
      deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
      assigneeIds: ["student-1", "student-2"],
      labels: ["Homework", "Frontend"],
      checklist: [
        { id: "c-1", title: "Implement Mock API", completed: false },
        { id: "c-2", title: "Add Automated Tests", completed: false },
      ],
    });

    expect(newTask.id).toBeDefined();

    // 3. User views task on board for project-1
    const boardTasks = await mockApi.getTasks("project-1");
    const boardTask = boardTasks.find((t) => t.id === newTask.id);
    expect(boardTask).toBeDefined();
    expect(boardTask.status).toBe("todo");

    // Check dashboard updated
    const statsAfterCreate = await mockApi.getDashboardStats();
    expect(statsAfterCreate.totalTasks).toBe(initialTaskCount + 1);

    // 4. User moves task to in_progress and completes checklist items
    const inProgressTask = await mockApi.updateTask(newTask.id, {
      status: "in_progress",
      checklist: [
        { id: "c-1", title: "Implement Mock API", completed: true },
        { id: "c-2", title: "Add Automated Tests", completed: true },
      ],
    });
    expect(inProgressTask.status).toBe("in_progress");
    expect(inProgressTask.checklist.every((c) => c.completed)).toBe(true);

    // 5. User marks task as Done
    const doneTask = await mockApi.updateTask(newTask.id, { status: "done" });
    expect(doneTask.status).toBe("done");

    const statsAfterDone = await mockApi.getDashboardStats();
    expect(statsAfterDone.doneTasks).toBe(initialDoneCount + 1);

    // 6. User deletes the task
    const deleteRes = await mockApi.deleteTask(newTask.id);
    expect(deleteRes.success).toBe(true);

    // 7. Verify task no longer exists on board or stats
    const finalBoardTasks = await mockApi.getTasks("project-1");
    expect(finalBoardTasks.find((t) => t.id === newTask.id)).toBeUndefined();

    const finalStats = await mockApi.getDashboardStats();
    expect(finalStats.totalTasks).toBe(initialTaskCount);
    expect(finalStats.doneTasks).toBe(initialDoneCount);
  });
});
