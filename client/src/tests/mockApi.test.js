import { describe, it, expect, beforeEach } from "vitest";
import { mockApi } from "../services/mockApi";

describe("mockApi Service - CRUD & Aggregation Tests", () => {
  beforeEach(async () => {
    await mockApi.resetMockData();
  });

  it("should retrieve all projects and filter tasks by projectId", async () => {
    const projects = await mockApi.getProjects();
    expect(projects.length).toBeGreaterThanOrEqual(1);

    const firstProjectId = projects[0].id;
    const projectTasks = await mockApi.getTasks(firstProjectId);
    expect(Array.isArray(projectTasks)).toBe(true);
    projectTasks.forEach((t) => {
      expect(t.projectId).toBe(firstProjectId);
    });
  });

  it("should create a new project and retrieve it", async () => {
    const newProj = await mockApi.createProject({
      name: "New Mobile App",
      courseName: "Mobile Computing",
      description: "App for student bus tracking",
      deadline: "2026-11-30",
    });

    expect(newProj.id).toBeDefined();
    expect(newProj.name).toBe("New Mobile App");

    const fetched = await mockApi.getProjectById(newProj.id);
    expect(fetched.name).toBe("New Mobile App");
  });

  it("should create a new task with generated ID and timestamps", async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const payload = {
      projectId: "project-1",
      title: "Automated Test Task",
      description: "Testing task creation workflow",
      status: "todo",
      priority: "high",
      dueAt: futureDate,
      assigneeIds: ["student-1"],
      labels: ["Testing", "QA"],
      checklist: [{ id: "check-1", title: "Write tests", completed: false }],
    };

    const created = await mockApi.createTask(payload);
    expect(created.id).toBeDefined();
    expect(created.title).toBe("Automated Test Task");
    expect(created.status).toBe("todo");
    expect(created.createdAt).toBeDefined();

    // Verify it can be retrieved by ID
    const retrieved = await mockApi.getTaskById(created.id);
    expect(retrieved.id).toBe(created.id);
    expect(retrieved.title).toBe("Automated Test Task");
  });

  it("should update task status, checklist, and metadata", async () => {
    const tasks = await mockApi.getTasks();
    const targetTask = tasks[0];

    const updated = await mockApi.updateTask(targetTask.id, {
      status: "done",
      priority: "low",
    });

    expect(updated.status).toBe("done");
    expect(updated.priority).toBe("low");
    expect(updated.completedAt).toBeDefined();

    const fetchedAgain = await mockApi.getTaskById(targetTask.id);
    expect(fetchedAgain.status).toBe("done");
  });

  it("should delete a task and update collections", async () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const tempTask = await mockApi.createTask({
      projectId: "project-1",
      title: "Task to be deleted",
      status: "todo",
      dueAt: futureDate,
    });

    const deleteResult = await mockApi.deleteTask(tempTask.id);
    expect(deleteResult.success).toBe(true);
    expect(deleteResult.deletedId).toBe(tempTask.id);

    // Verifying it is no longer found
    await expect(mockApi.getTaskById(tempTask.id)).rejects.toThrow();
  });

  it("should calculate correct dashboard statistics", async () => {
    const stats = await mockApi.getDashboardStats();
    expect(stats.totalProjects).toBeGreaterThanOrEqual(1);
    expect(stats.totalTasks).toBeGreaterThanOrEqual(1);
    expect(typeof stats.doneTasks).toBe("number");
    expect(typeof stats.overdueTasks).toBe("number");
    expect(stats.doneTasks).toBeLessThanOrEqual(stats.totalTasks);
  });
});
