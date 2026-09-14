// src/services/mockApi.js
import { projects as initialProjects, tasks as initialTasks, students as initialStudents } from "../data/mockData";
import { INITIAL_LABELS, normalizeLabelName, labelsAreEqual, findLabelByName, getLabelColor } from "../utils/constants";

const STORAGE_KEYS = {
  PROJECTS: "mana_projects",
  TASKS: "mana_tasks",
  STUDENTS: "mana_students",
  MEMBERS: "mana_members",
  LABELS: "mana_labels",
};

// Check if localStorage is supported in current environment
const isLocalStorageAvailable = () => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return false;
    const testKey = "__mana_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

const initialLabelsData = INITIAL_LABELS.map((name, index) => ({
  id: `label-init-${index}`,
  name,
  color: getLabelColor(name)
}));

// In-memory fallbacks when localStorage is not available (e.g. testing environments)
let inMemoryStorage = {
  projects: JSON.parse(JSON.stringify(initialProjects)),
  tasks: JSON.parse(JSON.stringify(initialTasks)),
  students: JSON.parse(JSON.stringify(initialStudents)),
  members: JSON.parse(JSON.stringify(initialStudents)),
  labels: JSON.parse(JSON.stringify(initialLabelsData)),
};

function readCollection(key, defaultData) {
  if (isLocalStorageAvailable()) {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      window.localStorage.setItem(key, JSON.stringify(defaultData));
      return JSON.parse(JSON.stringify(defaultData));
    }
    try {
      return JSON.parse(raw);
    } catch {
      return JSON.parse(JSON.stringify(defaultData));
    }
  }
  const memoryKey = key.replace("mana_", "");
  return JSON.parse(JSON.stringify(inMemoryStorage[memoryKey] || defaultData));
}

function writeCollection(key, data) {
  if (isLocalStorageAvailable()) {
    window.localStorage.setItem(key, JSON.stringify(data));
  }
  const memoryKey = key.replace("mana_", "");
  inMemoryStorage[memoryKey] = JSON.parse(JSON.stringify(data));
}

// Simulated network latency (0ms in tests, ~150ms in browser for realistic feel)
const delay = (ms = 150) => {
  if (typeof import.meta !== "undefined" && import.meta.env?.MODE === "test") {
    return Promise.resolve();
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const mockApi = {
  /**
   * Reset mock data to original fixtures
   */
  async resetMockData() {
    await delay(50);
    writeCollection(STORAGE_KEYS.PROJECTS, initialProjects);
    writeCollection(STORAGE_KEYS.TASKS, initialTasks);
    writeCollection(STORAGE_KEYS.STUDENTS, initialStudents);
    writeCollection(STORAGE_KEYS.MEMBERS, initialStudents);
    writeCollection(STORAGE_KEYS.LABELS, initialLabelsData);
    return { success: true };
  },

  /**
   * Fetch all active projects
   */
  async getProjects() {
    await delay();
    return readCollection(STORAGE_KEYS.PROJECTS, initialProjects);
  },

  /**
   * Fetch single project by ID
   */
  async getProjectById(projectId) {
    await delay();
    const list = readCollection(STORAGE_KEYS.PROJECTS, initialProjects);
    const found = list.find((p) => p.id === projectId);
    if (!found) {
      throw new Error(`Project with ID "${projectId}" not found.`);
    }
    return found;
  },

  /**
   * Create a new project
   */
  async createProject(projectData) {
    await delay();
    const allProjects = readCollection(STORAGE_KEYS.PROJECTS, initialProjects);
    const nowIso = new Date().toISOString();
    const newProject = {
      id: `project-${Date.now()}`,
      name: projectData.name?.trim() || "Untitled Project",
      courseName: projectData.courseName?.trim() || "General",
      description: projectData.description || "",
      deadline: projectData.deadline ? new Date(projectData.deadline).toISOString() : null,
      memberIds: Array.isArray(projectData.memberIds) ? projectData.memberIds : ["student-1"],
      createdBy: projectData.createdBy || "student-1",
      status: projectData.status || "active",
      createdAt: nowIso,
    };
    allProjects.unshift(newProject);
    writeCollection(STORAGE_KEYS.PROJECTS, allProjects);
    return newProject;
  },

  /**
   * Delete a project and all associated tasks
   */
  async deleteProject(projectId) {
    await delay();
    const allProjects = readCollection(STORAGE_KEYS.PROJECTS, initialProjects);
    const projIndex = allProjects.findIndex((p) => p.id === projectId);
    if (projIndex === -1) {
      throw new Error(`Project with ID "${projectId}" not found.`);
    }

    const deletedProject = allProjects.splice(projIndex, 1)[0];
    writeCollection(STORAGE_KEYS.PROJECTS, allProjects);

    // Delete all tasks belonging to this project (cascading delete)
    const allTasks = readCollection(STORAGE_KEYS.TASKS, initialTasks);
    const remainingTasks = allTasks.filter((t) => t.projectId !== projectId);
    writeCollection(STORAGE_KEYS.TASKS, remainingTasks);

    return {
      success: true,
      deletedId: projectId,
      project: deletedProject,
      deletedTasksCount: allTasks.length - remainingTasks.length,
    };
  },

  /**
   * Fetch tasks, optionally filtered by projectId
   */
  async getTasks(projectId = null) {
    await delay();
    const allTasks = readCollection(STORAGE_KEYS.TASKS, initialTasks);
    if (projectId) {
      return allTasks.filter((t) => t.projectId === projectId);
    }
    return allTasks;
  },

  /**
   * Fetch task by taskId
   */
  async getTaskById(taskId) {
    await delay();
    const allTasks = readCollection(STORAGE_KEYS.TASKS, initialTasks);
    const found = allTasks.find((t) => t.id === taskId);
    if (!found) {
      throw new Error(`Task with ID "${taskId}" not found.`);
    }
    return found;
  },

  /**
   * Create a new task
   */
  async createTask(taskData) {
    await delay();
    const allTasks = readCollection(STORAGE_KEYS.TASKS, initialTasks);

    const nowIso = new Date().toISOString();
    const newTask = {
      id: `task-${Date.now()}`,
      projectId: taskData.projectId || "project-1",
      title: taskData.title?.trim() || "Untitled Task",
      description: taskData.description || "",
      status: taskData.status || "todo", // todo | in_progress | done
      priority: taskData.priority || "medium", // low | medium | high
      startAt: taskData.startAt || null,
      dueAt: taskData.dueAt || (taskData.deadline ? new Date(taskData.deadline).toISOString() : null),
      assigneeIds: Array.isArray(taskData.assigneeIds) ? taskData.assigneeIds : [],
      labels: Array.isArray(taskData.labels) ? taskData.labels : [],
      checklist: Array.isArray(taskData.checklist) ? taskData.checklist : [],
      reminderMinutesBefore: Array.isArray(taskData.reminderMinutesBefore) ? taskData.reminderMinutesBefore : [],
      createdBy: taskData.createdBy || "student-1",
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    allTasks.unshift(newTask);
    writeCollection(STORAGE_KEYS.TASKS, allTasks);
    return newTask;
  },

  /**
   * Update an existing task
   */
  async updateTask(taskId, updates) {
    await delay();
    const allTasks = readCollection(STORAGE_KEYS.TASKS, initialTasks);
    const index = allTasks.findIndex((t) => t.id === taskId);
    if (index === -1) {
      throw new Error(`Task with ID "${taskId}" not found.`);
    }

    const current = allTasks[index];
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // If status changed to done, mark completedAt
    if (updates.status === "done" && current.status !== "done") {
      updated.completedAt = new Date().toISOString();
    } else if (updates.status && updates.status !== "done") {
      delete updated.completedAt;
    }

    allTasks[index] = updated;
    writeCollection(STORAGE_KEYS.TASKS, allTasks);
    return updated;
  },

  /**
   * Delete a task by ID
   */
  async deleteTask(taskId) {
    await delay();
    const allTasks = readCollection(STORAGE_KEYS.TASKS, initialTasks);
    const index = allTasks.findIndex((t) => t.id === taskId);
    if (index === -1) {
      throw new Error(`Task with ID "${taskId}" not found.`);
    }

    const deleted = allTasks.splice(index, 1)[0];
    writeCollection(STORAGE_KEYS.TASKS, allTasks);
    return { success: true, deletedId: taskId, task: deleted };
  },

  /**
   * Fetch students/team members
   */
  async getStudents() {
    await delay();
    return readCollection(STORAGE_KEYS.STUDENTS, initialStudents);
  },

  /**
   * Get aggregated dashboard statistics
   */
  async getDashboardStats() {
    await delay();
    const projectsList = readCollection(STORAGE_KEYS.PROJECTS, initialProjects);
    const taskList = readCollection(STORAGE_KEYS.TASKS, initialTasks);

    const now = new Date();
    const totalProjects = projectsList.length;
    const totalTasks = taskList.length;
    const doneTasks = taskList.filter((t) => t.status === "done").length;
    const inProgressTasks = taskList.filter((t) => t.status === "in_progress").length;
    const overdueTasks = taskList.filter(
      (t) => t.status !== "done" && t.dueAt && new Date(t.dueAt) < now
    ).length;

    return {
      totalProjects,
      totalTasks,
      doneTasks,
      inProgressTasks,
      overdueTasks,
    };
  },

  // === MEMBERS ===
  async getMembers() {
    await delay();
    return readCollection(STORAGE_KEYS.MEMBERS, initialStudents);
  },

  async createMember(memberData) {
    await delay();
    const allMembers = readCollection(STORAGE_KEYS.MEMBERS, initialStudents);
    
    if (!memberData.name || memberData.name.trim().length < 2) {
      throw new Error("Name is required and must be at least 2 characters.");
    }
    if (!memberData.mssv || memberData.mssv.trim().length === 0) {
      throw new Error("MSSV is required.");
    }
    if (!memberData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberData.email)) {
      throw new Error("A valid email is required.");
    }
    if (allMembers.some(m => m.mssv === memberData.mssv)) {
      throw new Error(`Member with MSSV '${memberData.mssv}' already exists.`);
    }

    const newMember = {
      id: `student-${Date.now()}`,
      name: memberData.name.trim(),
      mssv: memberData.mssv.trim(),
      email: memberData.email.trim()
    };
    
    allMembers.push(newMember);
    writeCollection(STORAGE_KEYS.MEMBERS, allMembers);
    return newMember;
  },

  async updateMember(memberId, updates) {
    await delay();
    const allMembers = readCollection(STORAGE_KEYS.MEMBERS, initialStudents);
    const index = allMembers.findIndex((m) => m.id === memberId);
    if (index === -1) {
      throw new Error(`Member with ID "${memberId}" not found.`);
    }

    if (updates.name !== undefined && updates.name.trim().length < 2) {
      throw new Error("Name is required and must be at least 2 characters.");
    }
    if (updates.mssv !== undefined && updates.mssv.trim().length === 0) {
      throw new Error("MSSV is required.");
    }
    if (updates.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      throw new Error("A valid email is required.");
    }

    if (updates.mssv !== undefined && updates.mssv !== allMembers[index].mssv) {
      if (allMembers.some(m => m.mssv === updates.mssv && m.id !== memberId)) {
        throw new Error(`Member with MSSV '${updates.mssv}' already exists.`);
      }
    }

    const updated = {
      ...allMembers[index],
      ...updates
    };

    allMembers[index] = updated;
    writeCollection(STORAGE_KEYS.MEMBERS, allMembers);
    return updated;
  },

  // === LABELS ===
  async getLabels() {
    await delay();
    return readCollection(STORAGE_KEYS.LABELS, initialLabelsData);
  },

  async getLabelByName(labelName) {
    await delay();
    const allLabels = readCollection(STORAGE_KEYS.LABELS, initialLabelsData);
    return findLabelByName(allLabels, labelName);
  },

  async normalizeLabelName(labelName) {
    // Helper function as required
    return normalizeLabelName(labelName);
  },

  async createLabel(labelData) {
    await delay();
    const allLabels = readCollection(STORAGE_KEYS.LABELS, initialLabelsData);
    
    if (!labelData.name || labelData.name.trim().length < 2) {
      throw new Error("Label name must be at least 2 characters.");
    }
    
    const normalizedName = normalizeLabelName(labelData.name);
    const existingLabel = findLabelByName(allLabels, normalizedName);
    
    if (existingLabel) {
      throw new Error(`Label '${normalizedName}' already exists as '${existingLabel.name}'.`);
    }

    const newLabel = {
      id: `label-${Date.now()}`,
      name: normalizedName,
      color: labelData.color || getLabelColor(normalizedName)
    };
    
    allLabels.push(newLabel);
    writeCollection(STORAGE_KEYS.LABELS, allLabels);
    return newLabel;
  },

  async updateLabel(labelId, updates) {
    await delay();
    const allLabels = readCollection(STORAGE_KEYS.LABELS, initialLabelsData);
    const index = allLabels.findIndex((l) => l.id === labelId);
    if (index === -1) {
      throw new Error(`Label with ID "${labelId}" not found.`);
    }

    if (updates.name !== undefined) {
      if (updates.name.trim().length < 2) {
        throw new Error("Label name must be at least 2 characters.");
      }
      const normalizedName = normalizeLabelName(updates.name);
      const existingLabel = findLabelByName(allLabels, normalizedName);
      if (existingLabel && existingLabel.id !== labelId) {
        throw new Error(`Label '${normalizedName}' already exists as '${existingLabel.name}'.`);
      }
      updates.name = normalizedName;
    }

    const updated = {
      ...allLabels[index],
      ...updates
    };

    allLabels[index] = updated;
    writeCollection(STORAGE_KEYS.LABELS, allLabels);
    return updated;
  },

  async deleteLabel(labelId) {
    await delay();
    const allLabels = readCollection(STORAGE_KEYS.LABELS, initialLabelsData);
    const index = allLabels.findIndex((l) => l.id === labelId);
    if (index === -1) {
      throw new Error(`Label with ID "${labelId}" not found.`);
    }

    const labelToDelete = allLabels[index];
    allLabels.splice(index, 1);
    writeCollection(STORAGE_KEYS.LABELS, allLabels);

    // CASCADE: Delete label name from labels array of ALL tasks
    const allTasks = readCollection(STORAGE_KEYS.TASKS, initialTasks);
    let tasksUpdated = false;
    allTasks.forEach(task => {
      if (task.labels) {
        const initialLen = task.labels.length;
        task.labels = task.labels.filter(labelName => !labelsAreEqual(labelName, labelToDelete.name));
        if (task.labels.length !== initialLen) {
          tasksUpdated = true;
        }
      }
    });

    if (tasksUpdated) {
      writeCollection(STORAGE_KEYS.TASKS, allTasks);
    }

    return { success: true, deletedId: labelId };
  }
};

export default mockApi;
