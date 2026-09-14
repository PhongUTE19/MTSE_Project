// src/components/taskDetail/TaskDetailHeader.jsx
import { BookOpen } from "lucide-react";
import { getStatusLabel } from "../../utils/constants";

export default function TaskDetailHeader({
  title,
  status,
  statuses,
  onTitleChange,
  onTitleBlur,
}) {
  return (
    <div className="header-section">
      <span className="header-icon">
        <BookOpen size={18} aria-hidden="true" />
      </span>
      <div className="header-content">
        <input
          value={title || ""}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={onTitleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className="title-input"
          aria-label="Task title"
        />
        <p className="list-info">
          in list <span>{getStatusLabel(statuses, status)}</span>
        </p>
      </div>
    </div>
  );
}
