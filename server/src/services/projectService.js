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

