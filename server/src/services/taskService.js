import { supabase } from "../config/supabase.js";
import { toApiTask } from "../utils/mappers.js";

export async function getAllTasks({ projectId, status }) {
  let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });
  if (projectId) query = query.eq("project_id", projectId);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(toApiTask);
}

export async function getTaskById(id) {
  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return toApiTask(data);
}

export async function createTask(payload) {
  const dbPayload = {
    project_id: payload.projectId,
    title: payload.title,
    description: payload.description || "",
    status: payload.status || "todo",
    priority: payload.priority || "medium",
    start_at: payload.startAt || null,
    due_at: payload.dueAt,
    assignee_ids: payload.assigneeIds || [],
    labels: payload.labels || [],
    checklist: payload.checklist || [],
    reminder_minutes_before: payload.reminderMinutesBefore || [],
  };
  const { data, error } = await supabase.from("tasks").insert(dbPayload).select().single();
  if (error) throw error;
  return toApiTask(data);
}

export async function updateTask(id, payload) {
  const dbPayload = {};
  if (payload.title !== undefined) dbPayload.title = payload.title;
  if (payload.description !== undefined) dbPayload.description = payload.description;
  if (payload.status !== undefined) dbPayload.status = payload.status;
  if (payload.priority !== undefined) dbPayload.priority = payload.priority;
  if (payload.startAt !== undefined) dbPayload.start_at = payload.startAt;
  if (payload.dueAt !== undefined) dbPayload.due_at = payload.dueAt;
  if (payload.assigneeIds !== undefined) dbPayload.assignee_ids = payload.assigneeIds;
  if (payload.labels !== undefined) dbPayload.labels = payload.labels;
  if (payload.checklist !== undefined) dbPayload.checklist = payload.checklist;
  if (payload.reminderMinutesBefore !== undefined) dbPayload.reminder_minutes_before = payload.reminderMinutesBefore;

  if (Object.keys(dbPayload).length === 0) return getTaskById(id);
  const { data, error } = await supabase.from("tasks").update(dbPayload).eq("id", id).select().maybeSingle();
  if (error) throw error;
  return toApiTask(data);
}

export async function deleteTask(id) {
  const { data, error } = await supabase.from("tasks").delete().eq("id", id).select("id").maybeSingle();
  if (error) throw error;
  return data ? { deletedId: data.id } : null;
}
