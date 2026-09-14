// src/utils/validators.js

/**
 * Validate form Create Task.
 * @param {{title: string, description: string, deadline: string, priority: string}} values
 * @returns {{title?: string, deadline?: string}}
 */
export function validateTaskForm(values) {
  const errors = {};

  // ----- Title -----
  if (!values.title || values.title.trim() === "") {
    errors.title = "Title is required.";
  } else if (values.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters.";
  }

  // ----- Deadline -----
  if (!values.deadline) {
    errors.deadline = "Deadline is required.";
  } else {
    const deadlineDate = new Date(values.deadline);
    const now = new Date();

    if (isNaN(deadlineDate.getTime())) {
      errors.deadline = "Invalid deadline format.";
    } else if (deadlineDate < now) {
      errors.deadline = "Deadline cannot be in the past.";
    }
  }

  return errors;
}

/**
 * Validate form Create Project.
 * @param {{name?: string, courseName?: string, description?: string, deadline?: string}} values
 * @returns {{name?: string}}
 */
export function validateProjectForm(values) {
  const errors = {};

  if (!values?.name || values.name.trim() === "") {
    errors.name = "Project name is required.";
  } else if (values.name.trim().length < 3) {
    errors.name = "Project name must be at least 3 characters.";
  }

  return errors;
}

/**
 * Validate Member Form in Settings.
 * @param {{name?: string, mssv?: string, email?: string}} values
 * @returns {{name?: string, mssv?: string, email?: string}}
 */
export function validateMemberForm(values) {
  const errors = {};

  if (!values?.name || values.name.trim() === "") {
    errors.name = "Member name is required.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Member name must be at least 2 characters.";
  }

  if (!values?.mssv || values.mssv.trim() === "") {
    errors.mssv = "MSSV is required.";
  } else if (!/^[0-9A-Za-z_-]{3,20}$/.test(values.mssv.trim())) {
    errors.mssv = "MSSV must be between 3 and 20 alphanumeric characters.";
  }

  if (!values?.email || values.email.trim() === "") {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Invalid email format.";
  }

  return errors;
}
