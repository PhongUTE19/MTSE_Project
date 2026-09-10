// src/components/Navbar.jsx
import { NavLink } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      {/* Logo / tên app */}
      <strong className="navbar-brand">
        MANA
      </strong>

      {/* Button Create (Giống Jira) */}
      <NavLink to="/tasks/new" className="btn-create">
        + Create
      </NavLink>

      {/* Các link điều hướng */}
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
      >
        Dashboard
      </NavLink>
      <NavLink 
        to="/tasks" 
        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
      >
        Task List
      </NavLink>
    </nav>
  );
}
