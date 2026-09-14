// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { mockApi } from "../services/mockApi";
import Toast from "../components/Toast";
import { AlertTriangle, ExternalLink, FolderKanban, ListTodo, Trash2, CheckCircle2 } from "lucide-react";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const location = useLocation();
  const [projectsList, setProjectsList] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    doneTasks: 0,
    overdueTasks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(location.state?.toast || null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([mockApi.getProjects(), mockApi.getDashboardStats()])
      .then(([projectsData, statsData]) => {
        if (isMounted) {
          setProjectsList(projectsData);
          setStats(statsData);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    const target = projectToDelete;
    setIsDeleting(true);
    try {
      await mockApi.deleteProject(target.id);
      // Immediately refresh Dashboard data
      const [updatedProjects, updatedStats] = await Promise.all([
        mockApi.getProjects(),
        mockApi.getDashboardStats(),
      ]);
      setProjectsList(updatedProjects);
      setStats(updatedStats);
      setProjectToDelete(null);
      setToast({
        message: `Project "${target.name}" and its tasks were deleted successfully.`,
        type: "success",
      });
    } catch (err) {
      setToast({
        message: "Failed to delete project: " + err.message,
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <FolderKanban className="stat-icon" size={22} aria-hidden="true" />
          <h3 className="stat-title">Total Projects</h3>
          <div className="stat-value primary">{loading ? "..." : stats.totalProjects}</div>
        </div>
        <div className="stat-card">
          <ListTodo className="stat-icon" size={22} aria-hidden="true" />
          <h3 className="stat-title">Total Tasks</h3>
          <div className="stat-value default">{loading ? "..." : stats.totalTasks}</div>
        </div>
        <div className="stat-card">
          <CheckCircle2 className="stat-icon" size={22} aria-hidden="true" />
          <h3 className="stat-title">Tasks Done</h3>
          <div className="stat-value success">{loading ? "..." : stats.doneTasks}</div>
        </div>
        <div className="stat-card">
          <AlertTriangle className="stat-icon" size={22} aria-hidden="true" />
          <h3 className="stat-title">Overdue Tasks</h3>
          <div className="stat-value danger">{loading ? "..." : stats.overdueTasks}</div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="projects-section">
        <h2 className="projects-title">Active Projects</h2>
        <div className="table-responsive">
          <table className="projects-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Course</th>
                <th>Status</th>
                <th>Deadline</th>
                <th className="right">Action</th>
              </tr>
            </thead>
            <tbody>
              {projectsList.length > 0 ? (
                projectsList.map((p) => (
                  <tr key={p.id}>
                    <td className="project-name">{p.name}</td>
                    <td className="project-course">{p.courseName}</td>
                    <td>
                      <span className={`status-badge ${p.status === "active" ? "active" : "inactive"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="project-deadline">
                      {p.deadline ? new Date(p.deadline).toLocaleDateString() : "-"}
                    </td>
                    <td className="right">
                      <div className="project-actions">
                        <Link
                          to="/tasks"
                          state={{ projectId: p.id, projectName: p.name }}
                          className="btn-view-board"
                        >
                          <ExternalLink size={15} aria-hidden="true" /> View Board
                        </Link>
                        <button
                          type="button"
                          className="btn-delete-project"
                          onClick={() => setProjectToDelete(p)}
                          title={`Delete project ${p.name}`}
                        >
                          <Trash2 size={15} aria-hidden="true" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-row">
                    {loading ? "Loading projects..." : "No projects found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-app confirmation dialog for deleting project */}
      {projectToDelete && (
        <div
          className="confirm-dialog-overlay"
          onClick={() => !isDeleting && setProjectToDelete(null)}
        >
          <div
            className="confirm-dialog-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
          >
            <h3 id="confirm-delete-title" className="confirm-dialog-title">
              <AlertTriangle size={18} aria-hidden="true" /> Delete Project
            </h3>
            <p className="confirm-dialog-body">
              Are you sure you want to delete <strong>"{projectToDelete.name}"</strong>?
              All tasks belonging to this project will be permanently deleted. This action cannot be undone.
            </p>
            <div className="confirm-dialog-actions">
              <button
                type="button"
                className="btn-confirm-cancel"
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-confirm-danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

