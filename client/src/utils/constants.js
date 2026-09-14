// src/utils/constants.js

export const INITIAL_MEMBERS = [
  { id: "student-1", name: "Bùi Duy Phong", mssv: "19110131" },
  { id: "student-2", name: "Trần Thị Tố Như", mssv: "23110051" },
  { id: "student-3", name: "Văn Phạm Thảo Nhi", mssv: "23110049" },
];

export const INITIAL_LABELS = [
  "Planning",
  "Frontend",
  "Backend",
  "Research",
  "UI/UX",
  "Testing",
  "Bug",
];

export const LABEL_COLOR_PALETTE = [
  "#baf3db", "#f8e6a0", "#f5cd47", "#fedec8", "#eac7f0",
  "#4bce97", "#e2b203", "#f87462", "#9f8fef", "#1f845a",
  "#946f00", "#b38600", "#ae2e24", "#5e4db2", "#cce0ff",
  "#c1e5ff", "#fdd0ec", "#dcdfe4", "#579dff", "#94c748",
  "#e774bb", "#8590a2", "#0c66e4", "#5b7f24", "#44546f",
];

export const normalizeLabelName = (name) => {
  if (!name) return "";
  return name.trim().replace(/\s+/g, " ");
};

export const labelsAreEqual = (a, b) => {
  return normalizeLabelName(a).toLowerCase() === normalizeLabelName(b).toLowerCase();
};

export const findLabelByName = (labelsList, name) => {
  if (!Array.isArray(labelsList) || !name) return null;
  return labelsList.find(l => labelsAreEqual(l.name, name)) || null;
};

export const getLabelColor = (label) => {
  if (!label) return "#579dff";
  const colors = ["#4bce97", "#e2b203", "#f87168", "#9f8fef", "#579dff"];
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash += label.charCodeAt(i);
  return colors[Math.abs(hash) % colors.length];
};

export const getStudentName = (studentsList, id) => {
  const s =
    (studentsList || []).find((st) => st.id === id) ||
    INITIAL_MEMBERS.find((st) => st.id === id);
  return s ? s.name : id;
};

export const DEFAULT_STATUSES = [
  { id: "todo", name: "To Do" },
  { id: "in_progress", name: "In Progress" },
  { id: "done", name: "Done" },
];

export const getStatusLabel = (statusesList, statusId) => {
  if (!statusId) return "";
  const found =
    (statusesList || []).find((s) => s.id === statusId) ||
    DEFAULT_STATUSES.find((s) => s.id === statusId);
  return found ? found.name : statusId;
};

export const PRIORITIES = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
];

export const REMINDER_OPTIONS = [
  { value: "", label: "None", minutes: null },
  { value: "15", label: "15 phút trước", minutes: 15 },
  { value: "60", label: "1 giờ trước", minutes: 60 },
  { value: "1440", label: "1 ngày trước", minutes: 1440 },
];

export const DEFAULT_COURSE_NAME = "General";
export const DEFAULT_TASK_STATUS = "todo";


