// src/pages/Dashboard.jsx
import { projects, tasks } from "../data/mockData";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";

export default function Dashboard() {
  // Calculate statistics
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === "done").length;
  const now = new Date();
  const overdueTasks = tasks.filter(t => t.status !== "done" && t.dueAt && new Date(t.dueAt) < now).length;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3 className="stat-title">Total Projects</h3>
          <div className="stat-value primary">{totalProjects}</div>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Total Tasks</h3>
          <div className="stat-value default">{totalTasks}</div>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Tasks Done</h3>
          <div className="stat-value success">{doneTasks}</div>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Overdue Tasks</h3>
          <div className="stat-value danger">{overdueTasks}</div>
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
              {projects.length > 0 ? (
                projects.map(p => (
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
                      <Link to="/tasks" state={{ projectName: p.name }} className="btn-view-board">
                        View Board
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-row">
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
