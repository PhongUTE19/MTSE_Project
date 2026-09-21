import { Link } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  FolderKanban,
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { formatDisplayDate } from "../utils/date";
import "../styles/Dashboard.css";

function StatCard({ label, icon: Icon, value }) {
  return (
    <div className="stat-card">
      <div className="stat-card-head">
        <span>{label}</span>
        <Icon size={16} strokeWidth={1.75} />
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
}

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
    <>
      <div className="content-head">
        <h1>Dashboard</h1>
      </div>

      <div className="stat-grid">
        <StatCard 
          label="Total Projects" 
          icon={FolderKanban} 
          value={loading ? "..." : stats.totalProjects} 
        />
        <StatCard 
          label="Total Tasks" 
          icon={ListTodo} 
          value={loading ? "..." : stats.totalTasks} 
        />
        <StatCard 
          label="Tasks Done" 
          icon={CheckCircle2} 
          value={loading ? "..." : stats.doneTasks} 
        />
        <StatCard 
          label="Overdue Tasks" 
          icon={AlertTriangle} 
          value={loading ? "..." : stats.overdueTasks} 
        />
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Active Projects</h2>
        </div>
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
                          <ExternalLink size={14} /> View Board
                        </Link>
                        <button
                          type="button"
                          className="btn-delete-project"
                          onClick={() => setProjectToDelete(p)}
                          title={`Delete project ${p.name}`}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-row" style={{ textAlign: "center", padding: "32px", color: "var(--muted)" }}>
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
    </>
  );
}
