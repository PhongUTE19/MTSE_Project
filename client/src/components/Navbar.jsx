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

      {/* Button Create Project */}
      <NavLink to="/projects/new" className="btn-create">
        + Create Project
      </NavLink>

      {/* Các link điều hướng */}
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
      >
        Dashboard
      </NavLink>
    </nav>
  );
}
