export async function getStatuses(projectId) {
  return [
    { id: "todo", projectId, name: "To Do" },
    { id: "in_progress", projectId, name: "In Progress" },
    { id: "done", projectId, name: "Done" },
  ];
}

export async function createStatus(projectId, payload) {
  const id = (payload?.name || "status")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");
  return {
    id,
    projectId,
    name: payload?.name || "New Status",
  };
}
