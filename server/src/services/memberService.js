import { supabase } from "../config/supabase.js";
import { toApiMember } from "../utils/mappers.js";

export async function getMembers(projectId) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(toApiMember);
}

export async function createMember(projectId, payload) {
  const dbPayload = {
    project_id: projectId,
    name: payload.name,
    mssv: payload.mssv,
    email: payload.email,
  };
  const { data, error } = await supabase
    .from("members")
    .insert(dbPayload)
    .select()
    .single();
  if (error) throw error;
  return toApiMember(data);
}

export async function updateMember(projectId, memberId, payload) {
  const dbPayload = {};
  if (payload.name !== undefined) dbPayload.name = payload.name;
  if (payload.mssv !== undefined) dbPayload.mssv = payload.mssv;
  if (payload.email !== undefined) dbPayload.email = payload.email;

  if (Object.keys(dbPayload).length === 0) {
    const { data } = await supabase
      .from("members")
      .select("*")
      .eq("id", memberId)
      .eq("project_id", projectId)
      .maybeSingle();
    return toApiMember(data);
  }

  const { data, error } = await supabase
    .from("members")
    .update(dbPayload)
    .eq("id", memberId)
    .eq("project_id", projectId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return toApiMember(data);
}

export async function deleteMember(projectId, memberId) {
  const { data, error } = await supabase
    .from("members")
    .delete()
    .eq("id", memberId)
    .eq("project_id", projectId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return data ? { deletedId: data.id } : null;
}
