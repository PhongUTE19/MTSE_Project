// src/services/taskService.js
import { mockApi } from "./mockApi";
import { DEFAULT_STATUSES } from "../utils/constants";

/**
 * Task Data Access Service
 * Abstraction layer separating UI components and hooks from the underlying data source (mockApi).
 * Allows future migration to real backend endpoints without modifying UI code.
 */
export const taskService = {
  /**
   * Fetch a single task by ID
   */
  async getTaskById(taskId) {
    return mockApi.getTaskById(taskId);
  },

  /**
   * Fetch reference data associated with a project in parallel:
   * project details, members, labels, and status definitions.
   */
  async getProjectReferenceData(projectId) {
    if (!projectId) {
      return {
        project: null,
        members: [],
        labels: [],
        statuses: DEFAULT_STATUSES,
      };
    }

    const [projectRes, membersRes, labelsRes, statusesRes] = await Promise.allSettled([
      mockApi.getProjectById(projectId),
      mockApi.getMembers(projectId),
      mockApi.getLabels(projectId),
      mockApi.getStatuses(projectId),
    ]);

    return {
      project: projectRes.status === "fulfilled" ? projectRes.value : null,
      members: membersRes.status === "fulfilled" && Array.isArray(membersRes.value) ? membersRes.value : [],
      labels: labelsRes.status === "fulfilled" && Array.isArray(labelsRes.value) ? labelsRes.value : [],
      statuses:
        statusesRes.status === "fulfilled" && Array.isArray(statusesRes.value) && statusesRes.value.length > 0
          ? statusesRes.value
          : DEFAULT_STATUSES,
    };
  },

  /**
   * Fetch latest project labels (e.g. after adding/renaming/deleting labels)
   */
  async getLabels(projectId) {
    if (!projectId) return [];
    try {
      return await mockApi.getLabels(projectId);
    } catch (err) {
      console.error(`[taskService] Error fetching labels for project "${projectId}":`, err);
      throw err;
    }
  },

  /**
   * Create a new label for a project
   */
  async createLabel(projectId, labelData) {
    return mockApi.createLabel(projectId, labelData);
  },

  /**
   * Update an existing label for a project
   */
  async updateLabel(projectId, labelId, labelData) {
    return mockApi.updateLabel(projectId, labelId, labelData);
  },

  /**
   * Delete a label from a project
   */
  async deleteLabel(projectId, labelId) {
    return mockApi.deleteLabel(projectId, labelId);
  },

  /**
   * Update an existing task by ID
   */
  async updateTask(taskId, updates) {
    return mockApi.updateTask(taskId, updates);
  },

  /**
   * Create a new task
   */
  async createTask(taskData) {
    return mockApi.createTask(taskData);
  },

  /**
   * Delete a task by ID
   */
  async deleteTask(taskId) {
    return mockApi.deleteTask(taskId);
  },

  /**
   * Fetch tasks belonging to a project (or all tasks if projectId is null)
   */
  async getTasks(projectId) {
    return mockApi.getTasks(projectId);
  },

  /**
   * Create a new status column in a project
   */
  async createStatus(projectId, statusData) {
    return mockApi.createStatus(projectId, statusData);
  },

  /**
   * Fetch all board data in parallel (tasks, members, labels, statuses)
   */
  async getBoardData(projectId) {
    const [tasksRes, membersRes, labelsRes, statusesRes] = await Promise.allSettled([
      mockApi.getTasks(projectId),
      mockApi.getMembers(projectId),
      mockApi.getLabels(projectId),
      mockApi.getStatuses(projectId),
    ]);

    if (tasksRes.status === "rejected") {
      throw tasksRes.reason || new Error("Unable to load tasks.");
    }

    return {
      tasks: Array.isArray(tasksRes.value) ? tasksRes.value : [],
      members: membersRes.status === "fulfilled" && Array.isArray(membersRes.value) ? membersRes.value : [],
      labels: labelsRes.status === "fulfilled" && Array.isArray(labelsRes.value) ? labelsRes.value : [],
      statuses:
        statusesRes.status === "fulfilled" && Array.isArray(statusesRes.value) && statusesRes.value.length > 0
          ? statusesRes.value
          : DEFAULT_STATUSES,
    };
  },
};
