// src/utils/date.js

/**
 * Safely format an ISO string, timestamp, or Date object to YYYY-MM-DD for <input type="date">.
 * Returns an empty string if input is null, undefined, or invalid.
 */
export function formatDateForInput(dateValue) {
  if (!dateValue) return "";
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

/**
 * Safely convert a YYYY-MM-DD date input string into an ISO string.
 * Returns null if input is empty or invalid.
 */
export function parseInputToIsoDate(dateString) {
  if (!dateString || typeof dateString !== "string" || !dateString.trim()) {
    return null;
  }
  try {
    const d = new Date(dateString.trim());
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch {
    return null;
  }
}

/**
 * Safely format an ISO string, timestamp, or Date object for user display.
 * Returns fallback (default "-") if date is missing or invalid.
 *
 * @param {string|number|Date} dateValue
 * @param {string} [fallback="-"]
 * @returns {string}
 */
export function formatDisplayDate(dateValue, fallback = "-") {
  if (!dateValue) return fallback;
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString();
  } catch {
    return fallback;
  }
}

/**
 * Format a date to short day/month representation (e.g. "15/09").
 *
 * @param {string|number|Date} dateValue
 * @param {string} [fallback=""]
 * @returns {string}
 */
export function formatShortDate(dateValue, fallback = "") {
  if (!dateValue) return fallback;
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString("en-GB").slice(0, 5);
  } catch {
    return fallback;
  }
}
