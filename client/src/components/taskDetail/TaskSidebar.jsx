// src/components/taskDetail/TaskSidebar.jsx
import { useState } from "react";
import { Tags, Users } from "lucide-react";
import MembersPopup from "../MembersPopup";
import LabelsPopup from "../LabelsPopup";
import TaskMetadata from "./TaskMetadata";
import TaskActions from "./TaskActions";
import useClickOutside from "../../hooks/useClickOutside";

export default function TaskSidebar({
  task,
  members = [],
  statuses = [],
  onToggleMember,
  onToggleLabel,
  onLabelsChanged,
  onStatusChange,
  onPriorityChange,
  onStartDateChange,
  onDueDateChange,
  onReminderChange,
  onDeleteTask,
}) {
  const [showMembersPopup, setShowMembersPopup] = useState(false);
  const [showLabelsPopup, setShowLabelsPopup] = useState(false);

  const membersWrapperRef = useClickOutside(
    () => setShowMembersPopup(false),
    showMembersPopup
  );
  const labelsWrapperRef = useClickOutside(
    () => setShowLabelsPopup(false),
    showLabelsPopup
  );

  return (
    <div className="sidebar-column">
      <div>
        <div className="info-label">Add to card</div>
        <div className="sidebar-buttons">
          {/* Members Popup */}
          <div className="sidebar-btn-wrapper" ref={membersWrapperRef}>
            <button
              type="button"
              onClick={() => {
                setShowMembersPopup((prev) => !prev);
                setShowLabelsPopup(false);
              }}
              className="btn-sidebar btn-sidebar-full"
            >
              <Users size={18} aria-hidden="true" /> Members
            </button>

            {showMembersPopup && (
              <MembersPopup
                projectId={task.projectId}
                members={members}
                selectedMemberIds={task.assigneeIds || []}
                onToggleMember={onToggleMember}
                onClose={() => setShowMembersPopup(false)}
              />
            )}
          </div>

          {/* Labels Popup */}
          <div className="sidebar-btn-wrapper" ref={labelsWrapperRef}>
            <button
              type="button"
              onClick={() => {
                setShowLabelsPopup((prev) => !prev);
                setShowMembersPopup(false);
              }}
              className="btn-sidebar btn-sidebar-full"
            >
              <Tags size={18} aria-hidden="true" /> Labels
            </button>

            {showLabelsPopup && (
              <LabelsPopup
                projectId={task.projectId}
                selectedLabelNames={task.labels || []}
                onToggleLabel={onToggleLabel}
                onLabelsChanged={onLabelsChanged}
                onClose={() => setShowLabelsPopup(false)}
              />
            )}
          </div>
        </div>
      </div>

      <TaskMetadata
        status={task.status}
        statuses={statuses}
        priority={task.priority}
        startAt={task.startAt}
        dueAt={task.dueAt}
        reminderMinutesBefore={task.reminderMinutesBefore}
        onStatusChange={onStatusChange}
        onPriorityChange={onPriorityChange}
        onStartDateChange={onStartDateChange}
        onDueDateChange={onDueDateChange}
        onReminderChange={onReminderChange}
      />

      <TaskActions
        onDeleteTask={onDeleteTask}
        taskTitle={task.title}
      />
    </div>
  );
}
