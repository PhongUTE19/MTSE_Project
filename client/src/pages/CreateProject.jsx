import { FolderPlus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useCreateProject } from "../hooks/useCreateProject";
import "../styles/CreateTask.css";

export default function CreateProject() {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useCreateProject();

  return (
    <div className="create-task-container" role="presentation">
      <div className="create-task-modal" role="dialog" aria-modal="true" aria-label="Create project">
        <div className="btn-close-container">
          <Link to="/dashboard" className="btn-close" aria-label="Close">
            <X size={18} aria-hidden="true" />
          </Link>
        </div>

        <h1 className="create-task-title">
          <FolderPlus size={18} aria-hidden="true" /> Create New Project
        </h1>

        <form onSubmit={handleSubmit} className="create-task-form">
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              type="text"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g. Student Task & Deadline Manager"
              className="form-input"
            />
            {touched.name && errors.name && (
              <span className="form-error">{errors.name}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Course Name</label>
            <input
              type="text"
              name="courseName"
              value={values.courseName}
              onChange={handleChange}
              placeholder="e.g. New Technologies in Software Engineering"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={values.description}
              onChange={handleChange}
              placeholder="Describe project objectives and scope..."
              className="form-textarea"
            />
          </div>

          <div className="form-group-last">
            <label className="form-label">Project Deadline</label>
            <input
              type="date"
              name="deadline"
              value={values.deadline}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Project"}
          </button>
        </form>
      </div>
    </div>
  );
}
