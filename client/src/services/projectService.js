// src/services/projectService.js
import { mockApi } from "./mockApi";
import { apiClient } from "./apiClient";
import { DEFAULT_COURSE_NAME } from "../utils/constants";
import { parseInputToIsoDate } from "../utils/date";

const USE_MOCK =
  import.meta.env?.VITE_USE_MOCK_DATA === "true" ||
  import.meta.env?.MODE === "test";

/**
 * Project Data Access Service
 * Abstraction layer separating UI components and hooks from data sources (HTTP API or mockApi).
 */
export const projectService = {
  /**
   * Create a new project
   * @param {{ name: string, courseName?: string, description?: string, deadline?: string }} projectData
   */
  async createProject(projectData) {
    const formattedDeadline = projectData.deadline
      ? parseInputToIsoDate(projectData.deadline)
      : null;

    const payload = {
      name: projectData.name?.trim() || "",
      courseName: projectData.courseName?.trim() || DEFAULT_COURSE_NAME,
      description: projectData.description || "",
      deadline: formattedDeadline,
    };

    if (USE_MOCK) {
      return mockApi.createProject(payload);
    }

    return apiClient.post("projects", payload);
  },

  /**
   * Fetch all active projects
   */
  async getProjects() {
    if (USE_MOCK) {
      return mockApi.getProjects();
    }
    return apiClient.get("projects");
  },

  /**
   * Fetch single project by ID
   * @param {string} projectId
   */
  async getProjectById(projectId) {
    if (USE_MOCK) {
      return mockApi.getProjectById(projectId);
    }
    return apiClient.get(`projects/${projectId}`);
  },

  /**
   * Delete a project by ID
   * @param {string} projectId
   */
  async deleteProject(projectId) {
    if (USE_MOCK) {
      return mockApi.deleteProject(projectId);
    }
    return apiClient.delete(`projects/${projectId}`);
  },

  /**
   * Fetch aggregate statistics for dashboard
   */
  async getDashboardStats() {
    if (USE_MOCK) {
      return mockApi.getDashboardStats();
    }
    return apiClient.get("dashboard/stats");
  },

  /**
   * Fetch all data needed by Dashboard in parallel
   */
  async getDashboardData() {
    const [projects, stats] = await Promise.all([
      this.getProjects(),
      this.getDashboardStats(),
    ]);
    return { projects, stats };
  },

  /**
   * Fetch members belonging to a project
   * @param {string} projectId
   */
  async getMembers(projectId) {
    if (!projectId) return [];
    if (USE_MOCK) {
      return mockApi.getMembers(projectId);
    }
    return apiClient.get(`projects/${projectId}/members`);
  },

  /**
   * Add a new member to a project
   * @param {string} projectId
   * @param {{ name: string, mssv: string, email: string }} memberData
   */
  async createMember(projectId, memberData) {
    if (USE_MOCK) {
      return mockApi.createMember(projectId, memberData);
    }
    return apiClient.post(`projects/${projectId}/members`, memberData);
  },

  /**
   * Update an existing project member
   * @param {string} projectId
   * @param {string} memberId
   * @param {{ name: string, mssv: string, email: string }} memberData
   */
  async updateMember(projectId, memberId, memberData) {
    if (USE_MOCK) {
      return mockApi.updateMember(projectId, memberId, memberData);
    }
    return apiClient.put(`projects/${projectId}/members/${memberId}`, memberData);
  },

  /**
   * Delete a member from a project
   * @param {string} projectId
   * @param {string} memberId
   */
  async deleteMember(projectId, memberId) {
    if (USE_MOCK) {
      return mockApi.deleteMember(projectId, memberId);
    }
    return apiClient.delete(`projects/${projectId}/members/${memberId}`);
  },
};
