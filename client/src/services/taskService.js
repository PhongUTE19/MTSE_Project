// src/services/taskService.js
import { mockApi } from "./mockApi";
import { apiClient } from "./apiClient";
import { DEFAULT_STATUSES } from "../utils/constants";
import { parseInputToIsoDate } from "../utils/date";

const USE_MOCK =
  import.meta.env?.VITE_USE_MOCK_DATA === "true" ||
  import.meta.env?.MODE === "test";

/**
 * Task Data Access Service
 * Abstraction layer separating UI components and hooks from the underlying data source (HTTP API or mockApi).
 */
export const taskService = {
  /**
   * Fetch a single task by ID
   */
  async getTaskById(taskId) {
    if (USE_MOCK) {
      return mockApi.getTaskById(taskId);
    }
    return apiClient.get(`tasks/${taskId}`);
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

    if (USE_MOCK) {
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
    }

    const [projectRes, membersRes, labelsRes, statusesRes] = await Promise.allSettled([
      apiClient.get(`projects/${projectId}`),
      apiClient.get(`projects/${projectId}/members`),
      this.getLabels(projectId),
      this.getStatuses(projectId),
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
    if (USE_MOCK) {
      return mockApi.getLabels(projectId);
    }
    return apiClient.get(`projects/${projectId}/labels`);
  },

  /**
   * Create a new label for a project
   */
  async createLabel(projectId, labelData) {
    if (USE_MOCK) {
      return mockApi.createLabel(projectId, labelData);
    }
    return apiClient.post(`projects/${projectId}/labels`, labelData);
  },

  /**
   * Update an existing label for a project
   */
  async updateLabel(projectId, labelId, labelData) {
    if (USE_MOCK) {
      return mockApi.updateLabel(projectId, labelId, labelData);
    }
    return apiClient.put(`projects/${projectId}/labels/${labelId}`, labelData);
  },

  /**
   * Delete a label from a project
   */
  async deleteLabel(projectId, labelId) {
    if (USE_MOCK) {
      return mockApi.deleteLabel(projectId, labelId);
    }
    return apiClient.delete(`projects/${projectId}/labels/${labelId}`);
  },

  /**
   * Update an existing task by ID
   */
  async updateTask(taskId, updates) {
    if (USE_MOCK) {
      return mockApi.updateTask(taskId, updates);
    }
    return apiClient.put(`tasks/${taskId}`, updates);
  },

  /**
   * Create a new task
   */
  async createTask(taskData) {
    if (USE_MOCK) {
      return mockApi.createTask(taskData);
    }

    const dueAt =
      taskData.dueAt ||
      (taskData.deadline ? parseInputToIsoDate(taskData.deadline) : null);

    const payload = {
      projectId: taskData.projectId,
      title: taskData.title?.trim() || "",
      description: taskData.description || "",
      status: taskData.status || "todo",
      priority: taskData.priority || "medium",
      dueAt,
      startAt: taskData.startAt || null,
      assigneeIds: Array.isArray(taskData.assigneeIds) ? taskData.assigneeIds : [],
      labels: Array.isArray(taskData.labels) ? taskData.labels : [],
      checklist: Array.isArray(taskData.checklist) ? taskData.checklist : [],
      reminderMinutesBefore: Array.isArray(taskData.reminderMinutesBefore)
        ? taskData.reminderMinutesBefore
        : [],
    };

    return apiClient.post("tasks", payload);
  },

  /**
   * Delete a task by ID
   */
  async deleteTask(taskId) {
    if (USE_MOCK) {
      return mockApi.deleteTask(taskId);
    }
    return apiClient.delete(`tasks/${taskId}`);
  },

  /**
   * Fetch tasks belonging to a project (or all tasks if projectId is null)
   */
  async getTasks(projectId) {
    if (USE_MOCK) {
      return mockApi.getTasks(projectId);
    }
    const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
    return apiClient.get(`tasks${query}`);
  },

  /**
   * Fetch status column definitions for a project
   */
  async getStatuses(projectId) {
    if (!projectId) return DEFAULT_STATUSES;
    if (USE_MOCK) {
      return mockApi.getStatuses(projectId);
    }
    try {
      const res = await apiClient.get(`projects/${projectId}/statuses`);
      return Array.isArray(res) && res.length > 0 ? res : DEFAULT_STATUSES;
    } catch {
      return DEFAULT_STATUSES;
    }
  },

  /**
   * Create a new status column in a project
   */
  async createStatus(projectId, statusData) {
    if (USE_MOCK) {
      return mockApi.createStatus(projectId, statusData);
    }
    return apiClient.post(`projects/${projectId}/statuses`, statusData);
  },

  /**
   * Fetch all board data in parallel (tasks, members, labels, statuses)
   */
  async getBoardData(projectId) {
    if (USE_MOCK) {
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
    }

    const [tasksRes, membersRes, labelsRes, statusesRes] = await Promise.allSettled([
      this.getTasks(projectId),
      apiClient.get(`projects/${projectId}/members`),
      this.getLabels(projectId),
      this.getStatuses(projectId),
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
