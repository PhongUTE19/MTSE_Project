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
