// src/utils/taskHelpers.js
import { getLabelColor } from "./constants";
export { formatShortDate } from "./date";

/**
 * Convert newline-separated checklist text into an array of checklist items.
 * Ignores empty/whitespace lines.
 *
 * @param {string} rawText - Multi-line string containing checklist items
 * @returns {Array<{ id: string, title: string, completed: boolean }>}
 */
export function parseChecklistInput(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return [];
  }

  const timestamp = Date.now();
  return rawText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((title, i) => ({
      id: `check-${timestamp}-${i}`,
      title,
      completed: false,
    }));
}

/**
 * Toggle the completion status of a checklist item.
 * @param {Array<{id: string, title: string, completed: boolean}>} checklist
 * @param {string} itemId
 * @returns {Array<{id: string, title: string, completed: boolean}>}
 */
export function toggleChecklistItem(checklist = [], itemId) {
  if (!Array.isArray(checklist)) return [];
  return checklist.map((item) =>
    item.id === itemId ? { ...item, completed: !item.completed } : item
  );
}

/**
 * Add a new checklist item with auto-generated ID.
 * @param {Array<{id: string, title: string, completed: boolean}>} checklist
 * @param {string} title
 * @returns {Array<{id: string, title: string, completed: boolean}>}
 */
export function addChecklistItem(checklist = [], title) {
  const trimmed = title?.trim();
  if (!trimmed) return checklist || [];
  const newItem = {
    id: `check-${Date.now()}`,
    title: trimmed,
    completed: false,
  };
  return [...(checklist || []), newItem];
}

/**
 * Update the title of a checklist item.
 * @param {Array<{id: string, title: string, completed: boolean}>} checklist
 * @param {string} itemId
 * @param {string} newTitle
 * @returns {Array<{id: string, title: string, completed: boolean}>}
 */
export function updateChecklistItem(checklist = [], itemId, newTitle) {
  const trimmed = newTitle?.trim();
  if (!trimmed || !Array.isArray(checklist)) return checklist || [];
  return checklist.map((item) =>
    item.id === itemId ? { ...item, title: trimmed } : item
  );
}

/**
 * Remove a checklist item by ID.
 * @param {Array<{id: string, title: string, completed: boolean}>} checklist
 * @param {string} itemId
 * @returns {Array<{id: string, title: string, completed: boolean}>}
 */
export function removeChecklistItem(checklist = [], itemId) {
  if (!Array.isArray(checklist)) return [];
  return checklist.filter((item) => item.id !== itemId);
}

/**
 * Toggle the inclusion of an item within an array.
 * Returns a new array with the item removed if it exists, or appended if it does not.
 *
 * @template T
 * @param {T[]} list - Current array
 * @param {T} item - Item to toggle
 * @returns {T[]}
 */
export function toggleArrayItem(list = [], item) {
  if (!Array.isArray(list)) {
    return [item];
  }
  return list.includes(item)
    ? list.filter((i) => i !== item)
    : [...list, item];
}

/**
 * Calculate checklist completion progress.
 * Returns null if checklist is empty or invalid.
 *
 * @param {Array<{completed?: boolean}>} checklist
 * @returns {{ text: string, isAllChecked: boolean, completed: number, total: number } | null}
 */
export function getChecklistProgress(checklist) {
  if (!Array.isArray(checklist) || checklist.length === 0) {
    return null;
  }
  const completed = checklist.filter((c) => Boolean(c && c.completed)).length;
  const total = checklist.length;
  return {
    text: `${completed}/${total}`,
    isAllChecked: completed === total,
    completed,
    total,
  };
}

/**
 * Determine if a task due date is in the past.
 *
 * @param {string|number|Date} dueAt
 * @returns {boolean}
 */
export function isTaskOverdue(dueAt) {
  if (!dueAt) return false;
  try {
    const d = new Date(dueAt);
    if (isNaN(d.getTime())) return false;
    return d.getTime() < Date.now();
  } catch {
    return false;
  }
}

/**
 * Find a member by ID from a members list with safe fallback object.
 * @param {Array<{id: string, name: string, mssv?: string}>} members
 * @param {string} memberId
 * @returns {{ id: string, name: string, mssv?: string }}
 */
export function getMemberById(members = [], memberId) {
  if (!memberId) return { id: "", name: "" };
  const found = Array.isArray(members)
    ? members.find((m) => m.id === memberId)
    : null;
  return found || { id: memberId, name: memberId };
}

/**
 * Resolve display color for a label from a labels list or fallback generator.
 * @param {Array<{name: string, color: string}>} labels
 * @param {string} labelName
 * @returns {string}
 */
export function resolveLabelColor(labels = [], labelName) {
  if (!labelName) return getLabelColor("");
  const found = Array.isArray(labels)
    ? labels.find((l) => l.name.toLowerCase() === labelName.toLowerCase())
    : null;
  return found?.color || getLabelColor(labelName);
}
