// src/services/mockApi.js
import { projects as initialProjects, tasks as initialTasks } from "../data/mockData";
import { normalizeLabelName, labelsAreEqual, getLabelColor } from "../utils/constants";

const STORAGE_KEYS = {
  PROJECTS: "mana_projects_v2",
  TASKS: "mana_tasks_v2",
  MEMBERS: "mana_members_v2",
  LABELS: "mana_labels_v2",
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

const initialMembers = [
  { id: "member-1-1", projectId: "project-1", name: "Bùi Duy Phong", mssv: "19110131", email: "BuiDuyPhong@gmail.com" },
  { id: "member-1-2", projectId: "project-1", name: "Trần Thị Tố Như", mssv: "23110051", email: "NhuTran@gmail.com" },
  { id: "member-1-3", projectId: "project-1", name: "Văn Phạm Thảo Nhi", mssv: "23110049", email: "NhiVan@gmail.com" },
  { id: "member-2-1", projectId: "project-2", name: "Bùi Duy Phong", mssv: "19110131", email: "BuiDuyPhong@gmail.com" },
  { id: "member-2-2", projectId: "project-2", name: "Trần Thị Tố Như", mssv: "23110051", email: "NhuTran@gmail.com" },
];

const initialLabelsData = [
  ["Planning", "#4bce97"], ["Feature", "#9f8fef"], ["Data", "#579dff"], ["Analysis", "#e2b203"],
  ["UI", "#4bce97"], ["Wireframe", "#f87168"], ["Frontend", "#e2b203"], ["Setup", "#579dff"],
  ["Task", "#4bce97"], ["Calendar", "#e2b203"], ["Integration", "#9f8fef"], ["Testing", "#4bce97"],
  ["Presentation", "#f87168"], ["Demo", "#4bce97"],
].map(([name, color], index) => ({ id: `label-1-${index + 1}`, projectId: "project-1", name, color }))
  .concat([
    ["Planning", "#4bce97"], ["Event", "#579dff"], ["Research", "#9f8fef"],
    ["Logistics", "#e2b203"], ["Marketing", "#f87168"], ["Content", "#9f8fef"],
  ].map(([name, color], index) => ({ id: `label-2-${index + 1}`, projectId: "project-2", name, color })));

const initialTasksV2 = initialTasks.map((task) => {
  const memberPrefix = task.projectId === "project-2" ? "member-2-" : "member-1-";
  return {
    ...task,
    assigneeIds: (task.assigneeIds || []).map((id) => {
      const memberIndex = { "student-1": "1", "student-2": "2", "student-3": "3" }[id];
      return memberIndex ? `${memberPrefix}${memberIndex}` : id;
    }),
  };
});

// In-memory fallbacks when localStorage is not available (e.g. testing environments)
let inMemoryStorage = {
  projects: JSON.parse(JSON.stringify(initialProjects)),
  tasks: JSON.parse(JSON.stringify(initialTasksV2)),
  members: JSON.parse(JSON.stringify(initialMembers)),
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
  const memoryKey = key.replace("mana_", "").replace("_v2", "");
  return JSON.parse(JSON.stringify(inMemoryStorage[memoryKey] || defaultData));
}

function writeCollection(key, data) {
  if (isLocalStorageAvailable()) {
    window.localStorage.setItem(key, JSON.stringify(data));
  }
  const memoryKey = key.replace("mana_", "").replace("_v2", "");
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
    writeCollection(STORAGE_KEYS.TASKS, initialTasksV2);
    writeCollection(STORAGE_KEYS.MEMBERS, initialMembers);
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
    const allTasks = readCollection(STORAGE_KEYS.TASKS, initialTasksV2);
    const remainingTasks = allTasks.filter((t) => t.projectId !== projectId);
    writeCollection(STORAGE_KEYS.TASKS, remainingTasks);

    writeCollection(
      STORAGE_KEYS.MEMBERS,
      readCollection(STORAGE_KEYS.MEMBERS, initialMembers).filter((member) => member.projectId !== projectId)
    );
    writeCollection(
      STORAGE_KEYS.LABELS,
      readCollection(STORAGE_KEYS.LABELS, initialLabelsData).filter((label) => label.projectId !== projectId)
    );

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
    const allTasks = readCollection(STORAGE_KEYS.TASKS, initialTasksV2);
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
    const allTasks = readCollection(STORAGE_KEYS.TASKS, initialTasksV2);
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
    const allTasks = readCollection(STORAGE_KEYS.TASKS, initialTasksV2);

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
    const allTasks = readCollection(STORAGE_KEYS.TASKS, initialTasksV2);
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
    const allTasks = readCollection(STORAGE_KEYS.TASKS, initialTasksV2);
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
  async getStudents(projectId) {
    await delay();
    return this.getMembers(projectId);
  },

  /**
   * Get aggregated dashboard statistics
   */
  async getDashboardStats() {
    await delay();
    const projectsList = readCollection(STORAGE_KEYS.PROJECTS, initialProjects);
    const taskList = readCollection(STORAGE_KEYS.TASKS, initialTasksV2);

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
  async getMembers(projectId) {
    await delay();
    const allMembers = readCollection(STORAGE_KEYS.MEMBERS, initialMembers);
    return projectId ? allMembers.filter((member) => member.projectId === projectId) : allMembers;
  },

  async createMember(projectId, memberData) {
    await delay();
    if (typeof projectId === "object") {
      memberData = projectId;
      projectId = "project-1";
    }
    const allMembers = readCollection(STORAGE_KEYS.MEMBERS, initialMembers);
    
    if (!memberData.name || memberData.name.trim().length < 2) {
      throw new Error("Name is required and must be at least 2 characters.");
    }
    if (!memberData.mssv || memberData.mssv.trim().length < 5) {
      throw new Error("MSSV is required and must be at least 5 characters.");
    }
    if (!memberData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberData.email)) {
      throw new Error("A valid email is required.");
    }
    if (allMembers.some((member) => member.projectId === projectId && member.mssv === memberData.mssv.trim())) {
      throw new Error(`Member with MSSV '${memberData.mssv}' already exists in this project.`);
    }

    const newMember = {
      id: `member-${Date.now()}`,
      projectId,
      name: memberData.name.trim(),
      mssv: memberData.mssv.trim(),
      email: memberData.email.trim()
    };
    
    allMembers.push(newMember);
    writeCollection(STORAGE_KEYS.MEMBERS, allMembers);
    return newMember;
  },

  async updateMember(projectId, memberId, updates) {
    await delay();
    if (typeof memberId === "object") {
      updates = memberId;
      memberId = projectId;
      projectId = "project-1";
    }
    const allMembers = readCollection(STORAGE_KEYS.MEMBERS, initialMembers);
    const index = allMembers.findIndex((member) => member.id === memberId && member.projectId === projectId);
    if (index === -1) {
      throw new Error("Member not found in this project.");
    }

    if (updates.name !== undefined && updates.name.trim().length < 2) {
      throw new Error("Name is required and must be at least 2 characters.");
    }
    if (updates.mssv !== undefined && updates.mssv.trim().length < 5) {
      throw new Error("MSSV is required and must be at least 5 characters.");
    }
    if (updates.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      throw new Error("A valid email is required.");
    }

    if (updates.mssv !== undefined && updates.mssv !== allMembers[index].mssv) {
      if (allMembers.some((member) => member.projectId === projectId && member.mssv === updates.mssv.trim() && member.id !== memberId)) {
        throw new Error(`Member with MSSV '${updates.mssv}' already exists in this project.`);
      }
    }

    const updated = {
      ...allMembers[index],
      ...updates,
      name: updates.name?.trim() ?? allMembers[index].name,
      mssv: updates.mssv?.trim() ?? allMembers[index].mssv,
      email: updates.email?.trim() ?? allMembers[index].email,
    };

    allMembers[index] = updated;
    writeCollection(STORAGE_KEYS.MEMBERS, allMembers);
    return updated;
  },

  // === LABELS ===
  async getLabels(projectId) {
    await delay();
    const allLabels = readCollection(STORAGE_KEYS.LABELS, initialLabelsData);
    return projectId ? allLabels.filter((label) => label.projectId === projectId) : allLabels;
  },

  async getLabelByName(projectId, labelName) {
    await delay();
    if (labelName === undefined) {
      labelName = projectId;
      projectId = null;
    }
    const allLabels = readCollection(STORAGE_KEYS.LABELS, initialLabelsData);
    return allLabels.find((label) => (!projectId || label.projectId === projectId) && labelsAreEqual(label.name, labelName)) || null;
  },

  async normalizeLabelName(labelName) {
    // Helper function as required
    return normalizeLabelName(labelName);
  },

  async createLabel(projectId, labelData) {
    await delay();
    if (typeof projectId === "object") {
      labelData = projectId;
      projectId = "project-1";
    }
    const allLabels = readCollection(STORAGE_KEYS.LABELS, initialLabelsData);
    
    if (!labelData.name || labelData.name.trim().length < 2) {
      throw new Error("Label name must be at least 2 characters.");
    }
    
    const normalizedName = normalizeLabelName(labelData.name);
    const existingLabel = allLabels.find((label) => label.projectId === projectId && labelsAreEqual(label.name, normalizedName));
    
    if (existingLabel) {
      throw new Error(`Label '${normalizedName}' already exists in this project as '${existingLabel.name}'.`);
    }

    const newLabel = {
      id: `label-${Date.now()}`,
      projectId,
      name: normalizedName,
      color: labelData.color || getLabelColor(normalizedName)
    };
    
    allLabels.push(newLabel);
    writeCollection(STORAGE_KEYS.LABELS, allLabels);
    return newLabel;
  },

  async updateLabel(projectId, labelId, updates) {
    await delay();
    if (typeof labelId === "object") {
      updates = labelId;
      labelId = projectId;
      projectId = "project-1";
    }
    const allLabels = readCollection(STORAGE_KEYS.LABELS, initialLabelsData);
    const index = allLabels.findIndex((label) => label.id === labelId && label.projectId === projectId);
    if (index === -1) {
      throw new Error("Label not found in this project.");
    }

    const oldLabel = allLabels[index];

    if (updates.name !== undefined) {
      if (updates.name.trim().length < 2) {
        throw new Error("Label name must be at least 2 characters.");
      }
      const normalizedName = normalizeLabelName(updates.name);
      const existingLabel = allLabels.find((label) => label.projectId === projectId && labelsAreEqual(label.name, normalizedName));
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
    const duplicateIds = allLabels
      .filter((label) => label.projectId === projectId && label.id !== labelId && labelsAreEqual(label.name, oldLabel.name))
      .map((label) => label.id);
    const cleanedLabels = allLabels.filter((label) => !duplicateIds.includes(label.id));
    writeCollection(STORAGE_KEYS.LABELS, cleanedLabels);

    if (updates.name !== undefined && updates.name !== oldLabel.name) {
      const allTasks = readCollection(STORAGE_KEYS.TASKS, initialTasksV2);
      const changedTasks = allTasks.map((task) => {
        if (task.projectId !== projectId || !task.labels?.includes(oldLabel.name)) return task;
        return { ...task, labels: task.labels.map((name) => name === oldLabel.name ? updates.name : name) };
      });
      writeCollection(STORAGE_KEYS.TASKS, changedTasks);
    }
    return updated;
  },

  async deleteLabel(projectId, labelId) {
    await delay();
    if (labelId === undefined) {
      labelId = projectId;
      projectId = "project-1";
    }
    const allLabels = readCollection(STORAGE_KEYS.LABELS, initialLabelsData);
    const index = allLabels.findIndex((label) => label.id === labelId && label.projectId === projectId);
    if (index === -1) {
      throw new Error("Label not found in this project.");
    }

    const labelToDelete = allLabels[index];
    allLabels.splice(index, 1);
    writeCollection(STORAGE_KEYS.LABELS, allLabels);

    // CASCADE: Delete label name from labels array of ALL tasks
    const allTasks = readCollection(STORAGE_KEYS.TASKS, initialTasksV2);
    let tasksUpdated = false;
    allTasks.forEach(task => {
      if (task.projectId === projectId && task.labels) {
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
