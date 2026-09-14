// src/hooks/useTaskList.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { taskService } from "../services/taskService";
import { DEFAULT_STATUSES } from "../utils/constants";
import { getMemberById, resolveLabelColor } from "../utils/taskHelpers";

/**
 * Custom hook encapsulating TaskList board state, data loading, drag-and-drop orchestration,
 * status creation, and feedback.
 */
export function useTaskList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Route context resolution
  const projectId = location.state?.projectId || searchParams.get("projectId") || null;
  const projectName = location.state?.projectName || (projectId ? "Team Workboard" : null);

  // Board state - initialized directly based on projectId
  const [state, setState] = useState(() => {
    if (!projectId) {
      return {
        status: "error",
        data: null,
        error: { message: "No project selected. Please select a project from the Dashboard." },
      };
    }
    return {
      status: "loading",
      data: null,
      error: null,
    };
  });

  const [members, setMembers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [statuses, setStatuses] = useState(DEFAULT_STATUSES);
  const [toast, setToast] = useState(location.state?.toast || null);

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);

  // Add status column state
  const [isAddingStatus, setIsAddingStatus] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  // Fetch board data with cancellation guard
  useEffect(() => {
    if (!projectId) return;

    let active = true;

    taskService
      .getBoardData(projectId)
      .then((boardData) => {
        if (!active) return;
        setMembers(boardData.members);
        setLabels(boardData.labels);
        setStatuses(boardData.statuses);
        setState({ status: "success", data: boardData.tasks, error: null });
      })
      .catch((err) => {
        if (!active) return;
        console.error("[useTaskList] Failed to load board data:", err);
        setState({
          status: "error",
          data: null,
          error: { message: err?.message || "Unable to load tasks." },
        });
      });

    return () => {
      active = false;
    };
  }, [projectId]);

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
        setState({
          status: "error",
          data: null,
          error: { message: err?.message || "Unable to load tasks." },
        });
      });
  }, [projectId, navigate]);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

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

      // Optimistically update status
      setState((prev) => ({
        ...prev,
        data: (prev.data || []).map((t) =>
          t.id === taskId ? { ...t, status: targetStatusId } : t
        ),
      }));
      setDraggedTaskId(null);

      try {
        await taskService.updateTask(taskId, { status: targetStatusId });
      } catch (err) {
        // Rollback on failure
        setState((prev) => ({
          ...prev,
          data: (prev.data || []).map((t) =>
            t.id === taskId ? { ...t, status: previousStatus } : t
          ),
        }));
        setToast({
          message: "Failed to update status: " + (err?.message || "Unknown error"),
          type: "error",
        });
      }
    },
    [draggedTaskId, state.data]
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
        setToast({
          message: `Status "${created.name}" created successfully.`,
          type: "success",
        });
      } catch (err) {
        setToast({
          message: err?.message || "Failed to create status.",
          type: "error",
        });
      } finally {
        setIsSubmittingStatus(false);
      }
    },
    [newStatusName, projectId]
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
    toast,
    clearToast,
    draggedTaskId,
    dragOverColumnId,
    isAddingStatus,
    setIsAddingStatus,
    newStatusName,
    setNewStatusName,
    isSubmittingStatus,
    columnList,
    retry,
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
