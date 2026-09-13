import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { mockApi } from "../services/mockApi";
import Toast from "../components/Toast";
import "../styles/CreateTask.css";

export default function CreateProject() {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: "",
    courseName: "",
    description: "",
    deadline: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const validate = (vals) => {
    const errs = {};
    if (!vals.name || vals.name.trim() === "") {
      errs.name = "Project name is required.";
    } else if (vals.name.trim().length < 3) {
      errs.name = "Project name must be at least 3 characters.";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validate({ ...values }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate(values);
    setErrors(newErrors);
    setTouched({ name: true });

    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await mockApi.createProject({
        name: values.name,
        courseName: values.courseName || "General",
        description: values.description,
        deadline: values.deadline,
      });

      navigate("/dashboard", {
        state: {
          toast: {
            message: `Project "${values.name}" created successfully!`,
            type: "success",
          },
        },
      });
    } catch (err) {
      setToast({
        message: "Failed to create project: " + err.message,
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
          <Link to="/dashboard" className="btn-close">
            ✕
          </Link>
        </div>

        <h1 className="create-task-title">
          <span>📁</span> Create New Project
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
      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
