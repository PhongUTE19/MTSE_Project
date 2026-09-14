import { supabase } from "../config/supabase.js";
import { toApiDashboardStats } from "../utils/mappers.js";

export async function getDashboardStats() {
  const { data, error } = await supabase.from("dashboard_stats").select("*").maybeSingle();
  if (error) throw error;
  return toApiDashboardStats(data);
}
