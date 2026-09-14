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

export const PREDEFINED_MEMBERS = INITIAL_MEMBERS;
export const PREDEFINED_LABELS = INITIAL_LABELS;

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
    PREDEFINED_MEMBERS.find((st) => st.id === id);
  return s ? s.name : id;
};
