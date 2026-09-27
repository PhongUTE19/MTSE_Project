import { supabase } from "../config/supabase.js";
import { toApiLabel } from "../utils/mappers.js";

export async function getLabels(projectId) {
  const { data, error } = await supabase
    .from("labels")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(toApiLabel);
}

export async function createLabel(projectId, payload) {
  const dbPayload = {
    project_id: projectId,
    name: payload.name,
    color: payload.color || "#579dff",
  };
  const { data, error } = await supabase
    .from("labels")
    .insert(dbPayload)
    .select()
    .single();
  if (error) throw error;
  return toApiLabel(data);
}

export async function updateLabel(projectId, labelId, payload) {
  const dbPayload = {};
  if (payload.name !== undefined) dbPayload.name = payload.name;
  if (payload.color !== undefined) dbPayload.color = payload.color;

  const { data: oldLabel } = await supabase
    .from("labels")
    .select("*")
    .eq("id", labelId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (Object.keys(dbPayload).length === 0) {
    return toApiLabel(oldLabel);
  }

  const { data, error } = await supabase
    .from("labels")
    .update(dbPayload)
    .eq("id", labelId)
    .eq("project_id", projectId)
    .select()
    .maybeSingle();
  if (error) throw error;

  // Cascade name change to tasks
  if (oldLabel && payload.name && oldLabel.name !== payload.name) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, labels")
      .eq("project_id", projectId)
      .contains("labels", [oldLabel.name]);
      
    if (tasks && tasks.length > 0) {
      for (const task of tasks) {
        const newLabels = task.labels.map(l => l === oldLabel.name ? payload.name : l);
        await supabase.from("tasks").update({ labels: newLabels }).eq("id", task.id);
      }
    }
  }

  return toApiLabel(data);
}

export async function deleteLabel(projectId, labelId) {
  const { data: labelData } = await supabase
    .from("labels")
    .select("name")
    .eq("id", labelId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (!labelData) return null;
  const labelName = labelData.name;

  const { data, error } = await supabase
    .from("labels")
    .delete()
    .eq("id", labelId)
    .eq("project_id", projectId)
    .select("id")
    .maybeSingle();
  if (error) throw error;

  // Cascade deletion to tasks
  if (data) {
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, labels")
      .eq("project_id", projectId)
      .contains("labels", [labelName]);
      
    if (tasks && tasks.length > 0) {
      for (const task of tasks) {
        const newLabels = task.labels.filter(l => l !== labelName);
        await supabase.from("tasks").update({ labels: newLabels }).eq("id", task.id);
      }
    }
  }

  return data ? { deletedId: data.id } : null;
}
