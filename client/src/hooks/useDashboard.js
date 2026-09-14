// src/hooks/useDashboard.js
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { projectService } from "../services/projectService";

const INITIAL_STATS = {
  totalProjects: 0,
  totalTasks: 0,
  doneTasks: 0,
  overdueTasks: 0,
};

/**
 * Custom hook encapsulating Dashboard data loading, deletion flow, and state orchestration.
 */
export function useDashboard() {
  const location = useLocation();

  const [projectsList, setProjectsList] = useState([]);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(location.state?.toast || null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch projects and stats on mount with request cancellation guard
  useEffect(() => {
    let active = true;

    projectService
      .getDashboardData()
      .then(({ projects, stats: statsData }) => {
        if (!active) return;
        setProjectsList(projects || []);
        setStats(statsData || INITIAL_STATS);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        if (!active) return;
        console.error("[useDashboard] Error loading dashboard data:", err);
        setError(err?.message || "Failed to load dashboard data.");
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  // Handle project deletion with automatic data refresh
  const handleConfirmDelete = useCallback(async () => {
    if (!projectToDelete) return;
    const target = projectToDelete;
    setIsDeleting(true);

    try {
      await projectService.deleteProject(target.id);
      const { projects, stats: updatedStats } = await projectService.getDashboardData();

      setProjectsList(projects || []);
      setStats(updatedStats || INITIAL_STATS);
      setProjectToDelete(null);
      setToast({
        message: `Project "${target.name}" and its tasks were deleted successfully.`,
        type: "success",
      });
    } catch (err) {
      setToast({
        message: "Failed to delete project: " + (err?.message || "Unknown error"),
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [projectToDelete]);

  const handleCancelDelete = useCallback(() => {
    if (!isDeleting) {
      setProjectToDelete(null);
    }
  }, [isDeleting]);

  return {
    projectsList,
    stats,
    loading,
    error,
    toast,
    clearToast,
    projectToDelete,
    setProjectToDelete,
    isDeleting,
    handleConfirmDelete,
    handleCancelDelete,
  };
}
