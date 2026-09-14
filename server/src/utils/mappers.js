export function toApiProject(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    courseName: row.course_name,
    description: row.description,
    deadline: row.deadline,
    createdBy: row.created_by,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toApiTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    startAt: row.start_at,
    dueAt: row.due_at,
    assigneeIds: row.assignee_ids || [],
    labels: row.labels || [],
    checklist: row.checklist || [],
    reminderMinutesBefore: row.reminder_minutes_before || [],
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

export function toApiDashboardStats(row) {
  if (!row) return null;
  return {
    totalProjects: row.total_projects,
    totalTasks: row.total_tasks,
    doneTasks: row.done_tasks,
    inProgressTasks: row.in_progress_tasks,
    overdueTasks: row.overdue_tasks,
  };
}
