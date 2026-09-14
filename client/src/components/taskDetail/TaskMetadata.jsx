// src/components/taskDetail/TaskMetadata.jsx
import { Calendar, Clock3, CircleDot, Flag } from "lucide-react";
import { PRIORITIES, REMINDER_OPTIONS } from "../../utils/constants";
import { formatDateForInput } from "../../utils/date";

export default function TaskMetadata({
  status,
  statuses = [],
  priority,
  startAt,
  dueAt,
  reminderMinutesBefore = [],
  onStatusChange,
  onPriorityChange,
  onStartDateChange,
  onDueDateChange,
  onReminderChange,
}) {
  const startDateValue = formatDateForInput(startAt);
  const dueDateValue = formatDateForInput(dueAt);
  const reminderValue =
    reminderMinutesBefore && reminderMinutesBefore[0]
      ? String(reminderMinutesBefore[0])
      : "";

  return (
    <div>
      <div className="info-label">Task Metadata</div>
      <div className="metadata-grid">
        <strong className="metadata-label">
          <CircleDot size={14} aria-hidden="true" /> Status:
        </strong>
        <select
          value={status || "todo"}
          onChange={(e) => onStatusChange(e.target.value)}
          className="metadata-input"
          aria-label="Status"
        >
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
          {!statuses.some((s) => s.id === status) && status && (
            <option value={status}>{status}</option>
          )}
        </select>

        <strong className="metadata-label">
          <Flag size={14} aria-hidden="true" /> Priority:
        </strong>
        <select
          value={priority || "medium"}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="metadata-input"
          aria-label="Priority"
        >
          {PRIORITIES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>

        <strong className="metadata-label">
          <Calendar size={14} aria-hidden="true" /> Start:
        </strong>
        <input
          type="date"
          value={startDateValue}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="metadata-input"
          aria-label="Start date"
        />

        <strong className="metadata-label">
          <Calendar size={14} aria-hidden="true" /> Due:
        </strong>
        <input
          type="date"
          value={dueDateValue}
          onChange={(e) => onDueDateChange(e.target.value)}
          className="metadata-input"
          aria-label="Due date"
        />

        <strong className="metadata-label">
          <Clock3 size={14} aria-hidden="true" /> Reminder:
        </strong>
        <select
          value={reminderValue}
          onChange={(e) => onReminderChange(e.target.value)}
          className="metadata-input"
          aria-label="Reminder"
        >
          {REMINDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
