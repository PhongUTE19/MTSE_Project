// src/hooks/useCreateTask.js
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { validateTaskForm } from "../utils/validators";
import { taskService } from "../services/taskService";
import {
  DEFAULT_STATUSES,
  DEFAULT_TASK_STATUS,
} from "../utils/constants";
import { parseChecklistInput, toggleArrayItem } from "../utils/taskHelpers";
import useClickOutside from "./useClickOutside";

const INITIAL_VALUES = {
  title: "",
  description: "",
  deadline: "",
  priority: "medium",
  assigneeIds: [],
  labels: [],
  checklist: "",
};

/**
 * Custom hook encapsulating Create Task form state, reference data, and submission flow.
 */
export function useCreateTask() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Resolve route context: state takes precedence, then searchParams, or null if missing
  const projectId =
    location.state?.projectId ||
    searchParams.get("projectId") ||
    null;
  const projectName = location.state?.projectName;
  const defaultStatus = location.state?.status || DEFAULT_TASK_STATUS;

  // Reference data
  const [members, setMembers] = useState([]);
  const [labels, setLabels] = useState([]);
  const [statuses, setStatuses] = useState(DEFAULT_STATUSES);

  // Form values, errors, touched, and feedback
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Popup toggle states & click-outside handling
  const [showMembersPopup, setShowMembersPopup] = useState(false);
  const [showLabelsPopup, setShowLabelsPopup] = useState(false);

  const closeMembersPopup = useCallback(() => setShowMembersPopup(false), []);
  const closeLabelsPopup = useCallback(() => setShowLabelsPopup(false), []);

  const membersWrapperRef = useClickOutside(closeMembersPopup, showMembersPopup);
  const labelsWrapperRef = useClickOutside(closeLabelsPopup, showLabelsPopup);

  const toggleMembersPopup = useCallback(() => {
    setShowMembersPopup((prev) => !prev);
    setShowLabelsPopup(false);
  }, []);

  const toggleLabelsPopup = useCallback(() => {
    setShowLabelsPopup((prev) => !prev);
    setShowMembersPopup(false);
  }, []);

  // Fetch reference data for current project
  useEffect(() => {
    if (!projectId) {
      return;
    }

    let active = true;

    taskService
      .getProjectReferenceData(projectId)
      .then((refData) => {
        if (!active) return;
        setMembers(refData.members || []);
        setLabels(refData.labels || []);
        setStatuses(
          refData.statuses && refData.statuses.length > 0
            ? refData.statuses
            : DEFAULT_STATUSES
        );
      })
      .catch((err) => {
        if (!active) return;
        console.error("[useCreateTask] Failed to fetch reference data:", err);
        setStatuses(DEFAULT_STATUSES);
      });

    return () => {
      active = false;
    };
  }, [projectId]);

  // Handle label updates (create, rename, delete)
  const handleLabelsChanged = useCallback(
    async (change) => {
      if (!projectId) return;
      try {
        const freshLabels = await taskService.getLabels(projectId);
        setLabels(freshLabels);
      } catch (err) {
        console.error("[useCreateTask] Failed to refresh labels:", err);
      }

      if (change?.oldName && change?.newName) {
        setValues((prev) => ({
          ...prev,
          labels: prev.labels.map((name) =>
            name === change.oldName ? change.newName : name
          ),
        }));
      }
      if (change?.deletedName) {
        setValues((prev) => ({
          ...prev,
          labels: prev.labels.filter((name) => name !== change.deletedName),
        }));
      }
    },
    [projectId]
  );

  // Form input change
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Form input blur
  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      setErrors(validateTaskForm({ ...values }));
    },
    [values]
  );

  // Toggle member assignment using toggleArrayItem
  const handleToggleMember = useCallback((memberId) => {
    setValues((prev) => ({
      ...prev,
      assigneeIds: toggleArrayItem(prev.assigneeIds, memberId),
    }));
  }, []);

  // Toggle label assignment using toggleArrayItem
  const handleToggleLabel = useCallback((label) => {
    setValues((prev) => ({
      ...prev,
      labels: toggleArrayItem(prev.labels, label),
    }));
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  // Submit form
  const handleSubmit = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    if (!projectId) {
      setToast({
        message: "Cannot create task: No project selected.",
        type: "error",
      });
      return;
    }

    const newErrors = validateTaskForm(values);
    setErrors(newErrors);
    setTouched({ title: true, deadline: true });

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await taskService.createTask({
        projectId,
        title: values.title,
        description: values.description,
        status: defaultStatus,
        priority: values.priority,
        deadline: values.deadline,
        assigneeIds: values.assigneeIds,
        labels: values.labels,
        checklist: parseChecklistInput(values.checklist),
      });

      navigate(`/tasks?projectId=${projectId}`, {
        state: {
          projectId,
          projectName,
          toast: {
            message: `Task "${values.title}" created successfully!`,
            type: "success",
          },
        },
      });
    } catch (err) {
      setToast({
        message: "Failed to create task: " + (err?.message || "Unknown error"),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    projectId,
    projectName,
    defaultStatus,
    members,
    labels,
    statuses,
    values,
    errors,
    touched,
    isSubmitting,
    toast,
    clearToast,
    showMembersPopup,
    showLabelsPopup,
    membersWrapperRef,
    labelsWrapperRef,
    toggleMembersPopup,
    toggleLabelsPopup,
    closeMembersPopup,
    closeLabelsPopup,
    handleChange,
    handleBlur,
    handleToggleMember,
    handleToggleLabel,
    handleLabelsChanged,
    handleSubmit,
  };
}
