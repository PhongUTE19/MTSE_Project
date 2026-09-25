// src/hooks/useTaskList.js
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { taskService } from "../services/taskService";
import { DEFAULT_STATUSES } from "../utils/constants";
import { getMemberById, resolveLabelColor } from "../utils/taskHelpers";
import { useToast } from "../context/ToastContext";

/**
 * Custom hook encapsulating TaskList page state, board data loading,
 * drag-and-drop operations, and optimistic status updates.
 */
export function useTaskList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showError, showSuccess } = useToast();

  const projectId = location.state?.projectId || searchParams.get("projectId") || null;
  const projectName = location.state?.projectName || (projectId ? "Team Workboard" : null);

  const [state, setState] = useState(() => ({
    status: projectId ? "loading" : "success",
    data: projectId ? null : [],
    error: null,
  }));

  const [members, setMembers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [statuses, setStatuses] = useState(DEFAULT_STATUSES);

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);

  // Add status column state
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  // Track location key changes so we can detect navigation back from modal
  const prevLocationKeyRef = useRef(location.key);
  const hasLoadedRef = useRef(false);

  // Initial fetch on mount (or when projectId changes)
  useEffect(() => {
    if (!projectId) return;

    let active = true;
    hasLoadedRef.current = false;

    taskService
      .getBoardData(projectId)
      .then((boardData) => {
        if (!active) return;
        setMembers(boardData.members);
        setLabels(boardData.labels);
        setStatuses(boardData.statuses);
        setState({ status: "success", data: boardData.tasks, error: null });
        hasLoadedRef.current = true;
      })
      .catch((err) => {
        if (!active) return;
        console.error("[useTaskList] Failed to load board data:", err);
        showError(err?.message || "Unable to load tasks.");
        setState({
          status: "success",
          data: [],
          error: null,
        });
        hasLoadedRef.current = true;
      });

    return () => {
      active = false;
    };
  }, [projectId, showError]);

  /**
   * Replace a single task in the board state in-place (by ID), preserving
   * the existing array order. If the task is not found it is appended.
   */
  const replaceTaskInBoard = useCallback((updatedTask) => {
    if (!updatedTask?.id) return;
    setState((prev) => {
      const existing = prev.data || [];
      const idx = existing.findIndex((t) => t.id === updatedTask.id);
      if (idx === -1) {
        return { ...prev, data: [...existing, updatedTask] };
      }
      const newData = [...existing];
      newData[idx] = updatedTask;
      return { ...prev, data: newData };
    });
  }, []);

  /**
   * Silent background refresh: re-fetches board data and merges the results
   * in-place (by task ID) to preserve the existing display order.
   * Called automatically when the user navigates back from the task detail modal.
   */
  const silentRefreshBoard = useCallback(async () => {
    if (!projectId) return;
    try {
      const boardData = await taskService.getBoardData(projectId);
      setMembers(boardData.members);
      setLabels(boardData.labels);
      setStatuses(boardData.statuses);
      setState((prev) => {
        const existing = prev.data || [];
        if (existing.length === 0) {
          return { ...prev, data: boardData.tasks };
        }
        // Map fresh tasks by ID for O(1) lookup
        const freshMap = new Map((boardData.tasks || []).map((t) => [t.id, t]));
        // Replace each existing task in-place with the fresh version (preserves order)
        const merged = existing.map((t) => freshMap.get(t.id) || t);
        // Append any brand-new tasks not yet in the board
        const existingIds = new Set(existing.map((t) => t.id));
        const newTasks = (boardData.tasks || []).filter((t) => !existingIds.has(t.id));
        return { ...prev, data: [...merged, ...newTasks] };
      });
    } catch (err) {
      // Silent — don't show an error toast for a background refresh
      console.error("[useTaskList] Background refresh failed:", err);
    }
  }, [projectId]);

  // When the location key changes (the user navigated somewhere and came back),
  // silently refresh the board so any changes made in the task detail modal
  // (labels, members, status, etc.) are reflected without reordering tasks.
  useEffect(() => {
    const prevKey = prevLocationKeyRef.current;
    prevLocationKeyRef.current = location.key;

    // Skip the very first render — the initial fetch effect handles that
    if (!hasLoadedRef.current) return;
    // No real navigation happened
    if (prevKey === location.key) return;
    // If we are currently inside a modal overlay, don't refresh the board
    if (location.state?.backgroundLocation) return;

    silentRefreshBoard();
  }, [location.key, location.state, silentRefreshBoard]);

  // Clean retry callback without full page reload
  const retry = useCallback(() => {
    if (!projectId) {
      navigate("/dashboard");
      return;
    }

    setState((prev) => ({ ...prev, status: "loading", error: null }));

    taskService
      .getBoardData(projectId)
      .then((boardData) => {
        setMembers(boardData.members);
        setLabels(boardData.labels);
        setStatuses(boardData.statuses);
        setState({ status: "success", data: boardData.tasks, error: null });
      })
      .catch((err) => {
        showError(err?.message || "Unable to load tasks.");
        setState({
          status: "success",
          data: [],
          error: null,
        });
      });
  }, [projectId, navigate, showError]);

  // Drag & drop handlers
  const handleDragStart = useCallback((e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedTaskId(taskId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTaskId(null);
    setDragOverColumnId(null);
  }, []);

  const handleDragOver = useCallback((e, columnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumnId((prev) => (prev !== columnId ? columnId : prev));
  }, []);

  const handleDragLeave = useCallback((e, columnId) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumnId((prev) => (prev === columnId ? null : prev));
    }
  }, []);

  // Drop handler with optimistic UI update and rollback
  const handleDropTask = useCallback(
    async (e, targetStatusId) => {
      e.preventDefault();
      setDragOverColumnId(null);
      const taskId = e.dataTransfer?.getData("text/plain") || draggedTaskId;
      if (!taskId) return;

      const targetTask = state.data?.find((t) => t.id === taskId);
      if (!targetTask || targetTask.status === targetStatusId) {
        setDraggedTaskId(null);
        return;
      }

      const previousStatus = targetTask.status;

      // Optimistically update status in-place (no reorder)
      setState((prev) => ({
        ...prev,
        data: (prev.data || []).map((t) =>
          t.id === taskId ? { ...t, status: targetStatusId } : t
        ),
      }));
      setDraggedTaskId(null);

      try {
        const updated = await taskService.updateTask(taskId, { status: targetStatusId });
        // Replace with server response in-place to stay up to date
        if (updated) replaceTaskInBoard(updated);
      } catch (err) {
        // Rollback on failure
        setState((prev) => ({
          ...prev,
          data: (prev.data || []).map((t) =>
            t.id === taskId ? { ...t, status: previousStatus } : t
          ),
        }));
        showError("Failed to update status: " + (err?.message || "Unknown error"));
      }
    },
    [draggedTaskId, state.data, showError, replaceTaskInBoard]
  );

  // Create new status column
  const handleCreateStatus = useCallback(
    async (e) => {
      e.preventDefault();
      if (!newStatusName.trim() || !projectId) return;

      setIsSubmittingStatus(true);
      try {
        const created = await taskService.createStatus(projectId, {
          name: newStatusName.trim(),
        });
        setStatuses((prev) => [...prev, created]);
        setNewStatusName("");
        setIsAddingStatus(false);
        showSuccess(`Status "${created.name}" created successfully.`);
      } catch (err) {
        showError(err?.message || "Failed to create status.");
      } finally {
        setIsSubmittingStatus(false);
      }
    },
    [newStatusName, projectId, showError, showSuccess]
  );

  // Group tasks into status columns
  const columnList = useMemo(() => {
    const list = statuses.map((status) => ({
      id: status.id,
      title: status.name,
      tasks: [],
    }));
    const columnMap = new Map(list.map((col) => [col.id, col]));

    (state.data || []).forEach((task) => {
      const col = columnMap.get(task.status);
      if (col) {
        col.tasks.push(task);
      } else if (list.length > 0) {
        list[0].tasks.push(task);
      }
    });

    return list;
  }, [statuses, state.data]);

  // Lookup helpers
  const getStudent = useCallback(
    (id) => getMemberById(members, id),
    [members]
  );

  const getLabel = useCallback(
    (name) => ({ color: resolveLabelColor(labels, name) }),
    [labels]
  );

  return {
    projectId,
    projectName,
    members,
    labels,
    state,
    statuses,
    draggedTaskId,
    dragOverColumnId,
    isAddingStatus,
    setIsAddingStatus,
    newStatusName,
    setNewStatusName,
    isSubmittingStatus,
    columnList,
    retry,
    replaceTaskInBoard,
    silentRefreshBoard,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDropTask,
    handleCreateStatus,
    getStudent,
    getLabel,
  };
}
