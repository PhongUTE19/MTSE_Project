// src/components/MembersPopup.jsx
import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Settings, X } from "lucide-react";
import Avatar from "./Avatar";
import "../styles/MembersPopup.css";

/**
 * Reusable dropdown/popover menu for selecting and assigning project members.
 * Used in TaskDetail and CreateTask.
 */
const MembersPopup = forwardRef(function MembersPopup(
  {
    projectId,
    members = [],
    selectedMemberIds = [],
    onToggleMember,
    onClose,
  },
  ref
) {
  return (
    <div className="popover-menu" ref={ref} onClick={(e) => e.stopPropagation()}>
      <div className="popover-header">
        <span className="popover-title">Assign Members</span>
        <button
          type="button"
          className="popover-close"
          aria-label="Close picker"
          onClick={onClose}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="popover-list">
        {members.map((member) => {
          const isSelected = selectedMemberIds.includes(member.id);
          return (
            <div
              key={member.id}
              className={`popover-item ${isSelected ? "selected" : ""}`}
              onClick={() => onToggleMember(member.id)}
            >
              <input
                type="checkbox"
                checked={isSelected}
                readOnly
                className="popover-checkbox"
              />
              <Avatar
                name={member.name}
                className="member-avatar-sm"
              />
              <div className="member-name-mssv">
                <span className="member-name">{member.name}</span>
                {member.mssv && (
                  <span className="member-mssv"> ({member.mssv})</span>
                )}
              </div>
            </div>
          );
        })}
        {members.length === 0 && (
          <div className="popover-empty">
            No members found in this project.
          </div>
        )}
        <div className="popover-footer">
          <Link
            to={projectId ? `/settings?projectId=${projectId}` : "/settings"}
            state={{ tab: "members" }}
            className="popover-manage-link"
          >
            <Settings size={18} aria-hidden="true" /> Manage Members
          </Link>
        </div>
      </div>
    </div>
  );
});

export default MembersPopup;
