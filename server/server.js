// server.js
import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import { checkSupabaseConnection } from "./src/config/supabase.js";

const PORT = process.env.PORT || 5000;

async function start() {
  console.log("[INFO] Starting MANA server...");

  const connected = await checkSupabaseConnection();
  if (!connected) {
    console.error("[ERROR] Cannot connect to Supabase. Exiting.");
    process.exit(1);
  }

  console.log("[INFO] Supabase connected successfully");

  app.listen(PORT, () => {
    console.log(`[INFO] Server started on port ${PORT}`);
    console.log(`[INFO] Health check: http://localhost:${PORT}/api/health`);
  });
}

start();