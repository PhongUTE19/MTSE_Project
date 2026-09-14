// src/services/projectService.js
import { mockApi } from "./mockApi";
import { DEFAULT_COURSE_NAME } from "../utils/constants";
import { parseInputToIsoDate } from "../utils/date";

/**
 * Project Data Access Service
 * Abstraction layer separating UI components and hooks from mockApi.
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

    return mockApi.createProject({
      name: projectData.name?.trim() || "",
      courseName: projectData.courseName?.trim() || DEFAULT_COURSE_NAME,
      description: projectData.description || "",
      deadline: formattedDeadline,
    });
  },

  /**
   * Fetch all active projects
   */
  async getProjects() {
    return mockApi.getProjects();
  },

  /**
   * Fetch single project by ID
   * @param {string} projectId
   */
  async getProjectById(projectId) {
    return mockApi.getProjectById(projectId);
  },

  /**
   * Delete a project by ID
   * @param {string} projectId
   */
  async deleteProject(projectId) {
    return mockApi.deleteProject(projectId);
  },

  /**
   * Fetch aggregate statistics for dashboard
   */
  async getDashboardStats() {
    return mockApi.getDashboardStats();
  },

  /**
   * Fetch all data needed by Dashboard in parallel
   */
  async getDashboardData() {
    const [projects, stats] = await Promise.all([
      mockApi.getProjects(),
      mockApi.getDashboardStats(),
    ]);
    return { projects, stats };
  },

  /**
   * Fetch members belonging to a project
   * @param {string} projectId
   */
  async getMembers(projectId) {
    if (!projectId) return [];
    return mockApi.getMembers(projectId);
  },

  /**
   * Add a new member to a project
   * @param {string} projectId
   * @param {{ name: string, mssv: string, email: string }} memberData
   */
  async createMember(projectId, memberData) {
    return mockApi.createMember(projectId, memberData);
  },

  /**
   * Update an existing project member
   * @param {string} projectId
   * @param {string} memberId
   * @param {{ name: string, mssv: string, email: string }} memberData
   */
  async updateMember(projectId, memberId, memberData) {
    return mockApi.updateMember(projectId, memberId, memberData);
  },

  /**
   * Delete a member from a project
   * @param {string} projectId
   * @param {string} memberId
   */
  async deleteMember(projectId, memberId) {
    return mockApi.deleteMember(projectId, memberId);
  },
};
