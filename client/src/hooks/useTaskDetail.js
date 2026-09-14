// src/hooks/useTaskDetail.js
import { useState, useEffect, useCallback, useRef } from "react";
import { taskService } from "../services/taskService";
import { DEFAULT_STATUSES } from "../utils/constants";
import { parseInputToIsoDate } from "../utils/date";
import {
  toggleArrayItem,
  toggleChecklistItem,
  addChecklistItem,
  updateChecklistItem,
  removeChecklistItem,
} from "../utils/taskHelpers";

export default function useTaskDetail(taskId, locationState = {}) {
  const [prevTaskId, setPrevTaskId] = useState(taskId);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [error, setError] = useState(null);

  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [statuses, setStatuses] = useState(DEFAULT_STATUSES);
  const [toast, setToast] = useState(null);
  const lastSavedTitleRef = useRef("");

  // Synchronously reset lifecycle states when taskId changes during navigation
  if (taskId !== prevTaskId) {
    setPrevTaskId(taskId);
    setIsLoading(true);
    setIsNotFound(false);
    setError(null);
    setTask(null);
  }

  // Loaded entities serve as the primary source of truth, location state as fallback
  const projectId = task?.projectId ?? locationState?.projectId;
  const projectName = project?.name ?? locationState?.projectName ?? "Team Workboard";

  useEffect(() => {
    let isCurrent = true;
    const currentTaskId = taskId;
    lastSavedTitleRef.current = "";

    taskService
      .getTaskById(currentTaskId)
      .then(async (taskData) => {
        if (!isCurrent || currentTaskId !== taskId) return;

        if (!taskData) {
          setIsNotFound(true);
          setIsLoading(false);
          return;
        }

        setTask(taskData);
        lastSavedTitleRef.current = taskData.title;

        const refData = await taskService.getProjectReferenceData(taskData.projectId);
        if (!isCurrent || currentTaskId !== taskId) return;

        setProject(refData.project);
        setMembers(refData.members);
        setLabels(refData.labels);
        setStatuses(refData.statuses);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isCurrent || currentTaskId !== taskId) return;
        setIsLoading(false);
        const message = err?.message || "";
        if (message.toLowerCase().includes("not found")) {
          setIsNotFound(true);
        } else {
          setError(message || "An unexpected error occurred while loading the task.");
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [taskId]);

  const updateTaskData = useCallback(
    async (updates) => {
      if (!task) return null;
      try {
        const updated = await taskService.updateTask(task.id, updates);
        setTask(updated);
        if (updated?.title) {
          lastSavedTitleRef.current = updated.title;
        }
        return updated;
      } catch (err) {
        setToast({
          message: "Failed to update task: " + err.message,
          type: "error",
        });
        throw err;
      }
    },
    [task]
  );

  const handleTitleSave = useCallback(
    (newTitle) => {
      if (!task) return;
      const trimmed = newTitle?.trim();
      if (!trimmed || trimmed.length < 3) {
        if (trimmed && trimmed.length < 3) {
          setToast({
            message: "Task title must be at least 3 characters.",
            type: "error",
          });
        }
        setTask((prev) => (prev ? { ...prev, title: lastSavedTitleRef.current } : prev));
        return;
      }

      if (trimmed !== lastSavedTitleRef.current) {
        const previousTitle = lastSavedTitleRef.current;
        lastSavedTitleRef.current = trimmed;
        updateTaskData({ title: trimmed }).catch(() => {
          lastSavedTitleRef.current = previousTitle;
          setTask((prev) => (prev ? { ...prev, title: previousTitle } : prev));
        });
      }
    },
    [task, updateTaskData]
  );

  const handleDescriptionSave = useCallback(
    (newDesc) => {
      if (!task) return;
      updateTaskData({ description: newDesc });
    },
    [task, updateTaskData]
  );

  const handleToggleChecklistItem = useCallback(
    (itemId) => {
      if (!task) return;
      updateTaskData({ checklist: toggleChecklistItem(task.checklist, itemId) });
    },
    [task, updateTaskData]
  );

  const handleAddChecklistItem = useCallback(
    (title) => {
      if (!task) return;
      const updated = addChecklistItem(task.checklist, title);
      if (updated !== task.checklist) {
        updateTaskData({ checklist: updated });
      }
    },
    [task, updateTaskData]
  );

  const handleEditChecklistItem = useCallback(
    (itemId, newTitle) => {
      if (!task) return;
      updateTaskData({ checklist: updateChecklistItem(task.checklist, itemId, newTitle) });
    },
    [task, updateTaskData]
  );

  const handleDeleteChecklistItem = useCallback(
    (itemId) => {
      if (!task) return;
      updateTaskData({ checklist: removeChecklistItem(task.checklist, itemId) });
    },
    [task, updateTaskData]
  );

  const handleDeleteChecklist = useCallback(() => {
    if (!task) return;
    updateTaskData({ checklist: [] });
  }, [task, updateTaskData]);

  const handleToggleMember = useCallback(
    (memberId) => {
      if (!task) return;
      updateTaskData({ assigneeIds: toggleArrayItem(task.assigneeIds || [], memberId) });
    },
    [task, updateTaskData]
  );

  const handleToggleLabel = useCallback(
    (labelName) => {
      if (!task) return;
      updateTaskData({ labels: toggleArrayItem(task.labels || [], labelName) });
    },
    [task, updateTaskData]
  );

  const taskProjectId = task?.projectId;
  const handleLabelsChanged = useCallback(
    async (change) => {
      if (!taskProjectId) return;
      try {
        const freshLabels = await taskService.getLabels(taskProjectId);
        setLabels(freshLabels);

        if (change?.oldName && change?.newName) {
          setTask((previous) => ({
            ...previous,
            labels: (previous?.labels || []).map((name) =>
              name === change.oldName ? change.newName : name
            ),
          }));
        }
        if (change?.deletedName) {
          setTask((previous) => ({
            ...previous,
            labels: (previous?.labels || []).filter((name) => name !== change.deletedName),
          }));
        }
      } catch (err) {
        setToast({
          message: "Failed to refresh labels: " + err.message,
          type: "error",
        });
      }
    },
    [taskProjectId]
  );

  const handleStatusChange = useCallback(
    (newStatus) => {
      updateTaskData({ status: newStatus });
    },
    [updateTaskData]
  );

  const handlePriorityChange = useCallback(
    (newPriority) => {
      updateTaskData({ priority: newPriority });
    },
    [updateTaskData]
  );

  const handleStartDateChange = useCallback(
    (dateString) => {
      updateTaskData({
        startAt: parseInputToIsoDate(dateString),
      });
    },
    [updateTaskData]
  );

  const handleDueDateChange = useCallback(
    (dateString) => {
      updateTaskData({
        dueAt: parseInputToIsoDate(dateString),
      });
    },
    [updateTaskData]
  );

  const handleReminderChange = useCallback(
    (reminderMinutes) => {
      const mins = parseInt(reminderMinutes, 10);
      updateTaskData({
        reminderMinutesBefore: isNaN(mins) ? [] : [mins],
      });
    },
    [updateTaskData]
  );

  const handleDeleteTask = useCallback(async () => {
    if (!task) return null;
    try {
      await taskService.deleteTask(task.id);
      return { success: true, taskTitle: task.title };
    } catch (err) {
      setToast({
        message: "Failed to delete task: " + err.message,
        type: "error",
      });
      throw err;
    }
  }, [task]);

  const clearToast = useCallback(() => setToast(null), []);

  return {
    task,
    setTask,
    project,
    members,
    labels,
    statuses,
    isLoading,
    loading: isLoading,
    isNotFound,
    notFound: isNotFound,
    error,
    toast,
    setToast,
    clearToast,
    projectId,
    projectName,
    updateTaskData,
    handleTitleSave,
    handleDescriptionSave,
    handleToggleChecklistItem,
    handleAddChecklistItem,
    handleEditChecklistItem,
    handleDeleteChecklistItem,
    handleDeleteChecklist,
    handleToggleMember,
    handleToggleLabel,
    handleLabelsChanged,
    handleStatusChange,
    handlePriorityChange,
    handleStartDateChange,
    handleDueDateChange,
    handleReminderChange,
    handleDeleteTask,
  };
}
