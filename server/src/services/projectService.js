import { supabase } from "../config/supabase.js";
import { toApiProject } from "../utils/mappers.js";

export async function getAllProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(toApiProject);
}

export async function getProjectById(id) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return toApiProject(data);
}

export async function createProject(payload) {
  const dbPayload = {
    name: payload.name,
    course_name: payload.courseName || "General",
    description: payload.description || "",
    deadline: payload.deadline || null,
    created_by: payload.createdBy || "student-1",
    status: "active",
  };
  const { data, error } = await supabase.from("projects").insert(dbPayload).select().single();
  if (error) throw error;
  return toApiProject(data);
}

export async function deleteProject(id) {
  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return data ? { deletedId: data.id } : null;
}

