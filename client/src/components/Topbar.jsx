import { PanelLeft } from "lucide-react";

export default function Topbar({ onToggleSidebar }) {
  return (
    <header className="topbar">
      <button className="icon-btn" onClick={onToggleSidebar}>
        <PanelLeft size={16} />
      </button>
      <div className="search" style={{ border: "none" }}></div>
    </header>
  );
}
