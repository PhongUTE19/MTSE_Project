import { Layers, LayoutDashboard, Plus, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="workspace-switch">
        <div className="workspace-icon">
          <Layers size={18} strokeWidth={2.5} />
        </div>
        <div className="workspace-text">
          <strong>MANA</strong>
          <span>Project Management</span>
        </div>
      </div>

      <div className="nav-section">
        <p className="nav-title">Menu</p>
        <ul>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              <LayoutDashboard size={16} strokeWidth={1.75} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/projects/new"
              state={{ backgroundLocation: location }}
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              <Plus size={16} strokeWidth={1.75} />
              <span>Create Project</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            >
              <Settings size={16} strokeWidth={1.75} />
              <span>Settings</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </aside>
  );
}
