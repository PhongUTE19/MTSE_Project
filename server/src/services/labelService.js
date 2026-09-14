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

  if (Object.keys(dbPayload).length === 0) {
    const { data } = await supabase
      .from("labels")
      .select("*")
      .eq("id", labelId)
      .eq("project_id", projectId)
      .maybeSingle();
    return toApiLabel(data);
  }

  const { data, error } = await supabase
    .from("labels")
    .update(dbPayload)
    .eq("id", labelId)
    .eq("project_id", projectId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return toApiLabel(data);
}

export async function deleteLabel(projectId, labelId) {
  const { data, error } = await supabase
    .from("labels")
    .delete()
    .eq("id", labelId)
    .eq("project_id", projectId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return data ? { deletedId: data.id } : null;
}
