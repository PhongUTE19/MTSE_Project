// src/config/supabase.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
}

// Service role client — bypass RLS, dùng ở BACKEND
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Health check function
export async function checkSupabaseConnection() {
  try {
    const { error } = await supabase.from("projects").select("id").limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[ERROR] Supabase connection failed:", error.message);
    return false;
  }
}