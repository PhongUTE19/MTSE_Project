import { Link } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  AlertTriangle,
  ExternalLink,
  FolderKanban,
  ListTodo,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { formatDisplayDate } from "../utils/date";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const {
    projectsList,
    stats,
    loading,
    projectToDelete,
    setProjectToDelete,
    isDeleting,
    handleConfirmDelete,
    handleCancelDelete,
  } = useDashboard();

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* Statistics Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <FolderKanban className="stat-icon" size={22} aria-hidden="true" />
          <h3 className="stat-title">Total Projects</h3>
          <div className="stat-value primary">
            {loading ? "..." : stats.totalProjects}
          </div>
        </div>
        <div className="stat-card">
          <ListTodo className="stat-icon" size={22} aria-hidden="true" />
          <h3 className="stat-title">Total Tasks</h3>
          <div className="stat-value default">
            {loading ? "..." : stats.totalTasks}
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle2 className="stat-icon" size={22} aria-hidden="true" />
          <h3 className="stat-title">Tasks Done</h3>
          <div className="stat-value success">
            {loading ? "..." : stats.doneTasks}
          </div>
        </div>
        <div className="stat-card">
          <AlertTriangle className="stat-icon" size={22} aria-hidden="true" />
          <h3 className="stat-title">Overdue Tasks</h3>
          <div className="stat-value danger">
            {loading ? "..." : stats.overdueTasks}
          </div>
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
                      <span
                        className={`status-badge ${
                          p.status === "active" ? "active" : "inactive"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="project-deadline">
                      {formatDisplayDate(p.deadline)}
                    </td>
                    <td className="right">
                      <div className="project-actions">
                        <Link
                          to={`/tasks?projectId=${p.id}`}
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
      <ConfirmDialog
        isOpen={!!projectToDelete}
        title="Delete Project"
        message={
          <>
            Are you sure you want to delete{" "}
            <strong>"{projectToDelete?.name}"</strong>? All tasks belonging to
            this project will be permanently deleted. This action cannot be
            undone.
          </>
        }
        confirmText="Delete Project"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
