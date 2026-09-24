import { ChevronDown, ClipboardList, Plus, Tags, Users, X } from "lucide-react";
import { Link } from "react-router-dom";
import { getStatusLabel, PRIORITIES } from "../utils/constants";
import { getMemberById, resolveLabelColor } from "../utils/taskHelpers";
import LabelsPopup from "../components/LabelsPopup";
import MembersPopup from "../components/MembersPopup";
import Avatar from "../components/Avatar";
import AiTaskAssistant from "../components/AiTaskAssistant";
import { useCreateTask } from "../hooks/useCreateTask";
import "../styles/CreateTask.css";

export default function CreateTask() {
  const {
    projectId,
    projectName,
    defaultStatus,
    members,
    labels,
    statuses,
    values,
    errors,
    touched,
    isSubmitting,
    showMembersPopup,
    showLabelsPopup,
    membersWrapperRef,
    labelsWrapperRef,
    toggleMembersPopup,
    toggleLabelsPopup,
    closeMembersPopup,
    closeLabelsPopup,
    handleChange,
    handleBlur,
    handleToggleMember,
    handleToggleLabel,
    handleLabelsChanged,
    handleApplyAiSuggestion,
    handleSubmit,
  } = useCreateTask();

  if (!projectId) {
    return (
      <div className="create-task-container" role="presentation">
        <div className="create-task-modal" role="dialog" aria-modal="true" aria-label="Create task">
          <div className="btn-close-container">
            <Link to="/dashboard" className="btn-close" aria-label="Close">
              <X size={18} aria-hidden="true" />
            </Link>
          </div>
          <div style={{ textAlign: "center", padding: "48px 16px" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "12px", color: "var(--text-primary)" }}>
              No Project Selected
            </h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
              Please select or open a project before creating a task.
            </p>
            <Link to="/dashboard" className="btn-submit" style={{ textDecoration: "none", display: "inline-flex" }}>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-task-container" role="presentation">
      <div className="create-task-modal" role="dialog" aria-modal="true" aria-label="Create task">
        <div className="btn-close-container">
          <Link
            to={`/tasks?projectId=${projectId}`}
            state={{ projectId, projectName }}
            className="btn-close"
            aria-label="Close"
          >
            <X size={18} aria-hidden="true" />
          </Link>
        </div>

        <h1 className="create-task-title">
          <ClipboardList size={18} aria-hidden="true" /> Create New Task
          <span className="create-task-status-badge">
            in {getStatusLabel(statuses, defaultStatus)}
          </span>
        </h1>

        {/* AI Task Assistant Banner / Input */}
        <AiTaskAssistant
          onApplySuggestion={handleApplyAiSuggestion}
          availableLabels={labels}
          projectId={projectId}
        />

        <form onSubmit={handleSubmit} className="create-task-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              name="title"
              value={values.title}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Do homework"
              className="form-input"
            />
            {touched.title && errors.title && (
              <span className="form-error">{errors.title}</span>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={values.description}
              onChange={handleChange}
              placeholder="Add more details..."
              className="form-textarea"
              onBlur={handleBlur}
            />
          </div>

          {/* Deadline */}
          <div className="form-group">
            <label className="form-label">Deadline *</label>
            <input
              type="datetime-local"
              name="deadline"
              value={values.deadline}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-input"
            />
            {touched.deadline && errors.deadline && (
              <span className="form-error">{errors.deadline}</span>
            )}
          </div>

          {/* Members (Assignees) Dropdown / Popup */}
          <div className="form-group">
            <label className="form-label">Members</label>
            <div className="picker-wrapper" ref={membersWrapperRef}>
              <button
                type="button"
                className="btn-picker"
                onClick={toggleMembersPopup}
              >
                <span>
                  <Users size={18} aria-hidden="true" /> Assign Members
                </span>
                <span className="picker-count">
                  {values.assigneeIds.length > 0 ? (
                    `(${values.assigneeIds.length} selected)`
                  ) : (
                    <ChevronDown size={16} aria-hidden="true" />
                  )}
                </span>
              </button>

              {showMembersPopup && (
                <MembersPopup
                  projectId={projectId}
                  members={members}
                  selectedMemberIds={values.assigneeIds}
                  onToggleMember={handleToggleMember}
                  onClose={closeMembersPopup}
                />
              )}
            </div>

            {/* Display selected members */}
            <div className="selected-chips-container">
              {values.assigneeIds.length > 0 ? (
                values.assigneeIds.map((id) => {
                  const member = getMemberById(members, id);
                  return (
                    <span key={id} className="selected-member-chip">
                      <Avatar name={member.name} className="member-avatar-xs" />
                      <span className="chip-label">{member.name}</span>
                      <button
                        type="button"
                        className="chip-remove-btn"
                        aria-label="Remove selection"
                        onClick={() => handleToggleMember(id)}
                        title="Remove member"
                      >
                        <X size={18} aria-hidden="true" />
                      </button>
                    </span>
                  );
                })
              ) : (
                <span className="empty-chips-hint">No members assigned yet.</span>
              )}
            </div>
          </div>

          {/* Labels Dropdown / Popup */}
          <div className="form-group">
            <label className="form-label">Labels</label>
            <div className="picker-wrapper" ref={labelsWrapperRef}>
              <button
                type="button"
                className="btn-picker"
                onClick={toggleLabelsPopup}
              >
                <span>
                  <Tags size={18} aria-hidden="true" /> Select Labels
                </span>
                <span className="picker-count">
                  {values.labels.length > 0 ? (
                    `(${values.labels.length} selected)`
                  ) : (
                    <ChevronDown size={16} aria-hidden="true" />
                  )}
                </span>
              </button>

              {showLabelsPopup && (
                <LabelsPopup
                  projectId={projectId}
                  selectedLabelNames={values.labels}
                  onToggleLabel={handleToggleLabel}
                  onLabelsChanged={handleLabelsChanged}
                  onClose={closeLabelsPopup}
                />
              )}
            </div>

            {/* Display selected labels */}
            <div className="selected-chips-container">
              {values.labels.length > 0 ? (
                values.labels.map((l) => {
                  return (
                    <span
                      key={l}
                      className="selected-label-chip"
                      style={{
                        "--label-color": resolveLabelColor(labels, l),
                      }}
                    >
                      <span className="chip-label">{l}</span>
                      <button
                        type="button"
                        className="chip-remove-btn"
                        aria-label="Remove selection"
                        onClick={() => handleToggleLabel(l)}
                        title="Remove label"
                      >
                        <X size={18} aria-hidden="true" />
                      </button>
                    </span>
                  );
                })
              ) : (
                <span className="empty-chips-hint">No labels selected.</span>
              )}
            </div>
          </div>

          {/* Acceptance Criteria */}
          <div className="form-group">
            <label className="form-label">
              Acceptance Criteria (one per line)
            </label>
            <textarea
              name="checklist"
              value={values.checklist}
              onChange={handleChange}
              placeholder="e.g. Write tests&#10;Update documentation"
              className="form-textarea"
            />
          </div>

          {/* Priority */}
          <div className="form-group-last">
            <label className="form-label">Priority</label>
            <select
              name="priority"
              value={values.priority}
              onChange={handleChange}
              onBlur={handleBlur}
              className="form-input"
            >
              {PRIORITIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            <Plus size={17} aria-hidden="true" />{" "}
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
}
