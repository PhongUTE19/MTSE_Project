import { Layers,LayoutDashboard, Plus, Settings } from "lucide-react";
// src/components/Navbar.jsx
import { NavLink } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      {/* Logo / tên app */}
      <strong className="navbar-brand">
        <span className="brand-logo">
            <Layers size={26} />
         </span>
        MANA
      </strong>

      {/* Button Create Project */}
      <NavLink to="/projects/new" className="btn-create">
        <Plus size={18} aria-hidden="true" /> Create Project
      </NavLink>

      {/* Các link điều hướng */}
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
      >
        <LayoutDashboard size={18} aria-hidden="true" /> Dashboard
      </NavLink>
      <NavLink 
        to="/settings" 
        className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
      >
        <Settings size={18} aria-hidden="true" /> Settings
      </NavLink>
    </nav>
  );
}
