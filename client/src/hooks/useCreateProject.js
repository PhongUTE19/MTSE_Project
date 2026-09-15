// src/hooks/useCreateProject.js
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { validateProjectForm } from "../utils/validators";
import { projectService } from "../services/projectService";
import { useToast } from "../context/ToastContext";

const INITIAL_VALUES = {
  name: "",
  courseName: "",
  description: "",
  deadline: "",
};

/**
 * Custom hook encapsulating Create Project form state, validation, and submission flow.
 */
export function useCreateProject() {
  const navigate = useNavigate();
  const { showError } = useToast();

  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validateProjectForm({ ...values }));
  }, [values]);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    const validationErrors = validateProjectForm(values);
    setErrors(validationErrors);
    setTouched((prev) => ({ ...prev, name: true }));

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await projectService.createProject(values);

      navigate("/dashboard", {
        state: {
          toast: {
            message: `Project "${values.name}" created successfully!`,
            type: "success",
          },
        },
      });
    } catch (err) {
      showError("Failed to create project: " + (err?.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}

