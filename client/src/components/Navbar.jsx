// src/components/Navbar.jsx
import { NavLink } from "react-router-dom";
import { Layers3, FolderPlus, LayoutDashboard } from "lucide-react";
import "../styles/Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      {/* Logo / tên app */}
      <strong className="navbar-brand">
        <Layers3 size={28} />
        MANA
      </strong>

      {/* Button Create Project */}
      <NavLink to="/projects/new" className="btn-create">
        <FolderPlus size={19} />
        Create Project
      </NavLink>

      {/* Các link điều hướng */}
      <NavLink
        to="/dashboard"
        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
      >
        <LayoutDashboard size={18} />
        Dashboard
      </NavLink>
    </nav>
  );
}
