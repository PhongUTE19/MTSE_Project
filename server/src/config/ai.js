// src/config/ai.js
import dotenv from "dotenv";

dotenv.config();

export const AI_CONFIG = {
  apiKey: process.env.GEMINI_API_KEY || "",
  model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
  requestTimeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS) || 30000,
};

/**
 * Checks whether the Gemini API key is configured.
 */
export function isAiConfigured() {
  return Boolean(AI_CONFIG.apiKey && AI_CONFIG.apiKey.trim().length > 0);
}
