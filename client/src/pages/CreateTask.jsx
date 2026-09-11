// src/pages/CreateTask.jsx
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { validateTaskForm } from "../utils/validators";
import { tasks } from "../data/mockData";
import "../styles/CreateTask.css";

export default function CreateTask() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get default status if navigated from a specific column, else 'todo'
  const defaultStatus = location.state?.status || "todo";
  const projectId = location.state?.projectId || "project-1";
  const projectName = location.state?.projectName;

  // State cho form values, errors, touched
  const [values, setValues] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "medium",
    assigneeIds: "",
    labels: "",
    checklist: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Cập nhật value khi user gõ
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  // Validate khi user rời khỏi field
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validateTaskForm({ ...values }));
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = validateTaskForm(values);
    setErrors(newErrors);
    setTouched({ title: true, deadline: true });

    if (Object.keys(newErrors).length > 0) return;

    // TODO: gửi lên backend (Tuần sau)
    console.log("New task:", values);
    
    // Thêm vào mockData in-memory để hiển thị ngay trên UI
    const newTask = {
      id: `task-${Date.now()}`,
      projectId,
      title: values.title,
      description: values.description,
      status: defaultStatus,
      priority: values.priority,
      dueAt: new Date(values.deadline).toISOString(),
      assigneeIds: values.assigneeIds.split(",").map(s => s.trim()).filter(Boolean),
      labels: values.labels.split(",").map(s => s.trim()).filter(Boolean),
      checklist: values.checklist.split("\n").map(s => s.trim()).filter(Boolean).map((title, i) => ({ id: `check-${Date.now()}-${i}`, title, completed: false })),
      reminderMinutesBefore: [],
      createdAt: new Date().toISOString()
    };
    tasks.push(newTask);

    alert("Task created! (mock)");
    navigate("/tasks", { state: { projectId, projectName } });
  };

  // Render form in a modal-like layout 
  return (
    <div className="create-task-container">
      <div className="create-task-modal">
        
        <div className="btn-close-container">
           <Link to="/tasks" state={{ projectId, projectName }} className="btn-close">
             ✕
           </Link>
        </div>

        <h1 className="create-task-title">
          <span>📝</span> Create New Task
          <span className="create-task-status-badge">
            in {defaultStatus === "todo" ? "To Do" : defaultStatus === "in_progress" ? "In Progress" : "Done"}
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
              <span className="form-error">
                {errors.title}
              </span>
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
              <span className="form-error">
                {errors.deadline}
              </span>
            )}
          </div>

          {/* Members (Assignees) */}
          <div className="form-group">
            <label className="form-label">Members (comma separated IDs)</label>
            <input
              type="text"
              name="assigneeIds"
              value={values.assigneeIds}
              onChange={handleChange}
              placeholder="e.g. st-1, st-2"
              className="form-input"
            />
          </div>

          {/* Labels */}
          <div className="form-group">
            <label className="form-label">Labels (comma separated)</label>
            <input
              type="text"
              name="labels"
              value={values.labels}
              onChange={handleChange}
              placeholder="e.g. Frontend, Urgent"
              className="form-input"
            />
          </div>

          {/* Acceptance Criteria */}
          <div className="form-group">
            <label className="form-label">Acceptance Criteria (one per line)</label>
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
          <button type="submit" className="btn-submit">
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
}
