// src/pages/CreateTask.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { validateTaskForm } from "../utils/validators";
import { mockApi } from "../services/mockApi";
import { PREDEFINED_MEMBERS, PREDEFINED_LABELS, getLabelColor } from "../utils/constants";
import Toast from "../components/Toast";
import "../styles/CreateTask.css";

export default function CreateTask() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get default status if navigated from a specific column, else 'todo'
  const defaultStatus = location.state?.status || "todo";
  const projectId = location.state?.projectId || "project-1";
  const projectName = location.state?.projectName;

  // Reference students list
  const [students, setStudents] = useState(PREDEFINED_MEMBERS);

  // Form values, errors, touched
  const [values, setValues] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "medium",
    assigneeIds: [],
    labels: [],
    checklist: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Popup toggle states
  const [showMembersPopup, setShowMembersPopup] = useState(false);
  const [showLabelsPopup, setShowLabelsPopup] = useState(false);

  // Load students
  useEffect(() => {
    let isMounted = true;
    mockApi
      .getStudents()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setStudents(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Update text field values
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  // Validate on blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validateTaskForm({ ...values }));
  };

  // Toggle member assignment
  const handleToggleMember = (memberId) => {
    setValues((prev) => {
      const current = prev.assigneeIds || [];
      const updated = current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId];
      return { ...prev, assigneeIds: updated };
    });
  };

  // Toggle label assignment
  const handleToggleLabel = (label) => {
    setValues((prev) => {
      const current = prev.labels || [];
      const updated = current.includes(label)
        ? current.filter((l) => l !== label)
        : [...current, label];
      return { ...prev, labels: updated };
    });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateTaskForm(values);
    setErrors(newErrors);
    setTouched({ title: true, deadline: true });

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await mockApi.createTask({
        projectId,
        title: values.title,
        description: values.description,
        status: defaultStatus,
        priority: values.priority,
        deadline: values.deadline,
        assigneeIds: values.assigneeIds,
        labels: values.labels,
        checklist: values.checklist
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean)
          .map((title, i) => ({
            id: `check-${Date.now()}-${i}`,
            title,
            completed: false,
          })),
      });

      navigate("/tasks", {
        state: {
          projectId,
          projectName,
          toast: {
            message: `Task "${values.title}" created successfully!`,
            type: "success",
          },
        },
      });
    } catch (err) {
      setToast({
        message: "Failed to create task: " + err.message,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-task-container">
      <div className="create-task-modal">
        <div className="btn-close-container">
          <Link
            to="/tasks"
            state={{ projectId, projectName }}
            className="btn-close"
          >
            ✕
          </Link>
        </div>

        <h1 className="create-task-title">
          <span>📝</span> Create New Task
          <span className="create-task-status-badge">
            in{" "}
            {defaultStatus === "todo"
              ? "To Do"
              : defaultStatus === "in_progress"
              ? "In Progress"
              : "Done"}
          </span>
        </h1>

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
            <div className="picker-wrapper">
              <button
                type="button"
                className="btn-picker"
                onClick={() => {
                  setShowMembersPopup((prev) => !prev);
                  setShowLabelsPopup(false);
                }}
              >
                <span>👤 Assign Members</span>
                <span className="picker-count">
                  {values.assigneeIds.length > 0
                    ? `(${values.assigneeIds.length} selected)`
                    : "▾"}
                </span>
              </button>

              {showMembersPopup && (
                <div className="popover-menu">
                  <div className="popover-header">
                    <span className="popover-title">Assign Members</span>
                    <button
                      type="button"
                      className="popover-close"
                      onClick={() => setShowMembersPopup(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="popover-list">
                    {students.map((member) => {
                      const isSelected = values.assigneeIds.includes(member.id);
                      return (
                        <div
                          key={member.id}
                          className={`popover-item ${
                            isSelected ? "selected" : ""
                          }`}
                          onClick={() => handleToggleMember(member.id)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="popover-checkbox"
                          />
                          <div className="member-avatar-sm">
                            {member.name.split(" ").pop().charAt(0)}
                          </div>
                          <div className="member-name-mssv">
                            <span className="member-name">{member.name}</span>
                            {member.mssv && (
                              <span className="member-mssv">
                                ({member.mssv})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Display selected members */}
            <div className="selected-chips-container">
              {values.assigneeIds.length > 0 ? (
                values.assigneeIds.map((id) => {
                  const member =
                    students.find((s) => s.id === id) ||
                    PREDEFINED_MEMBERS.find((s) => s.id === id) || {
                      id,
                      name: id,
                    };
                  return (
                    <span key={id} className="selected-member-chip">
                      <span className="member-avatar-xs">
                        {member.name.split(" ").pop().charAt(0)}
                      </span>
                      <span className="chip-label">{member.name}</span>
                      <button
                        type="button"
                        className="chip-remove-btn"
                        onClick={() => handleToggleMember(id)}
                        title="Remove member"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })
              ) : (
                <span className="empty-chips-hint">
                  No members assigned yet.
                </span>
              )}
            </div>
          </div>

          {/* Labels Dropdown / Popup */}
          <div className="form-group">
            <label className="form-label">Labels</label>
            <div className="picker-wrapper">
              <button
                type="button"
                className="btn-picker"
                onClick={() => {
                  setShowLabelsPopup((prev) => !prev);
                  setShowMembersPopup(false);
                }}
              >
                <span>🏷️ Select Labels</span>
                <span className="picker-count">
                  {values.labels.length > 0
                    ? `(${values.labels.length} selected)`
                    : "▾"}
                </span>
              </button>

              {showLabelsPopup && (
                <div className="popover-menu">
                  <div className="popover-header">
                    <span className="popover-title">Select Labels</span>
                    <button
                      type="button"
                      className="popover-close"
                      onClick={() => setShowLabelsPopup(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="popover-list">
                    {PREDEFINED_LABELS.map((label) => {
                      const isSelected = values.labels.includes(label);
                      return (
                        <div
                          key={label}
                          className={`popover-item ${
                            isSelected ? "selected" : ""
                          }`}
                          onClick={() => handleToggleLabel(label)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="popover-checkbox"
                          />
                          <span
                            className="task-label"
                            style={{
                              background: getLabelColor(label),
                              fontSize: "12px",
                              padding: "2px 8px",
                            }}
                          >
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Display selected labels */}
            <div className="selected-chips-container">
              {values.labels.length > 0 ? (
                values.labels.map((l) => (
                  <span
                    key={l}
                    className="selected-label-chip"
                    style={{ background: getLabelColor(l) }}
                  >
                    <span className="chip-label">{l}</span>
                    <button
                      type="button"
                      className="chip-remove-btn"
                      onClick={() => handleToggleLabel(l)}
                      title="Remove label"
                    >
                      ✕
                    </button>
                  </span>
                ))
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
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Submit */}
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </form>
      </div>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
